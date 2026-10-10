import { useState, type FormEvent } from "react";
import { api, ApiError, type ApiUser } from "../api";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";

export type AuthResult = { token: string; user: ApiUser };

function describeError(error: unknown, isSignup: boolean) {
  if (error instanceof ApiError) {
    if (error.status === 409) return "That email already has an account. Try logging in.";
    if (error.status === 401) return "Wrong email or password.";
    if (error.status === 422) return isSignup ? "Check your details. The password needs at least 8 characters." : "Check your email and password.";
    return error.message;
  }
  return "Can’t reach the server. Check that the backend is running.";
}

export default function Login({ onAuthed }: { onAuthed?: (result: AuthResult) => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = isSignup ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };
      onAuthed?.(await api<AuthResult>(isSignup ? "/auth/signup" : "/auth/login", { method: "POST", body: JSON.stringify(body) }));
    } catch (err) {
      setError(describeError(err, isSignup));
    } finally {
      setBusy(false);
    }
  }

  return <main className="screen login-screen">
    <div className="mini-logo">TOUCH GRASS</div>
    <ChatBubble mood={isSignup ? "mild" : "playful"}>{isSignup ? "New here? Tell me who I’ll be roasting." : "Back again. Your feed must have missed you."}</ChatBubble>
    <form className="login-form" onSubmit={handleSubmit}>
      {isSignup && <label className="field"><span>Name</span><input type="text" autoComplete="given-name" placeholder="Jordan" required value={name} onChange={e => setName(e.target.value)}/></label>}
      <label className="field"><span>Email</span><input type="email" autoComplete="email" placeholder="jordan@example.com" required value={email} onChange={e => setEmail(e.target.value)}/></label>
      <label className="field"><span>Password</span><input type="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder="At least 8 characters" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}/></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button disabled={busy}>{busy ? "One moment…" : isSignup ? "Create account" : "Log in"}</Button>
    </form>
    <button type="button" className="link-btn" onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); }}>{isSignup ? "Already have an account? Log in" : "New here? Create an account"}</button>
  </main>;
}
