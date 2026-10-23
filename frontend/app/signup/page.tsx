import SignupForm from "./Signup";

export default function SignupPage() {
  return (
    <main className="signup-screen">
      <section className="signup-panel" aria-labelledby="signup-title">
        <div className="signup-brand" aria-label="Trackitz, Simple Task Tracker">
          <span className="signup-brand-mark"><span /></span>
          <span className="signup-brand-copy">
            <strong>TRACKITZ</strong>
            <small>Simple Task Tracker</small>
          </span>
        </div>
        <header className="signup-intro">
          <h1 id="signup-title">Create Your Account</h1>
          <p>Sign up to start organising your tasks and achieving your goals</p>
        </header>
        <SignupForm />
      </section>
    </main>
  );
}
