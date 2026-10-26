"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "The passwords do not match." });
      return;
    }

    const resetParams = new URLSearchParams(window.location.hash.slice(1));
    const uid = resetParams.get("uid");
    const token = resetParams.get("token");
    if (!uid || !token) {
      setFeedback({ type: "error", message: "This reset link is invalid or incomplete. Request a new one." });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ detail: string }>(
        "/api/auth/password-reset/confirm/",
        {
          method: "POST",
          body: JSON.stringify({ uid, token, new_password: password }),
        },
        false,
      );
      setIsComplete(true);
      setFeedback({ type: "success", message: result.detail });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not reset your password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="password-flow-page">
      <section className="password-flow-card">
        <Link className="password-flow-brand" href="/login">TrackIt</Link>
        <h1>Choose a new password</h1>
        <p>Enter and confirm the new password for your account.</p>
        {!isComplete && (
          <form className="password-flow-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Reset password"}
            </button>
          </form>
        )}
        {feedback && <p className={`login-feedback ${feedback.type}`} role="status">{feedback.message}</p>}
        <Link className="password-flow-back" href="/login">Back to sign in</Link>
      </section>
    </main>
  );
}
