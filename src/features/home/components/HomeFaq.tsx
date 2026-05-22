export function HomeFaq() {
  const faqs = [
    {
      question: '¿Cómo puedo personalizar mi Nappan Box?',
      answer:
        'Puedes subir tu diseño o enviarnos una referencia al hacer tu pedido. Nuestro equipo lo adapta para que se vea limpio, detallado y especial.',
    },
    {
      question: '¿Hacen envíos a domicilio?',
      answer:
        'Sí, entregamos en la ciudad con el empaque adecuado para que tu pedido llegue fresco y con buena presentación.',
    },
    {
      question: '¿Con cuánta anticipación debo contratar el catering para eventos?',
      answer:
        'Recomendamos reservar con al menos dos semanas de antelación para asegurar disponibilidad, sobre todo en fines de semana.',
    },
    {
      question: '¿Qué tipo de pedidos pueden hacerse?',
      answer:
        'Trabajamos desde regalos individuales hasta Lunch Boxes, Fit Bar y experiencias en vivo para eventos y celebraciones.',
    },
    {
      question: '¿Puedo pedir algo totalmente personalizado?',
      answer:
        'Claro. Desde logotipos corporativos hasta retratos o ideas temáticas, evaluamos la pieza para darte la mejor propuesta.',
    },
    {
      question: '¿Tienen opción de retiro en local?',
      answer:
        'Sí, puedes programar el retiro de tu pedido en nuestro estudio sin costo adicional de envío.',
    },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14 lg:px-10 anim-up d6">
      <div className="text-center mb-10 md:mb-12">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
          Preguntas frecuentes
        </p>
        <h2
          className="text-4xl leading-none tracking-[-0.04em] sm:text-5xl"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
        >
          Resolvemos lo básico antes de que hagas tu pedido
        </h2>
      </div>

      <div className="mx-auto grid max-w-4xl gap-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-[1.5rem] border p-5 sm:p-6"
            style={{
              background: 'rgba(255,252,245,0.82)',
              borderColor: 'rgba(88,55,34,0.12)',
              boxShadow: '0 16px 40px rgba(62,35,19,0.06)',
            }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <h3 className="text-base font-semibold sm:text-lg" style={{ color: '#2A1710', fontFamily: 'var(--font-dm-sans)' }}>
                {faq.question}
              </h3>
              <span className="text-xl font-bold leading-none text-[#D89B2B] transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-7 sm:text-base" style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}>
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
