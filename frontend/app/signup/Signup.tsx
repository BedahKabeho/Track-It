"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Icon from "@/app/components/Icon";
import { apiRequest } from "@/lib/api";

type SignupStep = "details" | "code" | "password" | "success";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function PasswordField({ id, label, placeholder, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="signup-field">
      <label htmlFor={id}>{label}*</label>
      <div className="signup-input-wrap">
        <Icon name="lock" size={16} />
        <input
          autoComplete="new-password"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="password-visibility"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          <Icon name={visible ? "eye-off" : "eye"} size={17} />
        </button>
      </div>
    </div>
  );
}

export default function SignupForm() {
  const [step, setStep] = useState<SignupStep>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendVerificationCode() {
    setMessage("");
    setMessageType("");
    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ detail: string }>(
        "/api/auth/register/send-code/",
        {
          method: "POST",
          body: JSON.stringify({
            full_name: fullName,
            email,
            terms_accepted: termsAccepted,
          }),
        },
        false,
      );
      setCode("");
      setMessageType("success");
      setMessage(result.detail);
      setStep("code");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Could not send the verification code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendVerificationCode();
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageType("");
    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ detail: string; verification_token: string }>(
        "/api/auth/register/verify-code/",
        {
          method: "POST",
          body: JSON.stringify({ email, code }),
        },
        false,
      );
      setVerificationToken(result.verification_token);
      setMessageType("success");
      setMessage(result.detail);
      setStep("password");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Could not verify the email code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Your passwords do not match.");
      return;
    }

    setMessage("");
    setMessageType("");
    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ detail: string }>("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify({ verification_token: verificationToken, password }),
      }, false);
      setMessageType("success");
      setMessage(result.detail);
      setStep("success");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <div className="signup-success" role="status">
        <p aria-live="polite" className="signup-message success">{message}</p>
        <Link className="signup-submit signup-success-link" href="/login">Go to sign in</Link>
      </div>
    );
  }

  return (
    <>
      {step === "details" && (
        <form className="signup-form" onSubmit={handleDetailsSubmit}>
          <div className="signup-field">
            <label htmlFor="full-name">Full Name*</label>
            <div className="signup-input-wrap">
              <Icon name="user" size={16} />
              <input
                autoComplete="name"
                id="full-name"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                required
                value={fullName}
              />
            </div>
          </div>
          <div className="signup-field">
            <label htmlFor="email">Email Address*</label>
            <div className="signup-input-wrap">
              <Icon name="mail" size={16} />
              <input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                required
                type="email"
                value={email}
              />
            </div>
          </div>
          <label className="signup-terms">
            <input
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              required
              type="checkbox"
            />
            <span>
              I agree to the{" "}
              <Link className="signup-legal-link" href="/terms">Terms &amp; Conditions</Link>
              {" "}and{" "}
              <Link className="signup-legal-link" href="/privacy">Privacy Policy</Link>
            </span>
          </label>
          <button className="signup-submit" disabled={isSubmitting} type="submit">
            <Icon name="mail" size={17} />
            {isSubmitting ? "Sending Code…" : "Send Verification Code"}
          </button>
          <p aria-live="polite" className={`signup-message ${messageType}`}>{message}</p>
        </form>
      )}

      {step === "code" && (
        <form className="signup-form" onSubmit={handleCodeSubmit}>
          <p className="signup-step-description">Enter the 6-digit verification code sent to <strong>{email}</strong>. You can set your password after your email is verified.</p>
          <div className="signup-field">
            <label htmlFor="verification-code">Email verification code*</label>
            <div className="signup-input-wrap">
              <Icon name="mail" size={16} />
              <input
                autoComplete="one-time-code"
                id="verification-code"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                pattern="\d{6}"
                placeholder="Enter your 6-digit code"
                required
                value={code}
              />
            </div>
          </div>
          <button className="signup-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Verifying…" : "Verify Email"}
          </button>
          <button className="signup-secondary-action" disabled={isSubmitting} onClick={() => void sendVerificationCode()} type="button">
            Resend code
          </button>
          <button className="signup-secondary-action" disabled={isSubmitting} onClick={() => { setStep("details"); setMessage(""); }} type="button">
            Change name or email
          </button>
          <p aria-live="polite" className={`signup-message ${messageType}`}>{message}</p>
        </form>
      )}

      {step === "password" && (
        <form className="signup-form" onSubmit={handlePasswordSubmit}>
          <p className="signup-step-description">Email verified. Create a password for your new account.</p>
          <PasswordField id="password" label="Password" onChange={setPassword} placeholder="Create your password" value={password} />
          <PasswordField id="confirm-password" label="Confirm Password" onChange={setConfirmPassword} placeholder="Confirm your password" value={confirmPassword} />
          <button className="signup-submit" disabled={isSubmitting} type="submit">
            <Icon name="user-plus" size={17} />
            {isSubmitting ? "Creating Account…" : "Create Account"}
          </button>
          <p aria-live="polite" className={`signup-message ${messageType}`}>{message}</p>
        </form>
      )}
    </>
  );
}
