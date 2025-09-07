// app/page.tsx
import HomeGate from "@/components/home/HomeGate";
import HomeDirectory from "@/components/home/HomeDirectory";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Auth card appears here ONLY if user is unsigned.
         If signed in, this renders nothing. */}
      <HomeGate />

      {/* Keep the directory exactly as-is in structure/placement:
         Promoted Rooms, then Active Rooms, both centered titles. */}
      <HomeDirectory />
    </div>
  );
}
