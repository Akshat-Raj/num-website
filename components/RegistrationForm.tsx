"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HumanCheck from "./human-check";

type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; teamId: string; email: string }
  | { type: "error"; message: string };

const formVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function RegistrationForm() {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [humanToken, setHumanToken] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string>("");
  const [idNames, setIdNames] = useState<Record<number, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const features = useMemo(
    () => [
      "Unique Team ID generated instantly",
      "ID card verification with file checks",
      "Automated confirmation email",
    ],
    []
  );

  const disableForm = status.type === "submitting";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!humanToken) {
      setStatus({ type: "error", message: "Please complete the human verification first." });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("humanToken", humanToken);

    setStatus({ type: "submitting" });
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.message ?? "Registration failed");
      }

      setStatus({ type: "success", teamId: payload.teamId, email: payload.email });
      setIdNames({});
      setTeamSize("");
      formRef.current?.reset();
      setHumanToken(null);
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <div className="glass" style={{ padding: 24 }}>
      <div className="grid two" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="card-title" style={{ marginBottom: 8 }}>
            One flow, three checks
          </div>
          <p className="card-sub" style={{ marginBottom: 14 }}>
            Verify you are human, upload team ID cards, and receive a Team ID with confirmation
            email. No extra dashboards required.
          </p>
          <div className="chip-grid" style={{ marginBottom: 16 }}>
            {features.map((feat) => (
              <span key={feat} className="chip">
                {feat}
              </span>
            ))}
          </div>
          <div className="glass" style={{ padding: 14, marginTop: 12 }}>
            <div className="card-title">Security notes</div>
            <p className="card-sub">
              We validate file type and size locally, never store more than required, and you can
              request deletion anytime.
            </p>
          </div>
        </div>

        <motion.form
          ref={formRef}
          className="form"
          variants={formVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label>Human verification</label>
            <HumanCheck onVerify={setHumanToken} verified={!!humanToken} />
            <small>
              Uses reCAPTCHA v2 when a site key is provided, otherwise a built-in checkbox fallback.
            </small>
          </div>

          <div className="field">
            <label htmlFor="teamSize">Team size</label>
            <select
              id="teamSize"
              name="teamSize"
              required
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
            >
              <option value="">Select team size</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            <small>Team size must be between 2-4 members</small>
          </div>

          {teamSize && (
            <div style={{ marginTop: 24 }}>
              {Array.from({ length: parseInt(teamSize) }, (_, i) => (
                <motion.div
                  key={i}
                  className="glass"
                  style={{ padding: 20, marginBottom: 16 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="card-title" style={{ marginBottom: 16 }}>
                    Team Member {i + 1}
                  </div>

                  <div className="field">
                    <label htmlFor={`name-${i}`}>Name</label>
                    <input
                      id={`name-${i}`}
                      name={`members[${i}][name]`}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid two">
                    <div className="field">
                      <label htmlFor={`contactNumber-${i}`}>Contact number</label>
                      <input
                        id={`contactNumber-${i}`}
                        name={`members[${i}][contactNumber]`}
                        type="tel"
                        required
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`email-${i}`}>Email</label>
                      <input
                        id={`email-${i}`}
                        name={`members[${i}][email]`}
                        type="email"
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor={`usn-${i}`}>USN (optional)</label>
                    <input
                      id={`usn-${i}`}
                      name={`members[${i}][usn]`}
                      placeholder="USN123456"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor={`idCard-${i}`}>Upload ID card</label>
                    <label className="file-trigger">
                      <span aria-hidden>⬆</span> Choose file
                      <input
                        className="file-input-hidden"
                        id={`idCard-${i}`}
                        name={`idCards[${i}]`}
                        type="file"
                        accept="image/*,.pdf"
                        required
                        onChange={(e) =>
                          setIdNames((prev) => ({
                            ...prev,
                            [i]: e.target.files?.[0]?.name ?? "",
                          }))
                        }
                      />
                    </label>
                    <small>Accepted: PDF or images up to 5MB.</small>
                    {idNames[i] && (
                      <small style={{ color: "#c9d4ff" }}>Selected: {idNames[i]}</small>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button className="button" type="submit" disabled={disableForm}>
              {status.type === "submitting" ? "Submitting..." : "Generate Team ID"}
            </button>
            <span className="card-sub">You will receive a confirmation email after approval.</span>
          </div>

          <AnimatePresence>
            {status.type === "error" && (
              <motion.div
                className="status error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {status.message}
              </motion.div>
            )}
            {status.type === "success" && (
              <motion.div
                className="status success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                Team registered successfully. Your Team ID is <strong>{status.teamId}</strong>. A
                confirmation was sent to {status.email}.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  );
}

