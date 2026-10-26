"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, TOKEN_KEY } from "@/lib/api";

function Brand() {
  return (
    <div className="login-brand">
      <span className="login-brand-mark">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <div className="login-brand-text">
        <strong>TRACKITZ</strong>
        <small>Simple Task Tracker</small>
      </div>
    </div>
  );
}

function TaskPreview() {
  return (
    <div className="devices" aria-label="Task tracking dashboard preview">
      {/* Potted Plant */}
      <div className="mockup-plant" aria-hidden="true">
        <svg viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f0f6f5" />
              <stop offset="100%" stopColor="#d7e5e3" />
            </linearGradient>
            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5ec485" />
              <stop offset="100%" stopColor="#2b7746" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48b273" />
              <stop offset="100%" stopColor="#22643a" />
            </linearGradient>
            <linearGradient id="leafGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#369c5e" />
              <stop offset="100%" stopColor="#1b542f" />
            </linearGradient>
          </defs>
          {/* Ceramic Plant Pot */}
          <path d="M22 170 L78 170 L69 236 L31 236 Z" fill="url(#potGrad)" />
          <ellipse cx="50" cy="170" rx="28" ry="4.5" fill="#e2edeb" />
          <ellipse cx="50" cy="171" rx="25" ry="3.2" fill="#584838" opacity="0.6" />
          {/* Leaves */}
          <path d="M50 170 C43 125 14 88 5 48 C22 58 37 84 46 122" fill="url(#leafGrad3)" />
          <path d="M47 170 C40 115 25 60 27 15 C38 34 47 68 50 115" fill="url(#leafGrad1)" />
          <path d="M50 170 C51 108 53 45 64 6 C68 30 63 72 54 125" fill="url(#leafGrad2)" />
          <path d="M52 170 C57 118 70 65 85 24 C82 46 75 78 59 130" fill="url(#leafGrad1)" />
          <path d="M54 170 C63 132 82 92 98 64 C90 82 79 114 62 142" fill="url(#leafGrad3)" />
        </svg>
      </div>

      {/* Laptop Mockup */}
      <div className="mockup-laptop">
        <div className="mockup-laptop-screen">
          <span className="laptop-camera-dot" />

          {/* Laptop Sidebar */}
          <div className="mockup-dash-sidebar">
            <div className="mockup-dash-logo">
              <span className="mockup-logo-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>TRACKITZ</span>
            </div>

            <div className="mockup-nav-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Dashboard</span>
            </div>

            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <span>My Tasks</span>
            </div>

            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Create Task</span>
            </div>

            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>All Tasks (Admin)</span>
            </div>

            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
          </div>

          {/* Laptop Main Content Area */}
          <div className="mockup-dash-main">
            {/* Top Toolbar */}
            <div className="mockup-dash-headrow">
              <div className="mockup-dash-title-left">
                <h3>My Tasks</h3>
              </div>
              <div className="mockup-dash-actions-right">
                <div className="mockup-search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Search tasks...</span>
                </div>
                <button type="button" tabIndex={-1} className="mockup-new-btn">
                  + Create Task
                </button>
                <div className="mockup-user-pill">
                  <span className="mockup-avatar-circle" />
                  <span>John Doe</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mockup-filter-tabs">
              <span className="tab-pill active">All</span>
              <span className="tab-pill">
                <span className="pill-dot dot-pending" /> Pending
              </span>
              <span className="tab-pill">
                <span className="pill-dot dot-inprog" /> In Progress
              </span>
              <span className="tab-pill">
                <span className="pill-dot dot-done" /> Done
              </span>
            </div>

            {/* Task Table */}
            <table className="mockup-dash-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-title-cell">Finish project documentation</td>
                  <td>Apr 25, 2025</td>
                  <td>
                    <span className="mockup-badge badge-pending">
                      <span className="badge-dot" /> Pending
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">Build the API endpoints</td>
                  <td>Apr 22, 2025</td>
                  <td>
                    <span className="mockup-badge badge-inprog">
                      <span className="badge-dot" /> In Progress
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">Design the frontend UI</td>
                  <td>Apr 20, 2025</td>
                  <td>
                    <span className="mockup-badge badge-done">
                      <span className="badge-dot" /> Done
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">Write test cases</td>
                  <td>Apr 28, 2025</td>
                  <td>
                    <span className="mockup-badge badge-pending">
                      <span className="badge-dot" /> Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Laptop Metallic Base */}
        <div className="mockup-laptop-base" />
      </div>

      {/* Smartphone Mockup */}
      <div className="mockup-phone">
        <span className="phone-notch" />
        <div className="phone-topbar">
          <span className="phone-clock">9:41</span>
          <div className="phone-topbar-icons">
            <svg viewBox="0 0 24 24" width="7" height="7" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19H19.65l-.62-1.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" opacity="0.3" />
              <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.34.44 2.58 1.19 3.59L6.5 17h11l-.69-1.41C17.56 14.58 18 13.34 18 12c0-3.31-2.69-6-6-6z" />
            </svg>
            <span className="phone-batt">
              <span className="batt-fill" />
            </span>
          </div>
        </div>

        <div className="phone-header">
          <div className="phone-brand">
            <span className="phone-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>TrackItz</span>
          </div>
          <span className="phone-menu-icon" aria-hidden="true">&#9776;</span>
        </div>

        <div className="phone-title-row">
          <h4>My Tasks</h4>
          <span className="phone-add-btn">+ Create Task</span>
        </div>

        <div className="phone-task-list">
          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Finish project documentation</strong>
              <span className="phone-tag tag-pending">
                <span className="phone-dot" /> Pending
              </span>
            </div>
            <span className="phone-chevron">&rsaquo;</span>
          </div>

          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Build the API endpoints</strong>
              <span className="phone-tag tag-inprog">
                <span className="phone-dot" /> In Progress
              </span>
            </div>
            <span className="phone-chevron">&rsaquo;</span>
          </div>

          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Design the frontend UI</strong>
              <span className="phone-tag tag-done">
                <span className="phone-dot" /> Done
              </span>
            </div>
            <span className="phone-chevron">&rsaquo;</span>
          </div>

          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Write test cases</strong>
              <span className="phone-tag tag-pending">
                <span className="phone-dot" /> Pending
              </span>
            </div>
            <span className="phone-chevron">&rsaquo;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z" />
      <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6C7.2 7.7 9.4 6 12 6Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg className="github-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash.startsWith("#token=")) {
      const params = new URLSearchParams(window.location.search);

      if (params.has("oauth_error")) {
        setFeedback({
          type: "error",
          message: "Social sign-in failed. Please try again.",
        });
        window.history.replaceState(null, "", window.location.pathname);
      }

      return;
    }

    const token = new URLSearchParams(hash.slice(1)).get("token");

    // Remove the token from the visible URL immediately.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      setFeedback({
        type: "error",
        message: "Sign-in failed. Please try again.",
      });
      return;
    }

    let cancelled = false;

    async function completeSignIn() {
      window.localStorage.setItem(TOKEN_KEY, token!);

      try {
        const { user } = await apiRequest<{
          user: { is_admin?: boolean };
        }>("/api/auth/me/");

        if (!cancelled) {
          router.replace(user.is_admin ? "/admin" : "/dashboard");
        }
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);

        if (!cancelled) {
          setFeedback({
            type: "error",
            message: "Could not complete sign-in. Please try again.",
          });
        }
      }
    }

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [router]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ token: string }>(
        "/api/auth/login/",
        {
          method: "POST",
          body: JSON.stringify({ username: email.trim(), password }),
        },
        false
      );
      window.localStorage.setItem(TOKEN_KEY, result.token);
      const { user } = await apiRequest<{ user: { is_admin?: boolean } }>("/api/auth/me/");
      router.replace(user.is_admin ? "/admin" : "/dashboard");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Log in failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

