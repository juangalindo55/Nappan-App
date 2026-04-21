import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-amber-950 via-amber-900 to-amber-800/50 border-t border-yellow-300/20 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-cream mb-2 font-serif">Nappan</h3>
            <p className="text-cream/70 text-sm">Pancakes & Art Studio</p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-widest text-yellow-300 font-bold mb-4">Explorar</p>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link href="/products/lunchbox" className="hover:text-yellow-300 transition">Lunch Box</Link></li>
              <li><Link href="/products/fitbar" className="hover:text-yellow-300 transition">Protein Fit Bar</Link></li>
              <li><Link href="/products/eventos" className="hover:text-yellow-300 transition">Eventos en Vivo</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-widest text-yellow-300 font-bold mb-4">Contacto</p>
            <p className="text-sm text-cream/80">Monterrey, México</p>
            <Link href="/admin" className="inline-block text-xs text-cream/50 hover:text-yellow-300 transition mt-4">
              🔐 Admin
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-yellow-300/10 mb-8"></div>

        {/* Copyright */}
        <p className="text-center text-cream/60 text-xs">
          © 2025 <span className="font-semibold">Nappan Studio</span> · Hecho con 🥞 en Monterrey
        </p>
      </div>
    </footer>
  )
}
