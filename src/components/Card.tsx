import Link from 'next/link'

interface CardProps {
  id: string
  tag: string
  title: string
  description: string
  cta: string
  href: string
  bgColor: string
  ctaStyle?: string
}

export default function Card({
  tag,
  title,
  description,
  cta,
  href,
  bgColor,
  ctaStyle
}: CardProps) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer h-full rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
        <div className={`bg-gradient-to-br ${bgColor} h-32 relative overflow-hidden`}></div>

        <div className="bg-amber-950 p-6 space-y-4 flex flex-col justify-between min-h-64">
          <div>
            <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider mb-2">
              {tag}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-amber-50 mb-3 group-hover:text-yellow-300 transition-colors">
              {title}
            </h3>
            <p className="text-amber-100 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <button
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              ctaStyle
                ? ctaStyle
                : 'bg-amber-50 text-amber-900 hover:bg-yellow-300'
            }`}
          >
            {cta} <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
