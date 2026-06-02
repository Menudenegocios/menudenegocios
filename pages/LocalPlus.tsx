
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ExternalLink, Lock, ArrowRight } from 'lucide-react';

const CLUB_URL = import.meta.env.VITE_CLUB_URL || 'https://club.menudenegocios.com';

export const LocalPlus: React.FC = () => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<{ access: string; refresh: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSessionData({
          access: data.session.access_token,
          refresh: data.session.refresh_token
        });
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const handleAccess = () => {
    if (!sessionData) return;
    const url = `${CLUB_URL}?token=${sessionData.access}&refresh=${sessionData.refresh}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
        <Lock className="w-10 h-10" />
        <p className="font-bold text-sm uppercase tracking-widest">Sessão expirada. Faça login novamente.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 gap-10 animate-fade-in">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
        <Sparkles className="w-4 h-4" />
        Menu Club
      </div>

      {/* Headline */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-tight">
          Clube de <span className="text-indigo-600">Vantagens</span>
        </h1>
        <p className="text-slate-500 font-medium text-base leading-relaxed max-w-sm mx-auto">
          Acesse o Menu Club e aproveite benefícios exclusivos com autenticação automática.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleAccess}
        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-200"
      >
        <ExternalLink className="w-5 h-5" />
        Acessar o Menu Club
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
        Você será redirecionado e autenticado automaticamente
      </p>
    </div>
  );
};
