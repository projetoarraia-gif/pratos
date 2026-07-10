"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

type Stats = {
  confirmados: number;
  adultos: number;
  criancas: number;
  totalPessoas: number;
  totalGeral: number;
  porDepartamento: { name: string; value: number }[];
  pratosStats: { name: string; escolhidos: number; limite: number }[];
};

const COLORS = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#264653', '#a8dadc', '#f1faee', '#e76f51'];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.push("/admin");
      return;
    }

    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/admin");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Carregando dashboard...</p>
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
              <span className="text-3xl">🏫</span>
              <div>
                <h1 className="text-xl font-bold">Arraiá da Educação 2026</h1>
                <p className="text-red-200 text-sm">Painel Administrativo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Link
                href="/admin/participantes"
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                👥 Participantes
              </Link>
              <Link
                href="/admin/pratos"
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                🍽️ Pratos
              </Link>
              <Link
                href="/admin/relatorios"
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                📄 Relatórios
              </Link>
              <Link
                href="/admin/configuracoes"
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                ⚙️ Config
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-800 hover:bg-red-900 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-green-500">
            <span className="text-3xl">✅</span>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats?.confirmados || 0}</p>
            <p className="text-slate-500 text-sm">Confirmados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-blue-500">
            <span className="text-3xl">👨</span>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.adultos || 0}</p>
            <p className="text-slate-500 text-sm">Adultos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-pink-500">
            <span className="text-3xl">👧</span>
            <p className="text-3xl font-bold text-pink-600 mt-2">{stats?.criancas || 0}</p>
            <p className="text-slate-500 text-sm">Crianças</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-amber-500">
            <span className="text-3xl">🍰</span>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats?.totalPessoas || 0}</p>
            <p className="text-slate-500 text-sm">Total de Pessoas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-purple-500">
            <span className="text-3xl">📊</span>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.totalGeral || 0}</p>
            <p className="text-slate-500 text-sm">Total Geral</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Participantes por Departamento</h3>
            {stats?.porDepartamento && stats.porDepartamento.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.porDepartamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Participantes" fill="#e63946" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">Nenhum dado disponível</p>
            )}
          </div>

          {/* Dishes Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">🍽️ Pratos Escolhidos</h3>
            {stats?.pratosStats && stats.pratosStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.pratosStats.filter(p => p.escolhidos > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="escolhidos" name="Escolhidos" fill="#f4a261" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">Nenhum prato escolhido ainda</p>
            )}
          </div>

          {/* Pie Chart - Adults vs Children */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">👨‍👩‍👧‍👦 Distribuição de Convidados</h3>
            {(stats?.adultos || 0) + (stats?.criancas || 0) > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Adultos", value: stats?.adultos || 0 },
                      { name: "Crianças", value: stats?.criancas || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">Nenhum dado disponível</p>
            )}
          </div>

          {/* Dishes Limit Status */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">🎯 Status dos Pratos</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats?.pratosStats.map((prato, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium text-slate-700 truncate">{prato.name}</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((prato.escolhidos / prato.limite) * 100, 100)}%`,
                        backgroundColor: prato.escolhidos >= prato.limite
                          ? '#ef4444'
                          : prato.escolhidos >= prato.limite * 0.8
                            ? '#f59e0b'
                            : '#22c55e',
                      }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-slate-600">
                    {prato.escolhidos}/{prato.limite}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-2 text-center text-[10px] text-slate-500 bg-slate-100 border-t border-slate-200 mt-8">
        Desenvolvido pelo Departamento de Tecnologia da SME.
      </footer>
    </main>
  );
}
