"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/src/lib/api/auth";
import { ApiError } from "@/src/lib/api/client";

function Brand() {
  return <div className="brand"><span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" /></svg></span><span><strong>TRACKITZ</strong><small>Simple Task Tracker</small></span></div>;
}

function TaskPreview() {
  return <div className="devices" aria-label="Task tracking dashboard preview">
    <div className="laptop">
      <div className="laptop-screen"><div className="dash-sidebar"><b>◧ STT</b><span>▦ &nbsp;Dashboard</span><span className="selected">☷ &nbsp;My Tasks</span><span>▧ &nbsp;Projects</span><span>◷ &nbsp;Calendar</span><span>⚙ &nbsp;Settings</span><div className="side-user">● &nbsp; Alex Morgan</div></div>
        <div className="dash-main"><div className="dash-top"><span>Welcome back, Alex 👋</span><span>🔔 &nbsp;●</span></div><div className="dash-title"><div><b>My Tasks</b><small>Keep track of your work</small></div><button>+ New Task</button></div><div className="dash-stats"><div><small>Total tasks</small><b>24</b><i>↗ 12%</i></div><div><small>In progress</small><b>8</b><i>↗ 4%</i></div><div><small>Completed</small><b>16</b><i>↗ 18%</i></div></div><div className="table-heading"><b>Recent tasks</b><span>View all →</span></div>
          {[['Finalize project proposal','Today','In progress'],['Design landing page','Tomorrow','In progress'],['Review team feedback','Oct 24','Completed'],['Prepare monthly report','Oct 26','Pending'],['Update client presentation','Oct 28','Pending']].map(([name,date,status])=><div className="task-row" key={name}><span className="check-box"/><span>{name}</span><small>{date}</small><em className={status.toLowerCase().replace(' ','-')}>{status}</em></div>)}
        </div></div><div className="laptop-base" />
    </div>
    <div className="phone"><div className="phone-notch"/><div className="phone-head"><span>9:41</span><span>● ▰</span></div><div className="phone-brand">TRACKITZ <b>☰</b></div><h4>My Tasks</h4><div className="phone-tabs">Today　 Upcoming</div><div className="phone-task"><i/>Finalize project proposal<small>Today · 2:00 PM</small></div><div className="phone-task"><i/>Design landing page<small>Tomorrow · 11:00 AM</small></div><div className="phone-task"><i/>Review team feedback<small>Oct 24 · 4:30 PM</small></div><div className="phone-task"><i/>Prepare monthly report<small>Oct 26 · 9:00 AM</small></div><div className="phone-add">+</div></div>
  </div>;
}

function GoogleMark() { return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6C7.2 7.7 9.4 6 12 6Z"/></svg> }

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
      router.replace("/");
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

  return <main className="login-page"><section className="login-panel"><div className="login-content"><Brand/><div className="welcome"><h1>Welcome Back!</h1><p>Sign in to your Trackitz account and continue<br className="wide-break"/> managing your tasks efficiently.</p></div><form className="login-form" onSubmit={handleSubmit}><label htmlFor="email">Email Address <span>*</span></label><div className="input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><input id="email" type="email" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} required/></div><label htmlFor="password">Password <span>*</span></label><div className="input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg><input id="password" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required/><button className="eye-button" type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Hide password":"Show password"}><svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></div><div className="forgot"><a href="#forgot-password">Forgot your password?</a></div><button className="sign-in" type="submit" disabled={isSubmitting}><svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></svg>{isSubmitting ? "Signing In..." : "Sign In"}</button></form>{feedback && <p className={`form-feedback ${feedback.type}`} role="status">{feedback.message}</p>}<div className="divider"><span>Or continue with</span></div><button className="google-button" type="button" onClick={handleGoogleLogin}><GoogleMark/><span>Google</span></button><p className="signup">Don&apos;t have an account? <Link href="/signup">Create one</Link></p></div><footer className="login-footer"><span>© 2024 Trackitz. All rights reserved.</span><span><a href="#privacy">Privacy Policy</a><b>·</b><a href="#terms">Terms &amp; Conditions</a></span></footer></section>
    <section className="hero-panel"><div className="hero-glow"/><div className="hero-copy"><span className="hero-brand">TRACKITZ</span><h2>Stay Organised,<br/>Get More Done</h2><p>Trackitz helps you manage your tasks, stay focused,<br className="wide-break"/> and achieve your goals. Create, track and update<br className="wide-break"/> your tasks with ease — anytime, anywhere.</p></div><div className="plant"><i/><i/><i/><i/><i/><span/></div><TaskPreview/><div className="features"><div><span className="feature-icon">▤</span><b>Task<br/>Management</b></div><div><span className="feature-icon">⌁</span><b>Track<br/>Progress</b></div></div></section></main>;
}
