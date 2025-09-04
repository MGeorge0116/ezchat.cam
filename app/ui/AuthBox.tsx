// app/ui/AuthBox.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthBox() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    ageVerified: false,
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to register");

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (loginRes?.ok) router.refresh();
      else setError("Registration succeeded but login failed.");
    } catch (err: any) {
      setError(err?.message || "Internal Server Error");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (res?.ok) router.refresh();
      else setError("Invalid credentials.");
    } catch (err: any) {
      setError(err?.message || "Internal Server Error");
    }
  }

  return (
    <div className="flex justify-center mt-8">
      <section className="w-[320px] p-4 border bg-[color:rgb(var(--card))] text-[color:rgb(var(--foreground))]">
        {/* Toggle buttons */}
        <div className="flex justify-center mb-4 gap-2">
          <button
            type="button"
            className={`px-3 py-1 text-sm ${
              tab === "login"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm ${
              tab === "register"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm bg-[color:rgb(var(--background))] text-[color:rgb(var(--foreground))]"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm bg-[color:rgb(var(--background))] text-[color:rgb(var(--foreground))]"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-2 py-1 text-sm"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-2">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm bg-[color:rgb(var(--background))] text-[color:rgb(var(--foreground))]"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm bg-[color:rgb(var(--background))] text-[color:rgb(var(--foreground))]"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm bg-[color:rgb(var(--background))] text-[color:rgb(var(--foreground))]"
            />
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="ageVerified"
                checked={form.ageVerified}
                onChange={(e) =>
                  setForm({ ...form, ageVerified: e.target.checked })
                }
                className="w-3 h-3"
              />
              I confirm that I am at least 18 years old.
            </label>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-2 py-1 text-sm"
              disabled={!form.ageVerified}
            >
              Register
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
