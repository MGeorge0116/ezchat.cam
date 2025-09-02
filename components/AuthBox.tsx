"use client";
import { useState } from "react";

type Tab = "login" | "register";

export default function AuthBox({ onSuccess }: { onSuccess?: () => void }) {
  const [tab, setTab] = useState<Tab>("login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // register
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  async function post(url: string, body: any) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
  }

  async function doLogin() {
    setBusy(true); setMsg(null);
    const { ok, json } = await post("/api/auth/login", { identifier: identifier.trim(), password });
    setBusy(false);
    if (!ok) { setMsg(json?.error === "invalid_credentials" ? "Invalid credentials." : "Login failed."); return; }
    setMsg("Logged in."); onSuccess?.();
  }

  async function doRegister() {
    setBusy(true); setMsg(null);
    const { ok, json } = await post("/api/auth/register", { username: username.trim(), email: email.trim(), password: regPass });
    setBusy(false);
    if (!ok) {
      const m = ({username_taken:"Username is already taken.", email_taken:"Email is already in use.", invalid_username:"Invalid username.", invalid_email:"Invalid email.", weak_password:"Password must be at least 6 characters."} as any)[json?.error] || "Registration failed.";
      setMsg(m); return;
    }
    setMsg("Registration successful. You are now logged in.");
    onSuccess?.(); setTab("login");
  }

  return (
    <div className="card" style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="tabs">
        <button className={`tab ${tab==="login" ? "tab--active":""}`} onClick={()=>setTab("login")}>Login</button>
        <button className={`tab ${tab==="register" ? "tab--active":""}`} onClick={()=>setTab("register")}>Register</button>
      </div>

      <div className="stack" style={{ marginTop: 14 }}>
        {tab === "login" ? (
          <>
            <p className="muted">Enter your username (used inside the room) and choose a room to join.</p>
            <div className="stack">
              <label className="muted">Username</label>
              <input className="input" placeholder="e.g. Seymour" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} />
              <label className="muted">Password (only if you registered with one)</label>
              <input type="password" className="input" placeholder="" value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>
            <div className="row" style={{ marginTop: 6 }}>
              <button className="button button--primary" onClick={doLogin} disabled={busy}>{busy?"Working...":"Enter Room"}</button>
              <button className="button button--secondary" onClick={()=>onSuccess?.()}>Make Test Room Active</button>
            </div>
          </>
        ) : (
          <>
            <div className="stack">
              <label className="muted">Username</label>
              <input className="input" placeholder="Choose a unique username" value={username} onChange={(e)=>setUsername(e.target.value)} />
              <label className="muted">Email</label>
              <input className="input" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <label className="muted">Password</label>
              <input type="password" className="input" placeholder="At least 6 characters" value={regPass} onChange={(e)=>setRegPass(e.target.value)} />
            </div>
            <div className="row" style={{ marginTop: 6 }}>
              <button className="button button--primary" onClick={doRegister} disabled={busy}>{busy?"Working...":"Create Account"}</button>
            </div>
          </>
        )}
        {msg && <div className="muted">{msg}</div>}
      </div>
    </div>
  );
}
