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

type Stats = {
  confirmados: number;
  adultos: number;
  criancas: number;
  totalPessoas: number;
  totalGeral: number;
};

const departamentos: Record<string, string> = {
  "Administracao": "Administração",
  "Transporte_Escolar": "Transporte Escolar",
  "Tecnologia": "Tecnologia",
  "Alimentacao_Escolar": "Alimentação Escolar",
  "Pedagogico": "Pedagógico",
  "Financeiro": "Financeiro",
  "Recursos_Humanos": "Recursos Humanos",
  "Outro": "Outro",
  "CEI_LUIZ_FELIPE": "CEI Luiz Felipe",
  "CEI_ARCO_IRIS": "CEI Arco Íris",
  "CEI_BRUNO_LEONARDO": "CEI Bruno Leonardo",
  "CEI_DOM_FRANCO": "CEI Dom Franco",
  "CEI_MENINO_JESUS": "CEI Menino Jesus",
  "CEI_NOSSO_LAR": "CEI Nosso Lar",
  "CEI_VASCO_PAPA": "CEI Vasco Papa",
  "CEI_CRIANCA_FELIZ": "CEI Criança Feliz",
  "CEM_SAO_CRISTOVAO": "CEM São Cristóvão",
  "CEM_GUILHERME": "CEM Guilherme",
  "CEM_ORLANDO_PEREIRA": "CEM Orlando Pereira",
  "EM_MARIA_HILDA": "EM Maria Hilda",
  "EM_PAULO_FREIRE": "EM Paulo Freire",
  "EM_JOSE_ANCHIETA": "EM José Anchieta",
  "ERM_ALVARES_AZEVEDO": "ERM Alvares Azevedo",
  "ERM_CORA_CORALINA": "ERM Cora Coralina",
  "ERM_EUCLIDES_CUNHA": "ERM Euclides Cunha",
  "ERM_OSVALDO_CRUZ": "ERM Osvaldo Cruz",
  "ERM_VINICIUS_DE_MORAIS": "ERM Vinicius de Morais",
};

