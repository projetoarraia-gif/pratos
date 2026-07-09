"use client";

import Link from "next/link";

export default function SucessoPage() {
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      "🎉 Estarei presente no Arraiá da Educação 2026! 🏫✨\n\n📅 Data: 24 de Julho de 2026\n🕗 Horário: 20h\n📍 Local: Em frente à Secretaria Municipal de Educação\n\nVenha você também! Confirme sua participação!"
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-600 via-amber-500 to-amber-100 relative">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
            {/* Success animation */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full animate-pulse-slow">
                <span className="text-6xl">✅</span>
              </div>
            </div>

            {/* Confetti emojis */}
            <div className="text-4xl mb-6 animate-float">
              🎊 🎉 🏮 🎆 🎶
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-green-600 mb-4">
              Obrigado!
            </h1>

            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Sua presença foi confirmada com sucesso.
            </p>

            <p className="text-slate-600 mb-8">
              Nos vemos no <strong className="text-red-600">Arraiá da Educação 2026</strong>! 🎪
            </p>

            {/* Event reminder */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200">
              <p className="text-sm text-slate-500 mb-2">Lembre-se:</p>
              <div className="space-y-2">
                <p className="text-slate-700">📅 <strong>24 de Julho de 2026</strong></p>
                <p className="text-slate-700">🕗 <strong>20h</strong></p>
                <p className="text-slate-700">📍 <strong>Em frente à Secretaria Municipal de Educação</strong></p>
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mb-4 flex items-center justify-center gap-2"
            >
              📱 Compartilhar no WhatsApp
            </button>

            {/* Back to home */}
            <Link
              href="/"
              className="inline-block text-red-600 hover:text-red-700 font-semibold underline transition-colors"
            >
              ← Voltar para a página inicial
            </Link>
          </div>

          {/* Footer decorations */}
          <div className="text-center mt-8 text-amber-100 text-xl space-x-3">
            <span>💃</span><span>🕺</span><span>🎵</span><span>🎆</span><span>🎊</span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-2 text-center text-[10px] text-amber-200 bg-red-800/50">
        Desenvolvido pelo Departamento de Tecnologia da SME.
      </footer>
    </main>
  );
}
