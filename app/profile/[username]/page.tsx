export default function ProfilePage({ params }: { params: { username: string } }) {
  const name = decodeURIComponent(params.username);
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">@{name}</h1>
      <p className="text-neutral-400">Profile coming soon.</p>
    </div>
  );
}
