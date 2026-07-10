"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Prato = {
  id: number;
  nome: string;
  limite: number;
  quantidadeEscolhida: number;
};

export default function PratosPage() {
  const router = useRouter();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPrato, setNewPrato] = useState({ nome: "", limite: 10 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ nome: string; limite: number }>({ nome: "", limite: 10 });

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.push("/admin");
      return;
    }
    loadPratos();
  }, [router]);

  const loadPratos = async () => {
    try {
      const res = await fetch("/api/pratos");
      const data = await res.json();
      setPratos(Array.isArray(data) ? data : []);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPrato.nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    try {
      const res = await fetch("/api/pratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrato),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao criar prato");
        return;
      }

      setNewPrato({ nome: "", limite: 10 });
      loadPratos();
    } catch {
      alert("Erro ao criar prato");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const res = await fetch("/api/pratos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao salvar");
        return;
      }

      setEditingId(null);
      loadPratos();
    } catch {
      alert("Erro ao salvar prato");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este prato?")) return;

    try {
      await fetch(`/api/pratos?id=${id}`, { method: "DELETE" });
      loadPratos();
    } catch {
      alert("Erro ao excluir prato");
    }
  };

  const handleResetCounters = async () => {
    if (!confirm("Tem certeza que deseja resetar todos os contadores?")) return;

    try {
      for (const prato of pratos) {
        await fetch("/api/pratos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: prato.id, quantidade_escolhida: 0 }),
        });
      }
      loadPratos();
    } catch {
      alert("Erro ao resetar contadores");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍽️</span>
              <div>
                <h1 className="text-xl font-bold">Gerenciar Pratos</h1>
                <p className="text-red-200 text-sm">Adicione, edite ou exclua pratos típicos</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
              📊 Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Add new prato */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">➕ Adicionar Novo Prato</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={newPrato.nome}
              onChange={e => setNewPrato({ ...newPrato, nome: e.target.value })}
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 outline-none transition-all"
              placeholder="Nome do prato"
            />
            <input
              type="number"
              value={newPrato.limite}
              onChange={e => setNewPrato({ ...newPrato, limite: Math.max(1, Number(e.target.value)) })}
              className="w-32 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 outline-none transition-all text-center"
              placeholder="Limite"
              min="1"
            />
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* Reset button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleResetCounters}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            🔄 Resetar Contadores
          </button>
        </div>

        {/* Pratos list */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500">Carregando...</p>
            </div>
          ) : pratos.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <span className="text-6xl">🍽️</span>
              <p className="mt-4 text-lg">Nenhum prato cadastrado</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pratos.map(prato => (
                <div key={prato.id} className="p-4 hover:bg-slate-50 transition-colors">
                  {editingId === prato.id ? (
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={editForm.nome}
                        onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        value={editForm.limite}
                        onChange={e => setEditForm({ ...editForm, limite: Math.max(1, Number(e.target.value)) })}
                        className="w-24 px-3 py-2 border rounded-lg text-sm text-center"
                        min="1"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        💾 Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">🍰</span>
                        <div>
                          <h4 className="font-semibold text-slate-800">{prato.nome}</h4>
                          <p className="text-sm text-slate-500">
                            Escolhidos: <strong>{prato.quantidadeEscolhida}</strong> / Limite: <strong>{prato.limite}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex-1 mx-6 max-w-xs">
                        <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((prato.quantidadeEscolhida / prato.limite) * 100, 100)}%`,
                              backgroundColor: prato.quantidadeEscolhida >= prato.limite
                                ? '#ef4444'
                                : prato.quantidadeEscolhida >= prato.limite * 0.8
                                  ? '#f59e0b'
                                  : '#22c55e',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(prato.id);
                            setEditForm({ nome: prato.nome, limite: prato.limite });
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(prato.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-2 text-center text-[10px] text-slate-500 bg-slate-100 border-t border-slate-200">
        Desenvolvido pelo Departamento de Tecnologia da SME.
      </footer>
    </main>
  );
}