function handleGoogleLogin() {
  window.location.assign("/api/auth/google/");
}

function handleGitHubLogin() {
  window.location.assign("/api/auth/github/");
}

  return (
    <main className="login-page">
      {/* Left Column: Sign-in Form */}
      <section className="login-panel">
        <Brand />

        <div className="login-content">
          <div className="login-welcome">
            <h1>Welcome Back!</h1>
            <p>Log in to your TrackItz account and continue managing your tasks efficiently.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">
                Email Address <span className="req">*</span>
              </label>
              <div className="login-input-wrap">
                <svg
                  className="login-field-icon"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Password <span className="req">*</span>
              </label>
              <div className="login-input-wrap">
                <svg
                  className="login-field-icon"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="login-eye-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>{isSubmitting ? "Logging in..." : "Log in"}</span>
            </button>
          </form>

          {feedback && <p className={`login-feedback ${feedback.type}`} role="status">{feedback.message}</p>}

          <p className="login-signup-prompt">
            Don&apos;t have an account? <Link href="/signup">Create one</Link>
          </p>

          <div className="login-divider">
            <span>Or continue with</span>
          </div>

          <div className="login-social-group">
            <button className="login-social-card" type="button" onClick={handleGoogleLogin} aria-label="Continue with Google">
              <GoogleMark />
            </button>
            <button className="login-social-card" type="button" onClick={handleGitHubLogin} aria-label="Continue with GitHub">
              <GitHubMark />
            </button>
          </div>

        </div>

        <footer className="login-panel-footer">
          <span>&#169; 2026 TrackItz. All rights reserved.</span>
          <div className="login-footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <span className="footer-link-divider">|</span>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </div>
        </footer>

        {/* Decorative soft teal waves at bottom-left */}
        <div className="login-waves-decor" aria-hidden="true">
          <svg viewBox="0 0 440 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M-50 250 C50 160 160 180 270 215 C340 238 390 238 440 240 L-50 250 Z" fill="#b9e7ea" fillOpacity="0.32" />
            <path d="M-70 250 C30 115 190 145 300 200 C360 225 400 232 440 242 L-70 250 Z" fill="#cef0f1" fillOpacity="0.45" />
            <path d="M-90 250 C10 70 210 110 330 180 C380 210 410 225 440 245 L-90 250 Z" fill="#e7f8f8" fillOpacity="0.55" />
          </svg>
        </div>
      </section>

      {/* Right Column: Hero Panel */}
      <section className="hero-panel">
        {/* Subtle decorative curved ambient SVG background */}
        <div className="hero-ambient-waves" aria-hidden="true">
          <svg viewBox="0 0 800 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <circle cx="750" cy="120" r="350" fill="#20747e" fillOpacity="0.18" />
            <circle cx="780" cy="800" r="420" fill="#13525b" fillOpacity="0.35" />
            <path d="M-100 480 Q 200 320 500 520 T 900 420" stroke="#368c95" strokeWidth="1.2" strokeOpacity="0.2" fill="none" />
            <path d="M-60 520 Q 240 360 540 560 T 940 460" stroke="#48a0a9" strokeWidth="1" strokeOpacity="0.15" fill="none" />
          </svg>
        </div>

        <div className="hero-content-wrap">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-line" />
            </div>
            <h2>Stay Organised,<br />Get More Done</h2>
            <p>
              TrackItz helps you manage your tasks, stay focused and achieve your goals. Create, track and update your tasks with ease — anytime, anywhere.
            </p>
          </div>

          <TaskPreview />
        </div>
      </section>
    </main>
  );
}
