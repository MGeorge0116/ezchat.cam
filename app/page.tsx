// app/page.tsx
export default function HomePage() {
  // Render titles exactly, centered. If you later hydrate data, replace the placeholders.
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h2 className="text-xl font-bold">Promoted Rooms</h2>
        <p className="mt-2 opacity-80">No promoted rooms right now.</p>
      </section>

      <section className="text-center">
        <h2 className="text-xl font-bold">Active Rooms</h2>
        <p className="mt-2 opacity-80">No active rooms right now.</p>
      </section>
    </div>
  );
}
