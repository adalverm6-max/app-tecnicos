'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Cpu, CheckCircle2, Phone, Calendar, Wrench, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EquipmentDetail {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  created_at: string;
  clients?: {
    name: string;
    phone: string;
  };
}

export default function EquipmentPublicPage() {
  const params = useParams();
  const eqId = params.id as string;

  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipment() {
      if (!eqId) return;
      const { data, error } = await supabase
        .from('equipment')
        .select('*, clients(name, phone)')
        .eq('id', eqId)
        .single();

      if (!error && data) {
        setEquipment(data);
      }
      setLoading(false);
    }

    fetchEquipment();
  }, [eqId]);

  const handleContactTech = () => {
    if (!equipment) return;
    const message = encodeURIComponent(
      `Hola! Estoy escaneando el QR del equipo *${equipment.name}* (Serie: ${equipment.serial_number || 'N/A'}). Quisiera solicitar un mantenimiento.`
    );
    window.open(`https://wa.me/573001234567?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <p className="text-sm font-medium animate-pulse">Cargando hoja de vida del equipo...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Cpu className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Equipo no encontrado</h2>
          <p className="text-xs text-slate-400 mt-1">El código QR escaneado no corresponde a ningún equipo registrado en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-md my-auto space-y-6">
        
        {/* Encabezado */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Equipo Operativo
            </span>
            <span className="text-[10px] text-slate-500 font-mono">ID: {equipment.id.slice(0, 8)}</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">{equipment.name}</h1>
          <p className="text-sm text-slate-400 mb-6">Cliente: <span className="text-slate-200 font-medium">{equipment.clients?.name || 'Cliente Particular'}</span></p>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <p className="text-slate-500 mb-0.5">Modelo</p>
              <p className="font-semibold text-slate-200">{equipment.model || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <p className="text-slate-500 mb-0.5">Nº Serie</p>
              <p className="font-semibold text-slate-200">{equipment.serial_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Historial de Mantenimientos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-500" /> Historial de Servicios
          </h2>

          <div className="space-y-4">
            <div className="flex gap-3 items-start pb-4 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Mantenimiento Preventivo Inicial</p>
                <p className="text-xs text-slate-400 mt-0.5">Limpieza profunda de serpentín, filtros y verificación de gas refrigerante.</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                  <Calendar className="h-3 w-3" /> {new Date(equipment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Asistencia por WhatsApp */}
        <button
          onClick={handleContactTech}
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <Phone className="h-4 w-4" /> Solicitar Mantenimiento por WhatsApp
        </button>

      </div>
    </div>
  );
}