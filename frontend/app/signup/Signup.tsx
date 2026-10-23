"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/src/lib/api/auth";
import Icon from "@/app/components/Icon";
import { apiRequest, TOKEN_KEY, type Account } from "@/lib/api";

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
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Your passwords do not match.");
      return;
    }

    setMessage("");
    setMessageType("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const result = await apiRequest<{ user: Account; token: string }>("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          full_name: formData.get("full_name"),
          email: formData.get("email"),
          password,
          terms_accepted: formData.get("terms_accepted") === "on",
        }),
      }, false);
      window.localStorage.setItem(TOKEN_KEY, result.token);
      const profile = await apiRequest<{ user: Account }>("/api/auth/me/");
      setMessageType("success");
      setMessage("Account created successfully. You can now sign in.");
      window.setTimeout(() => router.replace("/dashboard"), 700);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <div className="signup-field">
        <label htmlFor="full-name">Full Name*</label>
        <div className="signup-input-wrap">
          <Icon name="user" size={16} />
          <input autoComplete="name" id="full-name" name="full_name" placeholder="Enter your full name" required />
        </div>
      </div>

      <div className="signup-field">
        <label htmlFor="email">Email Address*</label>
        <div className="signup-input-wrap">
          <Icon name="mail" size={16} />
          <input autoComplete="email" id="email" name="email" placeholder="Enter your email address" required type="email" />
        </div>
      </div>

      <PasswordField id="password" label="Password" onChange={setPassword} placeholder="Create your password" value={password} />
      <PasswordField id="confirm-password" label="Confirm Password" onChange={setConfirmPassword} placeholder="Confirm your password" value={confirmPassword} />

      <label className="signup-terms">
        <input name="terms_accepted" required type="checkbox" />
        <span>I agree to the <a href="#terms">Terms &amp; Conditions</a> and <a href="#privacy">Privacy Policy</a></span>
      </label>

      <button className="signup-submit" disabled={isSubmitting} type="submit">
        <Icon name="user-plus" size={17} />
        {isSubmitting ? "Creating Account…" : "Create Account"}
      </button>
      <p aria-live="polite" className={`signup-message ${messageType}`}>{message}</p>
    </form>
  );
}
