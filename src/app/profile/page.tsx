import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  return (
    <>
      <main className="min-h-screen px-4 pb-24 pt-6 text-[#FFF6E5]">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="mt-2 text-sm text-[#B9A88D]">
          Aquí irá tu información de cuenta, direcciones y pedidos guardados.
        </p>
      </main>
      <BottomNav />
    </>
  )
}
