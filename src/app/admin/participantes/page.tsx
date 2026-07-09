"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Participante = {
  id: number;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  departamento: string;
  participa: boolean;
  adultos: number;
  criancas: number;
  totalPessoas: number;
  pratoId: number | null;
  pratoNome: string;
  observacao: string | null;
  createdAt: string;
};

type Prato = {
  id: number;
  nome: string;
  limite: number;
  quantidadeEscolhida: number;
};

const departamentos = [
  // Setoriais
  { value: "Administracao", label: "Administração" },
  { value: "Transporte_Escolar", label: "Transporte Escolar" },
  { value: "Tecnologia", label: "Tecnologia" },
  { value: "Alimentacao_Escolar", label: "Alimentação Escolar" },
  { value: "Pedagogico", label: "Pedagógico" },
  { value: "Financeiro", label: "Financeiro" },
  { value: "Recursos_Humanos", label: "Recursos Humanos" },
  { value: "Outro", label: "Outro" },
  // CEIs - Centros Educacionais Infantis
  { value: "CEI_LUIZ_FELIPE", label: "CEI Luiz Felipe" },
  { value: "CEI_ARCO_IRIS", label: "CEI Arco Íris" },
  { value: "CEI_BRUNO_LEONARDO", label: "CEI Bruno Leonardo" },
  { value: "CEI_DOM_FRANCO", label: "CEI Dom Franco" },
  { value: "CEI_MENINO_JESUS", label: "CEI Menino Jesus" },
  { value: "CEI_NOSSO_LAR", label: "CEI Nosso Lar" },
  { value: "CEI_VASCO_PAPA", label: "CEI Vasco Papa" },
  { value: "CEI_CRIANCA_FELIZ", label: "CEI Criança Feliz" },
  // CEMs - Centros Educacionais Municipais
  { value: "CEM_SAO_CRISTOVAO", label: "CEM São Cristóvão" },
  { value: "CEM_GUILHERME", label: "CEM Guilherme" },
  { value: "CEM_ORLANDO_PEREIRA", label: "CEM Orlando Pereira" },
  // EMs - Escolas Municipais
  { value: "EM_MARIA_HILDA", label: "EM Maria Hilda" },
  { value: "EM_PAULO_FREIRE", label: "EM Paulo Freire" },
  { value: "EM_JOSE_ANCHIETA", label: "EM José Anchieta" },
  // ERMs - Escolas Municipais de Referência
  { value: "ERM_ALVARES_AZEVEDO", label: "ERM Alvares Azevedo" },
  { value: "ERM_CORA_CORALINA", label: "ERM Cora Coralina" },
  { value: "ERM_EUCLIDES_CUNHA", label: "ERM Euclides Cunha" },
  { value: "ERM_OSVALDO_CRUZ", label: "ERM Osvaldo Cruz" },
  { value: "ERM_VINICIUS_DE_MORAIS", label: "ERM Vinicius de Morais" },
];

