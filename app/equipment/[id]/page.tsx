import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Consultar la base de datos real en Supabase
  const { data: equipo, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !equipo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
        <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full mb-3">
          {equipo.estado}
        </span>
        <h1 className="text-2xl font-bold mb-2">{equipo.nombre}</h1>
        <p className="text-slate-400 text-sm mb-6">ID: {equipo.id}</p>

        <div className="space-y-4 border-t border-slate-700 pt-4 text-sm">
          <div>
            <p className="text-slate-400">Número de Serie</p>
            <p className="font-medium text-slate-200">{equipo.numero_serie || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-400">Último Servicio</p>
            <p className="font-medium text-slate-200">{equipo.ultimo_servicio || 'No registrado'}</p>
          </div>
          <div>
            <p className="text-slate-400">Técnico Asignado</p>
            <p className="font-medium text-slate-200">{equipo.tecnico_asignado || 'Soporte TekPro'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}