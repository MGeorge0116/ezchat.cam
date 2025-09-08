"use client";
import LoginClient from "@/app/auth/login/LoginClient";

export default function AuthCard() {
  return (
    <div className="max-w-md mx-auto border border-white/10 rounded-2xl bg-white/5 p-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Sign In</h2>
      <LoginClient />
    </div>
  );
}
