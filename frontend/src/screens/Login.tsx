import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";

export default function Login({ onSubmit }: { onSubmit?: (user: { name: string; email: string }) => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  // There is no backend yet: the password is only checked for length and is never stored or sent.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = isSignup
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };
      const { token, user } = await api(isSignup ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      localStorage.setItem("token", token);
      onSubmit?.(user);
    } catch (err) {
      setError(isSignup ? "Couldn't create the account. That email may already be in use." : "Wrong email or password.");
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
      <Button>{isSignup ? "Create account" : "Log in"}</Button>
    </form>
    <button type="button" className="link-btn" onClick={() => setMode(isSignup ? "login" : "signup")}>{isSignup ? "Already have an account? Log in" : "New here? Create an account"}</button>
  </main>;
}
