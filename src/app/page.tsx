"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [config, setConfig] = useState({
    data: "24 de Julho de 2026",
    horario: "20h",
    local: "Em frente à Secretaria Municipal de Educação",
  });

  useEffect(() => {
    // Fetch event configuration
    fetch("/api/configuracoes")
      .then(res => res.json())
      .then(data => {
        if (data.data_evento) {
          const date = new Date(data.data_evento + "T20:00:00");
          const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
          setConfig({
            data: `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`,
            horario: data.horario_evento || "20:00",
            local: data.local_evento || "Em frente à Secretaria Municipal de Educação",
          });
        }
      })
      .catch(() => {});

    const targetDate = new Date("2026-07-24T20:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-800 via-green-600 to-yellow-400" />

      {/* Decorative triangles / bunting */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1200 60" className="w-full h-full" preserveAspectRatio="none">
          {[...Array(20)].map((_, i) => (
            <g key={i}>
              <polygon
                points={`${i * 60},0 ${i * 60 + 30},45 ${(i + 1) * 60},0`}
                fill={['#e63946', '#f4a261', '#2a9d8f', '#e9c46a'][i % 4]}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 text-4xl animate-float" style={{ animationDelay: '0s' }}>🏮</div>
      <div className="absolute top-32 right-16 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🌽</div>
      <div className="absolute top-48 left-1/4 text-2xl animate-float" style={{ animationDelay: '1s' }}>🎶</div>
      <div className="absolute bottom-40 right-1/4 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>🎆</div>
      <div className="absolute top-24 right-1/3 text-2xl animate-float" style={{ animationDelay: '0.3s' }}>🪅</div>
      <div className="absolute bottom-60 left-16 text-2xl animate-float" style={{ animationDelay: '0.7s' }}>⭐</div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo area */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-xl mb-4">
              <span className="text-5xl">🏫</span>
            </div>
            <p className="text-yellow-200 text-sm uppercase tracking-widest font-semibold">
              Secretaria Municipal de Educação
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-red-600 mb-2 tracking-tight">
                ARRAIÁ DA EDUCAÇÃO
              </h1>
              <div className="inline-block bg-amber-400 text-red-700 font-black text-2xl md:text-3xl px-6 py-1 rounded-full shadow-md">
                2026
              </div>
            </div>

            {/* Invitation message */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200">
              <p className="text-lg text-slate-700 leading-relaxed text-center italic">
                &quot;Convidamos você e sua família para uma noite especial de confraternização, 
                alegria e valorização das nossas tradições.&quot;
              </p>
              <p className="text-center mt-4 text-slate-600">
                Venha participar do <strong className="text-red-600">Arraiá da Educação</strong>.
              </p>
              <p className="text-center mt-2 text-slate-600">
                Será uma noite com muita música, comidas típicas, diversão e integração entre todos.
              </p>
            </div>

            {/* Event info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <span className="text-3xl">📅</span>
                <p className="mt-2 font-semibold text-slate-800">Data</p>
                <p className="text-red-600 font-bold">{config.data}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <span className="text-3xl">🕗</span>
                <p className="mt-2 font-semibold text-slate-800">Horário</p>
                <p className="text-amber-600 font-bold">{config.horario}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <span className="text-3xl">📍</span>
                <p className="mt-2 font-semibold text-slate-800">Local</p>
                <p className="text-green-600 font-bold text-sm">{config.local}</p>
              </div>
            </div>

            {/* Additional info */}
            <div className="text-center text-slate-600 mb-8 space-y-2">
              <p>Para tornar nossa festa ainda mais especial, solicitamos que cada família 
                <strong className="text-red-600"> escolha um prato típico</strong> para contribuir com a festança.</p>
              <p>Cada família deverá levar sua <strong className="text-amber-600">bebida de preferência</strong>.</p>
              <p className="font-semibold text-slate-700">Esperamos você! 🎉</p>
            </div>

            {/* Countdown */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-8 text-white">
              <p className="text-center font-semibold mb-4 text-amber-300">⏰ Contagem Regressiva</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <span className="text-3xl font-bold">{countdown.days}</span>
                  </div>
                  <p className="text-xs mt-2 text-amber-200">Dias</p>
                </div>
                <div>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <span className="text-3xl font-bold">{countdown.hours}</span>
                  </div>
                  <p className="text-xs mt-2 text-amber-200">Horas</p>
                </div>
                <div>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <span className="text-3xl font-bold">{countdown.minutes}</span>
                  </div>
                  <p className="text-xs mt-2 text-amber-200">Minutos</p>
                </div>
                <div>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <span className="text-3xl font-bold">{countdown.seconds}</span>
                  </div>
                  <p className="text-xs mt-2 text-amber-200">Segundos</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link
                href="/confirmar"
                className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse-slow"
              >
                ✨ CONFIRMAR PARTICIPAÇÃO ✨
              </Link>
            </div>
          </div>

          {/* Admin link */}
          <div className="text-center mt-6">
            <Link
              href="/admin"
              className="text-yellow-200 hover:text-white text-sm underline transition-colors"
            >
              Área Administrativa
            </Link>
          </div>

          {/* Footer decorations */}
          <div className="text-center mt-8 text-yellow-200 text-2xl space-x-4">
            <span>🎪</span>
            <span>🎵</span>
            <span>🎊</span>
            <span>💃</span>
            <span>🕺</span>
            <span>🎆</span>
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
