"use client";

import { motion } from "framer-motion";
import RegistrationForm from "../components/RegistrationForm";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main>
      <div className="container">
        <nav className="nav">
          <div className="nav-brand">
            <div className="pill">Numerano</div>
            <span>Team Registration</span>
          </div>
        </nav>

        <section className="section" id="register">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass"
            style={{ position: "relative", overflow: "hidden" }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-20% 15% auto 15%",
                height: 200,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(127,90,240,0.35), rgba(5,2,18,0.5))",
                filter: "blur(80px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p className="badge">Numerano</p>
              <h1 className="section-title" style={{ fontSize: "clamp(36px, 6vw, 48px)" }}>
                Verify your team and get a unique Team ID
              </h1>
              <p className="section-subtitle">
                Complete a quick human verification, upload ID cards, and receive an automated
                confirmation email with your Team ID.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Human check • ID upload • Confirmation email</h2>
          </div>
          <RegistrationForm />
        </section>
      </div>
    </main>
  );
}

