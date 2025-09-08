"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UIPage() {
  const { data } = useSession();
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">UI / Auth Test</h1>
      {data?.user?.name ? (
        <>
          <div>Signed in as <b>{data.user.name}</b></div>
          <button className="px-3 py-1 rounded bg-white/10" onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <>
          <div>Not signed in</div>
          <button className="px-3 py-1 rounded bg-white/10" onClick={() => signIn()}>Sign in</button>
        </>
      )}
    </div>
  );
}
