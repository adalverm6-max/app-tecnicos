'use client'

import React from 'react'
import { useParams } from 'next/navigation'

export default function EquipmentDetailPage() {
  const params = useParams()
  const id = params?.id as string

  // Base de datos local de ejemplo
  const mockEquipments: Record<string, { name: string; serial: string; status: string; lastService: string }> = {
    'EQ-101': {
      name: 'Aire Acondicionado Inverter 18k BTU',
      serial: 'AC-2024-9981',
      status: 'Operativo',
      lastService: '15 de Septiembre, 2026',
    },
    'EQ-102': {
      name: 'Mesa Eléctrica Principal 220V',
      serial: 'TE-2024-5542',
      status: 'Mantenimiento Pendiente',
      lastService: '01 de Agosto, 2026',
    },
  }

  const equipment = mockEquipments[id]

  if (!equipment) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold mb-2">Equipo no encontrado</h1>
        <p className="text-sm text-slate-400 max-w-xs">
          El código QR escaneado ({id}) no corresponde a ningún equipo registrado.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
            {id}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {equipment.status}
          </span>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">{equipment.name}</h1>
        <p className="text-xs text-slate-400 mb-6">Serie: {equipment.serial}</p>

        <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Último Servicio:</span>
            <span className="text-slate-200 font-medium">{equipment.lastService}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Técnico Asignado:</span>
            <span className="text-slate-200 font-medium">Soporte TekPro</span>
          </div>
        </div>

        <button 
          onClick={() => alert('Solicitud de servicio enviada')}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
        >
          Solicitar Mantenimiento
        </button>
      </div>
    </div>
  )
}