export default function RelatoriosPage() {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const filteredParticipantes = filtroDepartamento
    ? participantes.filter(p => p.departamento === filtroDepartamento)
    : participantes;

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.push("/admin");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [partRes, statsRes] = await Promise.all([
        fetch("/api/participantes"),
        fetch("/api/stats"),
      ]);
      const partData = await partRes.json();
      const statsData = await statsRes.json();

      setParticipantes(Array.isArray(partData) ? partData : []);
      setStats(statsData);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const getDeptLabel = (value: string) => {
    return departamentos[value] || value;
  };

  const generatePDF = async (tipo: "completo" | "confirmados" | "por_departamento" | "por_prato" | "nao_participam") => {
    setGenerating(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(230, 57, 70);
      doc.rect(0, 0, pageWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("ARRAIÁ DA EDUCAÇÃO 2026", pageWidth / 2, 10, { align: "center" });
      doc.setFontSize(10);
      doc.text("Secretaria Municipal de Educação", pageWidth / 2, 17, { align: "center" });

      let filteredData = participantes;
      let title = "";

      switch (tipo) {
        case "completo":
          title = "RELATÓRIO COMPLETO DE PARTICIPANTES";
          break;
        case "confirmados":
          title = "PARTICIPANTES CONFIRMADOS";
          filteredData = participantes.filter(p => p.participa);
          break;
        case "por_departamento":
          title = "PARTICIPANTES POR DEPARTAMENTO";
          filteredData = participantes.filter(p => p.participa);
          break;
        case "por_prato":
          title = "PRATOS ESCOLHIDOS POR PARTICIPANTE";
          filteredData = participantes.filter(p => p.participa && p.pratoNome !== "Nenhum");
          break;
        case "nao_participam":
          title = "PARTICIPANTES QUE NÃO PARTICIPARÃO";
          filteredData = participantes.filter(p => !p.participa);
          break;
      }

      // Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(title, 14, 35);

      // Date
      doc.setFontSize(9);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 42);

      // Stats summary
      if (stats) {
        doc.setFontSize(10);
        const summaryY = 49;
        doc.text(`Total de Confirmados: ${stats.confirmados}`, 14, summaryY);
        doc.text(`Adultos: ${stats.adultos}`, 80, summaryY);
        doc.text(`Crianças: ${stats.criancas}`, 130, summaryY);
        doc.text(`Total de Pessoas: ${stats.totalPessoas}`, 190, summaryY);
      }

      // Table data
      const startY = tipo === "por_departamento" || tipo === "por_prato" ? 55 : 55;

      if (tipo === "por_departamento") {
        // Group by department
        const deptMap = new Map<string, Participante[]>();
        filteredData.forEach(p => {
          const dept = p.departamento;
          if (!deptMap.has(dept)) deptMap.set(dept, []);
          deptMap.get(dept)!.push(p);
        });

        const tableData: string[][] = [];
        let totalAdultos = 0;
        let totalCriancas = 0;
        let totalGeral = 0;

        deptMap.forEach((parts, dept) => {
          const deptAdultos = parts.reduce((sum, p) => sum + p.adultos, 0);
          const deptCriancas = parts.reduce((sum, p) => sum + p.criancas, 0);
          const deptTotal = deptAdultos + deptCriancas;
          totalAdultos += deptAdultos;
          totalCriancas += deptCriancas;
          totalGeral += deptTotal;
          tableData.push([
            getDeptLabel(dept),
            String(parts.length),
            String(deptAdultos),
            String(deptCriancas),
            String(deptTotal),
          ]);
        });

        tableData.push(["TOTAL", String(filteredData.length), String(totalAdultos), String(totalCriancas), String(totalGeral)]);

        autoTable(doc, {
          startY,
          head: [["Departamento", "Famílias", "Adultos", "Crianças", "Total Pessoas"]],
          body: tableData,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [230, 57, 70] },
          footStyles: { fillColor: [244, 162, 97], fontStyle: "bold" },
        });
      } else if (tipo === "por_prato") {
        // Group by prato
        const pratoMap = new Map<string, Participante[]>();
        filteredData.forEach(p => {
          const prato = p.pratoNome;
          if (!pratoMap.has(prato)) pratoMap.set(prato, []);
          pratoMap.get(prato)!.push(p);
        });

        const tableData: string[][] = [];
        pratoMap.forEach((parts, prato) => {
          tableData.push([
            prato,
            String(parts.length),
            parts.map(p => p.nome).join(", "),
          ]);
        });

        autoTable(doc, {
          startY,
          head: [["Prato", "Quantidade", "Participantes"]],
          body: tableData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [230, 57, 70] },
          columnStyles: {
            2: { cellWidth: 120 },
          },
        });
      } else {
        // Regular table
        const tableData = filteredData.map(p => [
          p.nome,
          p.cpf || "-",
          p.telefone || "-",
          getDeptLabel(p.departamento),
          p.participa ? "Sim" : "Não",
          String(p.adultos),
          String(p.criancas),
          String(p.totalPessoas),
          p.pratoNome,
          p.observacao || "-",
        ]);

        autoTable(doc, {
          startY,
          head: [["Nome", "CPF", "Telefone", "Departamento", "Participa", "Adultos", "Crianças", "Total", "Prato", "Observação"]],
          body: tableData,
          styles: { fontSize: 7 },
          headStyles: { fillColor: [230, 57, 70] },
          columnStyles: {
            9: { cellWidth: 40 },
          },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount} | Desenvolvido pelo Departamento de Tecnologia da SME`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`arraia_educacao_2026_${tipo}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Carregando relatórios...</p>
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
              <span className="text-3xl">📄</span>
              <div>
                <h1 className="text-xl font-bold">Relatórios</h1>
                <p className="text-red-200 text-sm">Gere relatórios em PDF do evento</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
              📊 Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Resumo do Evento</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">{stats?.confirmados || 0}</p>
              <p className="text-sm text-slate-600">Confirmados</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">{stats?.adultos || 0}</p>
              <p className="text-sm text-slate-600">Adultos</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <p className="text-3xl font-bold text-pink-600">{stats?.criancas || 0}</p>
              <p className="text-sm text-slate-600">Crianças</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-3xl font-bold text-amber-600">{stats?.totalPessoas || 0}</p>
              <p className="text-sm text-slate-600">Total de Pessoas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-600">{stats?.totalGeral || 0}</p>
              <p className="text-sm text-slate-600">Total Geral</p>
            </div>
          </div>
        </div>

        {/* PDF Reports */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">📋 Gerar Relatórios PDF</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Relatório Completo */}
            <button
              onClick={() => generatePDF("completo")}
              disabled={generating}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📑</span>
                <div>
                  <h4 className="font-bold text-lg">Relatório Completo</h4>
                  <p className="text-red-200 text-sm">Lista com todos os participantes cadastrados</p>
                </div>
              </div>
            </button>

            {/* Confirmados */}
            <button
              onClick={() => generatePDF("confirmados")}
              disabled={generating}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">✅</span>
                <div>
                  <h4 className="font-bold text-lg">Confirmados</h4>
                  <p className="text-green-200 text-sm">Apenas participantes confirmados</p>
                </div>
              </div>
            </button>

            {/* Por Departamento */}
            <button
              onClick={() => generatePDF("por_departamento")}
              disabled={generating}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🏢</span>
                <div>
                  <h4 className="font-bold text-lg">Por Departamento</h4>
                  <p className="text-blue-200 text-sm">Agrupado por departamento/escola</p>
                </div>
              </div>
            </button>

            {/* Por Prato */}
            <button
              onClick={() => generatePDF("por_prato")}
              disabled={generating}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🍽️</span>
                <div>
                  <h4 className="font-bold text-lg">Por Prato</h4>
                  <p className="text-amber-200 text-sm">Agrupado por prato escolhido</p>
                </div>
              </div>
            </button>

            {/* Não Participam */}
            <button
              onClick={() => generatePDF("nao_participam")}
              disabled={generating}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">❌</span>
                <div>
                  <h4 className="font-bold text-lg">Não Participam</h4>
                  <p className="text-slate-300 text-sm">Cadastros com participação negada</p>
                </div>
              </div>
            </button>
          </div>

          {generating && (
            <div className="mt-4 text-center text-slate-600">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full" />
                Gerando PDF...
              </div>
            </div>
          )}
        </div>

        {/* Preview Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800">👁️ Pré-visualização dos Dados</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">Departamento:</label>
              <select
                value={filtroDepartamento}
                onChange={e => setFiltroDepartamento(e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-red-500 outline-none transition-all bg-white text-sm"
              >
                <option value="">Todos</option>
                {Object.entries(departamentos).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredParticipantes.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <span className="text-6xl">📭</span>
              <p className="mt-4 text-lg">Nenhum participante cadastrado ainda</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipantes.slice(0, 10).map(part => (
                    <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{part.nome}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{getDeptLabel(part.departamento)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{part.telefone || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        👨 {part.adultos} + 👧 {part.criancas} = <strong>{part.totalPessoas}</strong>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredParticipantes.length > 10 && (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Exibindo 10 de {filteredParticipantes.length} participantes. Gere o PDF para ver a lista completa.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-2 text-center text-[10px] text-slate-500 bg-slate-100 border-t border-slate-200 mt-8">
        Desenvolvido pelo Departamento de Tecnologia da SME.
      </footer>
    </main>
  );
}
