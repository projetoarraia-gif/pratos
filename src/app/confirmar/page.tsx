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

const departamentos = [
  { value: "Almoxarifado", label: "Almoxarifado" },
  { value: "Logistica", label: "Logística" },
  { value: "Merenda", label: "Merenda" },
  { value: "Predio_SME", label: "Prédio da SME" },
];

export default function ConfirmarPage() {
  const router = useRouter();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    departamento: "Administracao",
    participa: true,
    adultos: 1,
    criancas: 0,
    prato_id: 0,
    observacao: "",
  });

  useEffect(() => {
    fetch("/api/pratos")
      .then(res => res.json())
      .then(data => setPratos(data))
      .catch(() => {});
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      if (numbers.length > 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      } else if (numbers.length > 2) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 0) {
        return `(${numbers}`;
      }
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      if (numbers.length > 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
      } else if (numbers.length > 6) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      } else if (numbers.length > 3) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      }
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (formData.participa && formData.adultos < 1) {
      setError("Quantidade de adultos deve ser pelo menos 1");
      return;
    }

    if (formData.participa && !formData.prato_id) {
      setError("Por favor, escolha um prato típico");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/participantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          adultos: Number(formData.adultos),
          criancas: Number(formData.criancas),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao confirmar participação");
      }

      router.push("/sucesso");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar participação");
    } finally {
      setLoading(false);
    }
  };

  const totalPessoas = Number(formData.adultos) + Number(formData.criancas);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-800 via-green-600 to-yellow-400 relative">
      {/* Bunting */}
      <div className="absolute top-0 left-0 right-0 h-12 overflow-hidden">
        <svg viewBox="0 0 1200 50" className="w-full h-full" preserveAspectRatio="none">
          {[...Array(20)].map((_, i) => (
            <polygon
              key={i}
              points={`${i * 60},0 ${i * 60 + 25},40 ${(i + 1) * 60},0`}
              fill={['#e63946', '#f4a261', '#2a9d8f', '#e9c46a'][i % 4]}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 pt-16">
        <div className="w-full max-w-xl">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center text-yellow-200 hover:text-white mb-6 transition-colors">
            ← Voltar
          </Link>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-fadeIn">
            <div className="text-center mb-8">
              <span className="text-5xl">🎪</span>
              <h1 className="text-3xl font-extrabold text-red-600 mt-4">
                Confirme sua Participação
              </h1>
              <p className="text-slate-600 mt-2">
                Preencha os dados abaixo para confirmar sua presença
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-center">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  CPF (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={e => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Departamento *
                </label>
                <select
                  value={formData.departamento}
                  onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white"
                >
                  {departamentos.map(dep => (
                    <option key={dep.value} value={dep.value}>{dep.label}</option>
                  ))}
                </select>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={e => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              {/* Participa? */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Vai participar? *
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.participa 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="participa"
                      checked={formData.participa === true}
                      onChange={() => setFormData({ ...formData, participa: true })}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-2">✅</span>
                    <span className="font-semibold">Sim</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    !formData.participa 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="participa"
                      checked={formData.participa === false}
                      onChange={() => setFormData({ ...formData, participa: false, prato_id: 0 })}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-2">❌</span>
                    <span className="font-semibold">Não</span>
                  </label>
                </div>
              </div>

              {formData.participa && (
                <>
                  {/* Adultos e Crianças */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        👨 Adultos
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.adultos}
                        onChange={e => setFormData({ ...formData, adultos: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-center text-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        👧 Crianças
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.criancas}
                        onChange={e => setFormData({ ...formData, criancas: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-center text-xl font-bold"
                      />
                    </div>
                  </div>

                  {/* Escolha do Prato */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      🍽️ Escolha apenas UM prato típico *
                    </label>
                    <select
                      value={formData.prato_id}
                      onChange={e => setFormData({ ...formData, prato_id: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white"
                    >
                      <option value={0}>-- Selecione um prato --</option>
                      {pratos.map(prato => {
                        const isFull = prato.quantidadeEscolhida >= prato.limite;
                        return (
                          <option key={prato.id} value={prato.id} disabled={isFull}>
                            {prato.nome} {isFull ? '(Esgotado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      📝 Observações (Opcional)
                    </label>
                    <textarea
                      value={formData.observacao}
                      onChange={e => setFormData({ ...formData, observacao: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
                      placeholder="Ex: Vou levar sem açúcar..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  formData.participa ? "🎉 Confirmar Participação" : "❌ Confirmar Não Participação"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-2 text-center text-[10px] text-yellow-200 bg-green-900/50">
        Desenvolvido pelo Departamento de Tecnologia da SME.
      </footer>
    </main>
  );
}
