"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await apiRequest<{ detail: string }>(
        "/api/auth/password-reset/",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        false,
      );
      setFeedback({ type: "success", message: result.detail });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not request a password reset.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="password-flow-page password-flow-forgot-page">
      <div className="password-flow-shell">
        <header className="password-flow-header">
          <Link className="password-flow-logo" href="/login" aria-label="TrackIt home">
            <span className="password-flow-logo-mark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <strong>TrackIt</strong>
          </Link>
        </header>

        <div className="password-flow-main">
          <section className="password-flow-forgot-content">
            <span className="password-flow-eyebrow">ACCOUNT RECOVERY</span>
            <h1>Forgot your password?</h1>
            <p>Please enter the email address you used to create your account. We&apos;ll send you a link to reset your password.</p>
            <form className="password-flow-form" onSubmit={handleSubmit}>
              <label htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
            {feedback && <p className={`login-feedback ${feedback.type}`} role="status">{feedback.message}</p>}
            <p className="password-flow-signin-prompt">
              Remember your password? <Link href="/login">Back to sign in</Link>
            </p>
          </section>

          <aside className="password-flow-reassurance" aria-label="TrackIt account security">
            <div className="password-flow-reassurance-art" aria-hidden="true">
              <div className="password-flow-orbit password-flow-orbit-one" />
              <div className="password-flow-orbit password-flow-orbit-two" />
              <div className="password-flow-shield">
                <svg viewBox="0 0 48 48">
                  <path d="M24 5 39 11v11c0 10-6.4 17-15 21C15.4 39 9 32 9 22V11l15-6Z" />
                  <polyline points="17 24 22 29 32 18" />
                </svg>
              </div>
              <span className="password-flow-spark password-flow-spark-one" />
              <span className="password-flow-spark password-flow-spark-two" />
            </div>
            <h2>Your account, secure</h2>
            <p>We&apos;ll help you get back to your tasks and workspaces safely.</p>
          </aside>
        </div>

      </div>
    </main>
  );
}
