"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

type Props = {
  onVerify: (token: string | null) => void;
  verified: boolean;
};

export default function HumanCheck({ onVerify, verified }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [checked, setChecked] = useState(false);
  const [reCaptchaReady, setReCaptchaReady] = useState(Boolean(siteKey));

  useEffect(() => {
    if (!siteKey) {
      setReCaptchaReady(false);
    }
  }, [siteKey]);

  const fallbackId = useMemo(() => `human-fallback-${Math.random().toString(36).slice(2)}`, []);

  if (siteKey) {
    return (
      <div className="glass" style={{ padding: 10 }}>
        <ReCAPTCHA
          sitekey={siteKey}
          theme="dark"
          onChange={(token) => onVerify(token ?? null)}
          onExpired={() => onVerify(null)}
        />
        {!reCaptchaReady && (
          <p className="card-sub" style={{ marginTop: 8 }}>
            Loading verification...
          </p>
        )}
      </div>
    );
  }

  return (
    <label
      htmlFor={fallbackId}
      className="glass"
      style={{
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
      }}
    >
      <input
        id={fallbackId}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          onVerify(e.target.checked ? "fallback-token" : null);
        }}
      />
      <div>
        <div className="card-title" style={{ fontSize: 15 }}>
          I’m not a robot
        </div>
        <p className="card-sub" style={{ margin: 0 }}>
          Numerano reCAPTCHA v2 fallback
        </p>
      </div>
      {verified && (
        <span className="chip" style={{ marginLeft: "auto" }}>
          Verified
        </span>
      )}
    </label>
  );
}

