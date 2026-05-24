export function HomeTestimonials() {
  const testimonials = [
    {
      quote:
        'La Nappan Box fue el regalo perfecto para el cumpleaños de mi mamá. El detalle del retrato se veía increíble y además sabía delicioso.',
      name: 'Mariana Ruiz',
      role: 'Cliente habitual',
    },
    {
      quote:
        'Contratamos el catering para nuestra boda y fue la sensación. Ver el arte en vivo mientras desayunábamos hizo todo más especial.',
      name: 'Daniel Sosa',
      role: 'Evento de boda',
    },
    {
      quote:
        'Pedimos una pieza personalizada para nuestra marca y quedó impecable. La presentación se sentía premium desde la caja.',
      name: 'Carla Fernández',
      role: 'Directora creativa',
    },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14 lg:px-10 anim-up d5">
      <div className="text-center mb-12 md:mb-16">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
          Voces de nuestra cocina
        </p>
        <h2
          className="text-4xl leading-tight tracking-[-0.04em] sm:text-5xl"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
        >
          Lo que dicen quienes ya probaron Nappan
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="relative overflow-hidden rounded-[1.8rem] border p-6 sm:p-7"
            style={{
              background: 'rgba(255,252,245,0.82)',
              borderColor: 'rgba(88,55,34,0.12)',
              boxShadow: '0 18px 40px rgba(62,35,19,0.08)',
            }}
          >
            <div
              className="mb-5 flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: 'rgba(216,155,43,0.12)', color: '#D89B2B' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.17 6A4.17 4.17 0 003 10.17V14h5V9H5.17C5.08 7.42 6.39 6 8 6V4c-2.76 0-5 2.24-5 5v7h9v-8H7.17zM18.17 6A4.17 4.17 0 0014 10.17V14h5V9h-1.83C17.08 7.42 18.39 6 20 6V4c-2.76 0-5 2.24-5 5v7h9v-8h-5.83z" />
              </svg>
            </div>

            <p className="text-sm leading-7 sm:text-base" style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}>
              {testimonial.quote}
            </p>

            <div className="mt-6 border-t pt-4" style={{ borderColor: 'rgba(88,55,34,0.10)' }}>
              <p className="font-semibold" style={{ color: '#2A1710', fontFamily: 'var(--font-dm-sans)' }}>
                {testimonial.name}
              </p>
              <p className="text-sm" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
                {testimonial.role}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
