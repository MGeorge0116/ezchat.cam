// app/room/layout.tsx
// Optional: segment-level layout for the /room/* routes.
// Uses the root layout if omitted; including it can help avoid accidental 404s from missing parents.

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
