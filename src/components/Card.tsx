import Link from 'next/link'

interface CardProps {
  id: string
  tag: string
  title: string
  description: string
  cta: string
  href: string
  bgColor: string
  size?: 'sm' | 'lg'
}

export default function Card({
  tag,
  title,
  description,
  cta,
  href,
  bgColor,
  size = 'sm'
}: CardProps) {
  const isLarge = size === 'lg'

  return (
    <Link href={href}>
      <div className={`group cursor-pointer h-full rounded-2xl overflow-hidden shadow-2xl transition-all hover:shadow-3xl hover:-translate-y-1 duration-300 ${
        isLarge ? 'min-h-96' : 'min-h-80'
      }`}>
        {/* Image/Color section */}
        <div className={`bg-gradient-to-br ${bgColor} relative overflow-hidden transition-transform group-hover:scale-110 duration-500 ${
          isLarge ? 'h-48' : 'h-40'
        }`}>
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500"></div>
        </div>

        {/* Content section */}
        <div className={`bg-gradient-to-b from-amber-900 to-amber-950 p-6 md:p-8 flex flex-col justify-between h-full ${
          isLarge ? 'min-h-48' : 'min-h-40'
        }`}>
          {/* Tags and text */}
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-yellow-300 mb-3 px-2 py-1 bg-yellow-300/10 rounded-full">
              {tag}
            </span>

            <h3 className="text-2xl md:text-3xl font-bold text-cream mb-2 group-hover:text-yellow-300 transition-colors duration-300 font-serif">
              {title}
            </h3>

            <p className="text-cream/80 text-sm md:text-base leading-relaxed">
              {description}
            </p>
          </div>

          {/* CTA Button */}
          <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-yellow-300 text-amber-900 font-semibold rounded-lg hover:bg-yellow-200 transition-all duration-300 group/btn">
            {cta}
            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
