"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    data_evento: "2026-07-24",
    horario_evento: "20:00",
    local_evento: "Em frente à Secretaria Municipal de Educação",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.push("/admin");
      return;
    }

    fetch("/api/configuracoes")
      .then(res => res.json())
      .then(data => {
        setConfig({
          data_evento: data.data_evento || "2026-07-24",
          horario_evento: data.horario_evento || "20:00",
          local_evento: data.local_evento || "Em frente à Secretaria Municipal de Educação",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Erro ao salvar configurações");
      }
    } catch {
      alert("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Carregando configurações...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              <div>
                <h1 className="text-xl font-bold">Configurações do Evento</h1>
                <p className="text-red-200 text-sm">Altere data, horário e local do evento</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
              📊 Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">📅 Informações do Evento</h3>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-center">
              ✅ Configurações salvas com sucesso!
            </div>
          )}

          <div className="space-y-6">
            {/* Data */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📅 Data do Evento
              </label>
              <input
                type="date"
                value={config.data_evento}
                onChange={e => setConfig({ ...config, data_evento: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                🕗 Horário do Evento
              </label>
              <input
                type="time"
                value={config.horario_evento}
                onChange={e => setConfig({ ...config, horario_evento: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              />
            </div>

            {/* Local */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📍 Local do Evento
              </label>
              <input
                type="text"
                value={config.local_evento}
                onChange={e => setConfig({ ...config, local_evento: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                placeholder="Local do evento"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <h4 className="font-semibold text-slate-700 mb-3">👀 Pré-visualização</h4>
            <div className="space-y-2">
              <p className="text-slate-700">
                📅 <strong>
                  {config.data_evento
                    ? new Date(config.data_evento + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Data não definida"}
                </strong>
              </p>
              <p className="text-slate-700">🕗 <strong>{config.horario_evento || "Horário não definido"}</strong></p>
              <p className="text-slate-700">📍 <strong>{config.local_evento || "Local não definido"}</strong></p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            {saving ? "Salvando..." : "💾 Salvar Configurações"}
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-2 text-center text-[10px] text-slate-500 bg-slate-100 border-t border-slate-200">
        Desenvolvido pelo Departamento de Tecnologia da SME.
      </footer>
    </main>
  );
}
