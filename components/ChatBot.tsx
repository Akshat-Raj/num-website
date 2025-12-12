"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="button"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          padding: 0,
          zIndex: 50,
          fontSize: 24,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: "min(400px, calc(100vw - 48px))",
              height: "min(600px, calc(100vh - 150px))",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(127, 90, 240, 0.15)",
              }}
            >
              <div className="card-title">Numerano Assistant</div>
              <p className="card-sub" style={{ margin: 0, fontSize: 13 }}>
                Ask me anything about team registration
              </p>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 40 }}>
                  <p>👋 Hi! I'm here to help with team registration.</p>
                  <p style={{ fontSize: 14 }}>
                    Ask me about team requirements, ID verification, or the registration process.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background:
                        msg.role === "user"
                          ? "rgba(127, 90, 240, 0.2)"
                          : "rgba(255, 255, 255, 0.06)",
                      border: `1px solid ${
                        msg.role === "user"
                          ? "rgba(127, 90, 240, 0.4)"
                          : "rgba(255, 255, 255, 0.08)"
                      }`,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ alignSelf: "flex-start" }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14 }}>Thinking...</p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                padding: "16px",
                borderTop: "1px solid var(--border)",
                background: "rgba(5, 2, 18, 0.95)",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about registration..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text)",
                    fontSize: 14,
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="button"
                  style={{
                    padding: "12px 20px",
                    minHeight: "auto",
                    width: "auto",
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
