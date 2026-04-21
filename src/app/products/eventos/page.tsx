import { redirect } from 'next/navigation'

export default function LegacyEventosPage() {
  redirect('/menu?category=live-event')
}
