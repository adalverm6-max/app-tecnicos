'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('equipments')

  const equipments = [
    { id: 'EQ-101', name: 'Aire Acondicionado Inverter 18k BTU', serial_number: 'AC-2024-9981' },
    { id: 'EQ-102', name: 'Tablero Eléctrico Principal 220V', serial_number: 'TE-2024-5542' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TekPro - Sistema de Gestión</h1>
          <p className="text-sm text-slate-500">Panel de control de equipos y servicios</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('equipments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'equipments' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'
            }`}
          >
            Equipos
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'
            }`}
          >
            Citas
          </button>
        </div>
      </header>

      {activeTab === 'equipments' && (
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {equipments.map((eq) => (
            <div key={eq.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">{eq.id}</span>
                <h2 className="text-lg font-semibold text-slate-800 mt-2">{eq.name}</h2>
                <p className="text-xs text-slate-500 mt-1">Serie: {eq.serial_number}</p>
              </div>
              <div className="flex flex-col items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <a 
                  href={`/equipment/${eq.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <QRCodeSVG value={`https://tekpro-sistema-v1.vercel.app/equipment/${eq.id}`} size={100} />
                  <span className="text-[10px] text-blue-600 hover:underline mt-2 font-mono">Ver Ficha</span>
                </a>
              </div>
            </div>
          ))}
        </main>
      )}

      {activeTab === 'appointments' && (
        <main className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-600">Sección de Citas y Agenda de Técnicos</p>
        </main>
      )}
    </div>
  )
}