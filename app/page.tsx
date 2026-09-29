'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, QrCode, Calendar, Users, DollarSign, Send, X, Phone, Cpu } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from './lib/supabase';

interface Client {
  id: string;
  name: string;
  phone: string;
  created_at?: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  total_amount: number;
  status: string;
  clients?: {
    name: string;
    phone: string;
  };
}

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  client_id: string;
  clients?: {
    name: string;
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulario Propuesta
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Formulario Equipo
  const [eqName, setEqName] = useState('');
  const [eqModel, setEqModel] = useState('');
  const [eqSerial, setEqSerial] = useState('');
  const [eqClientId, setEqClientId] = useState('');

  // Cargar datos desde Supabase
  const fetchData = async () => {
    // 1. Cargar propuestas
    const { data: proposalData } = await supabase
      .from('proposals')
      .select('*, clients(name, phone)')
      .order('created_at', { ascending: false });

    if (proposalData) setProposals(proposalData);

    // 2. Cargar clientes
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientData) {
      setClients(clientData);
      if (clientData.length > 0 && !eqClientId) {
        setEqClientId(clientData[0].id);
      }
    }

    // 3. Cargar equipos
    const { data: equipmentData } = await supabase
      .from('equipment')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });

    if (equipmentData) setEquipments(equipmentData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Crear propuesta y cliente
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{ name: clientName, phone: clientPhone }])
        .select()
        .single();

      if (clientError) throw clientError;

      const { error: proposalError } = await supabase
        .from('proposals')
        .insert([
          {
            client_id: clientData.id,
            title,
            description,
            total_amount: parseFloat(amount),
            status: 'draft',
          },
        ]);

      if (proposalError) throw proposalError;

      setClientName('');
      setClientPhone('');
      setTitle('');
      setDescription('');
      setAmount('');
      setIsModalOpen(false);

      fetchData();
    } catch (err) {
      console.error('Error creando propuesta:', err);
      alert('Hubo un error al guardar la propuesta.');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo equipo
  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = eqClientId || (clients.length > 0 ? clients[0].id : null);

      if (!selectedClient) {
        alert('Por favor selecciona o crea un cliente primero.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('equipment').insert([
        {
          name: eqName,
          model: eqModel,
          serial_number: eqSerial,
          client_id: selectedClient,
        },
      ]);

      if (error) throw error;

      setEqName('');
      setEqModel('');
      setEqSerial('');
      setIsEquipmentModalOpen(false);

      fetchData();
    } catch (err: any) {
      console.error('Error creando equipo:', err);
      alert(`Error al guardar: ${err?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsApp = (phone: string, title?: string, amount?: number) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let message = '';
    if (title && amount) {
      message = encodeURIComponent(
        `Hola! Te envío la cotización de *${title}* por un valor de *$${amount} USD*. ¿Quedamos atentos a tu confirmación?`
      );
    } else {
      message = encodeURIComponent(`Hola! Me contacto desde Tekpro SaaS.`);
    }
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const totalSent = proposals.length;
  const pendingAmount = proposals
    .filter((p) => p.status === 'draft' || p.status === 'pending')
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const approvedAmount = proposals
    .filter((p) => p.status === 'approved')
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-wide">Tekpro SaaS</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('proposals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'proposals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="h-5 w-5" /> Propuestas
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" /> Clientes
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'equipment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <QrCode className="h-5 w-5" /> Equipos / QR
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar className="h-5 w-5" /> Citas & Mantenimiento
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              T
            </div>
            <div>
              <p className="text-sm font-semibold">Técnico Pro</p>
              <p className="text-xs text-slate-400">Plan Pro (USD)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'proposals' && 'Gestión de Cotizaciones'}
              {activeTab === 'clients' && 'Directorio de Clientes'}
              {activeTab === 'equipment' && 'Equipos Técnicos & QR'}
              {activeTab === 'appointments' && 'Citas & Agenda de Mantenimiento'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'proposals' && 'Crea, envía y cobra tus propuestas técnicas fácilmente.'}
              {activeTab === 'clients' && 'Administra la información de contacto de todos tus clientes.'}
              {activeTab === 'equipment' && 'Gestión de activos con soporte de etiquetas QR imprimibles.'}
              {activeTab === 'appointments' && 'Programa servicios futuros y visitas técnicas.'}
            </p>
          </div>

          {activeTab === 'equipment' ? (
            <button
              onClick={() => setIsEquipmentModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Registrar Equipo
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Crear Nuevo
            </button>
          )}
        </header>

        {/* Pestaña: PROPUESTAS */}
        {activeTab === 'proposals' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Cotizaciones Registradas</span>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Monto Pendiente</span>
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Aprobadas / Pagadas</span>
                  <Send className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Propuestas en Base de Datos</h2>
              </div>
              {proposals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No tienes propuestas registradas aún. Haz clic en <b>+ Crear Nuevo</b> para agregar la primera.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Título del Trabajo</th>
                      <th className="p-4">Monto (USD)</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {proposals.map((item) => (
                      <tr key={item.id}>
                        <td className="p-4 font-semibold text-gray-900">{item.clients?.name || 'Sin Cliente'}</td>
                        <td className="p-4 text-gray-600">{item.title}</td>
                        <td className="p-4 font-semibold text-gray-900">${item.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status === 'approved' ? 'Aprobada' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-4">
                          {item.clients?.phone && (
                            <button
                              onClick={() => sendWhatsApp(item.clients!.phone, item.title, item.total_amount)}
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-xs bg-emerald-50 px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              <Send className="h-3 w-3" /> WhatsApp
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Pestaña: CLIENTES */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Lista de Clientes Registrados</h2>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
                Total: {clients.length}
              </span>
            </div>
            {clients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aún no tienes clientes guardados en la base de datos.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4">Nombre del Cliente</th>
                    <th className="p-4">Teléfono / WhatsApp</th>
                    <th className="p-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="p-4 font-semibold text-gray-900">{client.name}</td>
                      <td className="p-4 text-gray-600 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {client.phone}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => sendWhatsApp(client.phone)}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-xs bg-emerald-50 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          <Send className="h-3 w-3" /> Contactar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pestaña: EQUIPOS & QR */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Equipos Registrados & Etiquetas QR</h2>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
                Total Equipos: {equipments.length}
              </span>
            </div>
            {equipments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay equipos registrados. Haz clic en <b>+ Registrar Equipo</b> para crear el primero.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {equipments.map((eq) => (
                  <div key={eq.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{eq.name}</h3>
                          <p className="text-xs text-gray-500">Cliente: {eq.clients?.name || 'N/A'}</p>
                        </div>
                        <Cpu className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1"><b>Modelo:</b> {eq.model || 'N/A'}</p>
                      <p className="text-xs text-gray-600 mb-4"><b>Serie:</b> {eq.serial_number || 'N/A'}</p>
                    </div>

                    <a
                      href={`/equipment/${eq.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col items-center hover:shadow-md transition cursor-pointer"
                    >
                      <QRCodeSVG value={`https://tekpro-final.vercel.app/equipment/${eq.id}`}
                      <span className="text-[10px] text-blue-600 hover:underline mt-2 font-mono font-medium">Ver Hoja de Vida ↗</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: CITAS */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Agenda de Servicios Técnicos</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
              Programa visitas futuras para mantenimientos preventivos y envía recordatorios automáticos por WhatsApp.
            </p>
          </div>
        )}
      </main>

      {/* Modal Nueva Cotización */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Cotización</h3>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">WhatsApp / Teléfono (con código de país)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +573001234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Título del Trabajo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mantenimiento Preventivo HVAC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Monto Total en USD ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Descripción / Detalles</label>
                <textarea
                  rows={3}
                  placeholder="Detalles de los insumos, mano de obra, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition cursor-pointer">
                  {loading ? 'Guardando...' : 'Guardar y Generar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Equipo */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={() => setIsEquipmentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Nuevo Equipo</h3>

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Seleccionar Cliente</label>
                <select
                  required
                  value={eqClientId}
                  onChange={(e) => setEqClientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nombre del Equipo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Aire Acondicionado Split 24000 BTU"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Modelo</label>
                <input
                  type="text"
                  placeholder="Ej. LG Inverter Dual"
                  value={eqModel}
                  onChange={(e) => setEqModel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Número de Serie</label>
                <input
                  type="text"
                  placeholder="Ej. SN-99201142"
                  value={eqSerial}
                  onChange={(e) => setEqSerial(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEquipmentModalOpen(false)} className="w-1/2 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition cursor-pointer">
                  {loading ? 'Guardando...' : 'Guardar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}