export default function ParticipantesPage() {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Participante>>({});

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.push("/admin");
      return;
    }
    loadData();
  }, [router, search, filterDept]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterDept) params.set("departamento", filterDept);

      const [partRes, pratosRes] = await Promise.all([
        fetch(`/api/participantes?${params}`),
        fetch("/api/pratos"),
      ]);

      const partData = await partRes.json();
      const pratosData = await pratosRes.json();

      setParticipantes(Array.isArray(partData) ? partData : []);
      setPratos(Array.isArray(pratosData) ? pratosData : []);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este participante?")) return;

    try {
      await fetch(`/api/participantes/${id}`, { method: "DELETE" });
      loadData();
    } catch {
      alert("Erro ao excluir participante");
    }
  };

  const handleEdit = (part: Participante) => {
    setEditingId(part.id);
    setEditForm({
      nome: part.nome,
      cpf: part.cpf || "",
      telefone: part.telefone || "",
      departamento: part.departamento,
      participa: part.participa,
      adultos: part.adultos,
      criancas: part.criancas,
      pratoId: part.pratoId,
      observacao: part.observacao || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/participantes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erro ao salvar");
        return;
      }

      setEditingId(null);
      setEditForm({});
      loadData();
    } catch {
      alert("Erro ao salvar participante");
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Nome", "CPF", "Telefone", "Departamento", "Participa", "Adultos", "Crianças", "Total", "Prato", "Observação", "Data"],
      ...participantes.map(p => [
        p.nome,
        p.cpf || "",
        p.telefone || "",
        p.departamento.replace(/_/g, " "),
        p.participa ? "Sim" : "Não",
        p.adultos,
        p.criancas,
        p.totalPessoas,
        p.pratoNome,
        p.observacao || "",
        new Date(p.createdAt).toLocaleDateString("pt-BR"),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Participantes");
    XLSX.writeFile(wb, "participantes_arraia2026.xlsx");
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text("Arraiá da Educação 2026 - Lista de Participantes", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Nome", "CPF", "Telefone", "Departamento", "Participa", "Adultos", "Crianças", "Prato", "Observação"]],
      body: participantes.map(p => [
        p.nome,
        p.cpf || "-",
        p.telefone || "-",
        p.departamento.replace(/_/g, " "),
        p.participa ? "Sim" : "Não",
        String(p.adultos),
        String(p.criancas),
        p.pratoNome,
        p.observacao || "-",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [230, 57, 70] },
    });

    doc.save("participantes_arraia2026.pdf");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `📋 Lista de Participantes - Arraiá da Educação 2026\n\nTotal: ${participantes.length} participantes\nConfirmados: ${participantes.filter(p => p.participa).length}\n\nGerado em: ${new Date().toLocaleDateString("pt-BR")}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const getDeptLabel = (value: string) => {
    return departamentos.find(d => d.value === value)?.label || value;
  };

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👥</span>
              <div>
                <h1 className="text-xl font-bold">Participantes</h1>
                <p className="text-red-200 text-sm">Gerenciar participantes do Arraiá</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
                📊 Dashboard
              </Link>
              <Link href="/admin/relatorios" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
                📄 Relatórios
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="🔍 Buscar por nome, telefone ou CPF..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div>
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 outline-none transition-all bg-white"
              >
                <option value="">Todos os Departamentos</option>
                {departamentos.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                📊 Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                📄 PDF
              </button>
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                📱 WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500">Carregando...</p>
            </div>
          ) : participantes.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <span className="text-6xl">📭</span>
              <p className="mt-4 text-lg">Nenhum participante encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Departamento</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Telefone</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Pessoas</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Prato</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participantes.map(part => (
                    <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                      {editingId === part.id ? (
                        <td colSpan={7} className="p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <input
                                type="text"
                                value={editForm.nome || ""}
                                onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                                className="px-3 py-2 border rounded-lg text-sm"
                                placeholder="Nome"
                              />
                              <input
                                type="text"
                                value={editForm.cpf || ""}
                                onChange={e => setEditForm({ ...editForm, cpf: e.target.value })}
                                className="px-3 py-2 border rounded-lg text-sm"
                                placeholder="CPF"
                              />
                              <input
                                type="text"
                                value={editForm.telefone || ""}
                                onChange={e => setEditForm({ ...editForm, telefone: e.target.value })}
                                className="px-3 py-2 border rounded-lg text-sm"
                                placeholder="Telefone"
                              />
                              <select
                                value={editForm.departamento || ""}
                                onChange={e => setEditForm({ ...editForm, departamento: e.target.value as typeof editForm.departamento })}
                                className="px-3 py-2 border rounded-lg text-sm bg-white"
                              >
                                {departamentos.map(d => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-sm">Participa:</label>
                                <select
                                  value={editForm.participa ? "true" : "false"}
                                  onChange={e => setEditForm({ ...editForm, participa: e.target.value === "true" })}
                                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                                >
                                  <option value="true">Sim</option>
                                  <option value="false">Não</option>
                                </select>
                              </div>
                              <input
                                type="number"
                                value={editForm.adultos || 0}
                                onChange={e => setEditForm({ ...editForm, adultos: Number(e.target.value) })}
                                className="px-3 py-2 border rounded-lg text-sm"
                                placeholder="Adultos"
                                min="0"
                              />
                              <input
                                type="number"
                                value={editForm.criancas || 0}
                                onChange={e => setEditForm({ ...editForm, criancas: Number(e.target.value) })}
                                className="px-3 py-2 border rounded-lg text-sm"
                                placeholder="Crianças"
                                min="0"
                              />
                              <select
                                value={editForm.pratoId || ""}
                                onChange={e => setEditForm({ ...editForm, pratoId: Number(e.target.value) || null })}
                                className="px-3 py-2 border rounded-lg text-sm bg-white"
                              >
                                <option value="">Nenhum prato</option>
                                {pratos.map(p => (
                                  <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                              </select>
                            </div>
                            <input
                              type="text"
                              value={editForm.observacao || ""}
                              onChange={e => setEditForm({ ...editForm, observacao: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                              placeholder="Observação"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                              >
                                💾 Salvar
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditForm({}); }}
                                className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                              >
                                ✖ Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{part.nome}</div>
                            {part.cpf && <div className="text-xs text-slate-400">{part.cpf}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{getDeptLabel(part.departamento)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{part.telefone || "-"}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm">
                              👨 {part.adultos} + 👧 {part.criancas} = <strong>{part.totalPessoas}</strong>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                              {part.pratoNome}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {part.participa ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                ✅ Confirmado
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                ❌ Não vai
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEdit(part)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(part.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Excluir"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
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
