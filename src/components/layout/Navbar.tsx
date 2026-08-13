export function Navbar() {
  return (
    <nav className="border-b p-4 flex justify-between items-center bg-gray-900 text-white">
      <div className="font-bold text-lg">Energy 2026</div>
      <div className="flex gap-4">
        <a href="/live" className="hover:underline">Live</a>
        <a href="/scorer" className="hover:underline">Scorer</a>
        <a href="/admin" className="hover:underline">Admin</a>
        <a href="/login" className="hover:underline">Login</a>
      </div>
    </nav>
  );
}
