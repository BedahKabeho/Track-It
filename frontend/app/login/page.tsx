"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/src/lib/api/auth";
import { ApiError } from "@/src/lib/api/client";

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
      {/* Plant */}
      <div className="mockup-plant" aria-hidden="true">
        <svg viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Plant Pot */}
          <path d="M22 170 L78 170 L68 235 L32 235 Z" fill="#e8f3ef" />
          <ellipse cx="50" cy="170" rx="28" ry="4" fill="#d7e7e2" />
          {/* Leaves */}
          <path d="M50 170 C45 130 18 90 8 50 C24 60 38 85 46 120" fill="#358b54" />
          <path d="M48 170 C42 120 28 65 30 20 C40 38 48 70 50 115" fill="#449d62" />
          <path d="M50 170 C50 110 52 50 62 8 C66 32 62 75 54 125" fill="#50ad6f" />
          <path d="M52 170 C56 120 68 70 82 28 C80 48 74 80 60 130" fill="#429a60" />
          <path d="M53 170 C62 135 80 95 96 68 C88 85 78 115 62 140" fill="#368c56" />
        </svg>
      </div>

      {/* Laptop Mockup */}
      <div className="mockup-laptop">
        <div className="mockup-laptop-screen">
          <span className="laptop-camera-dot" />
          {/* Sidebar */}
          <div className="mockup-dash-sidebar">
            <div className="mockup-dash-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>STT</span>
            </div>
            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Dashboard</span>
            </div>
            <div className="mockup-nav-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>My Tasks</span>
            </div>
            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Create Task</span>
            </div>
            <div className="mockup-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="mockup-dash-main">
            <div className="mockup-dash-topbar">
              <span className="mockup-dash-crumb">Workspace</span>
              <div className="mockup-dash-user">
                <span className="mockup-dash-user-avatar" />
                <span>Alex Johnson</span>
              </div>
            </div>

            <div className="mockup-dash-titlebar">
              <h3>My Tasks</h3>
              <span className="mockup-dash-new-btn">+ Create Task</span>
            </div>

            <div className="mockup-dash-stats">
              <div className="mockup-stat-box">
                <span className="stat-dot-box stat-cyan" />
                <div>
                  <small>Total Tasks</small>
                  <strong>12</strong>
                </div>
              </div>
              <div className="mockup-stat-box">
                <span className="stat-dot-box stat-teal" />
                <div>
                  <small>Completed</small>
                  <strong>5</strong>
                </div>
              </div>
              <div className="mockup-stat-box">
                <span className="stat-dot-box stat-mint" />
                <div>
                  <small>In Progress</small>
                  <strong>4</strong>
                </div>
              </div>
            </div>

            <table className="mockup-dash-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Project documentation</td>
                  <td>Oct 24, 2025</td>
                  <td><span className="mockup-status-tag in-prog">&#9679; In Progress</span></td>
                </tr>
                <tr>
                  <td>Design new landing page</td>
                  <td>Oct 25, 2025</td>
                  <td><span className="mockup-status-tag done">&#9679; Completed</span></td>
                </tr>
                <tr>
                  <td>Update API integration</td>
                  <td>Oct 28, 2025</td>
                  <td><span className="mockup-status-tag in-prog">&#9679; In Progress</span></td>
                </tr>
                <tr>
                  <td>Review team proposals</td>
                  <td>Oct 28, 2025</td>
                  <td><span className="mockup-status-tag pending">&#9679; Pending</span></td>
                </tr>
                <tr>
                  <td>Write release notes</td>
                  <td>Oct 29, 2025</td>
                  <td><span className="mockup-status-tag done">&#9679; Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mockup-laptop-base" />
      </div>

      {/* Smartphone Mockup */}
      <div className="mockup-phone">
        <span className="phone-notch" />
        <div className="phone-topbar">
          <span>9:41</span>
          <div className="phone-topbar-icons">
            <span>&#9642;&#9642;</span>
            <span>&#9647;</span>
          </div>
        </div>
        <div className="phone-header">
          <div className="phone-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>STT</span>
          </div>
          <span className="phone-menu-icon">&#9776;</span>
        </div>
        <div className="phone-title-row">
          <h4>My Tasks</h4>
          <span className="phone-toggle" />
        </div>
        <div className="phone-task-list">
          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Project documentation</strong>
              <small>Oct 24, 2025</small>
            </div>
            <span className="phone-status-tag in-prog">In Progress</span>
          </div>
          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Design new landing page</strong>
              <small>Oct 25, 2025</small>
            </div>
            <span className="phone-status-tag done">Completed</span>
          </div>
          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Update API integration</strong>
              <small>Oct 28, 2025</small>
            </div>
            <span className="phone-status-tag in-prog">In Progress</span>
          </div>
          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Review team proposals</strong>
              <small>Oct 28, 2025</small>
            </div>
            <span className="phone-status-tag pending">Pending</span>
          </div>
          <div className="phone-task-item">
            <div className="phone-task-info">
              <strong>Write release notes</strong>
              <small>Oct 29, 2025</small>
            </div>
            <span className="phone-status-tag done">Completed</span>
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
    <svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.77 2.34 3.99 1.65.1-.72.4-1.21.72-1.49-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.15 3.05-1.15.61 1.53.23 2.67.12 2.95.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.23-5.1 5.5.4.35.76 1.02.76 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);
    try {
      await authApi.login({ email, password });
      router.replace("/dashboard");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof ApiError ? error.message : "Sign in failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setFeedback(null);
    try {
      const { authorization_url: authorizationUrl } = await authApi.googleLogin();
      window.location.assign(authorizationUrl);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof ApiError ? error.message : "Google sign in is unavailable right now.",
      });
    }
  }

  function handleGitHubLogin() {
    setFeedback({ type: "error", message: "GitHub sign in is not configured for this app yet." });
  }

  return (
    <main className="login-page">
      {/* Left Column: Sign-in Form */}
      <section className="login-panel">
        <Brand />

        <div className="login-content">
          <div className="login-welcome">
            <h1>Welcome Back!</h1>
            <p>Sign in to your TrackItz account and continue managing your tasks efficiently.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">
                Email Address <span className="req">*</span>
              </label>
              <div className="login-input-wrap">
                <svg className="login-field-icon" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                <svg className="login-field-icon" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
                <polyline points="10 16 15 12 10 8" />
                <line x1="15" y1="12" x2="4" y2="12" />
              </svg>
              <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
            </button>
          </form>

          {feedback && <p className={`login-feedback ${feedback.type}`} role="status">{feedback.message}</p>}

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

          <p className="login-signup-prompt">
            Don&apos;t have an account? <Link href="/signup">Create one</Link>
          </p>
        </div>

        <footer className="login-panel-footer">
          <span>&#169; 2026 TrackItz. All rights reserved.</span>
          <div className="login-footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms &amp; Conditions</a>
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
        <div className="hero-copy">
          <span className="hero-eyebrow">TRACKITZ</span>
          <h2>Stay Organised,<br />Get More Done</h2>
          <p>TrackItz helps you manage your tasks, stay focused, and achieve your goals. Create, track and update your tasks with ease - anytime, anywhere.</p>
        </div>

        <TaskPreview />
      </section>
    </main>
  );
}
