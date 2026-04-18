import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-amber-950 border-t border-amber-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-amber-100 text-sm">
          © 2025 <span className="font-semibold">Nappan Pancake & Art</span> · Hecho con 🥞 en Monterrey
        </p>
        <div className="text-center mt-4">
          <Link
            href="/admin"
            className="text-amber-200 hover:text-amber-100 text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            🔐 Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
