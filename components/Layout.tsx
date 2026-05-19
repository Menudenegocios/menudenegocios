
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Store, LogOut, ArrowRight, Instagram, CreditCard } from 'lucide-react';
import { Logo } from './Logo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Quem Somos', path: '/quem-somos' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Parceiros', path: '/partners' },
    { label: 'Agenda', path: '/eventos' },
    { label: 'Blog', path: '/blog' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 flex justify-between items-center h-24">
          <Link to="/" className="group flex-shrink-0">
            <Logo size="sm" />
          </Link>

          <nav className="hidden xl:flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-bold tracking-tight transition-all px-2 py-1 rounded-lg hover:text-brand-primary ${
                  isActive(item.path)
                    ? 'text-brand-primary'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4 p-2 pr-4 rounded-full border bg-white border-gray-200">
                <Link to="/profile" className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-black overflow-hidden hover:scale-105 transition-transform">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </Link>
                <Link to="/dashboard" className="text-xs font-black uppercase tracking-widest hover:text-brand-primary transition-colors text-slate-700">Painel</Link>
                <button onClick={logout} className="text-slate-400 hover:text-rose-500 transition-colors"><LogOut className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-xs font-black px-8 py-4 rounded-full uppercase tracking-widest shadow-lg bg-brand-dark text-white hover:opacity-90 transition-all">
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-brand-contrast"><Menu className="w-8 h-8" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pt-28">
        {children}
      </main>

      <footer className="bg-white text-brand-dark pt-24 pb-12 overflow-hidden relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <Link to="/">
                <Logo size="sm" />
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Elevando a conexão entre negócios locais e consumidores através de tecnologia inteligente e design funcional.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/menudenegociosoficial" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-brand-primary mb-8">Navegação</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600">
                <li><Link to="/marketplace" className="hover:text-brand-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/eventos" className="hover:text-brand-primary transition-colors">Agenda & Eventos</Link></li>
                <li><Link to="/blog" className="hover:text-brand-primary transition-colors">Insights & Dicas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-brand-primary mb-8">Empresa</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600">
                <li><Link to="/quem-somos" className="hover:text-brand-primary transition-colors">Quem Somos</Link></li>
                <li><Link to="/partners" className="hover:text-brand-primary transition-colors">Nossos Parceiros</Link></li>
                <li><Link to={user ? "/plans" : "/register"} className="hover:text-brand-primary transition-colors">Planos Pro</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-brand-primary">Comece Hoje</h4>
              <Link to="/register" className="group flex items-center justify-between bg-brand-dark text-white p-4 rounded-2xl font-black text-sm transition-all hover:bg-brand-primary">
                CADASTRAR NEGÓCIO
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to={user ? "/plans" : "/register"} className="group flex items-center justify-between border-2 border-brand-dark text-brand-dark p-4 rounded-2xl font-black text-sm transition-all hover:bg-brand-dark hover:text-white">
                PLANOS DE ADESÃO
                <CreditCard className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                &copy; 2026 MENU MENU DE NEGÓCIOS ALL-IN-ONE
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                CNPJ 34.718.659/0001-08
              </p>
            </div>
            <div className="flex gap-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Link to="/privacidade" className="hover:text-brand-primary transition-colors">Privacidade</Link>
              <Link to="/termos" className="hover:text-brand-primary transition-colors">Termos</Link>
            </div>
          </div>
        </div>
      </footer>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] xl:hidden">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-[80%] bg-white p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-12">
               <Logo size="sm" />
               <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-10 h-10 text-slate-400" /></button>
            </div>
            <nav className="flex flex-col gap-4">
               {navItems.map((item) => (
                 <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-black border-b border-gray-100 pb-3 ${
                    isActive(item.path) ? 'text-brand-primary' : 'text-brand-dark'
                  }`}
                >
                  {item.label}
                </Link>
               ))}
            </nav>
            <div className="mt-auto pt-8 flex flex-col gap-4">
               {!user ? (
                 <Link to="/login" className="w-full bg-brand-dark text-white p-6 rounded-3xl font-black text-center block uppercase tracking-widest">Login</Link>
               ) : (
                 <>
                   <Link to="/dashboard" className="w-full bg-brand-primary text-white p-6 rounded-3xl font-black text-center block uppercase tracking-widest">Meu Painel</Link>
                   <button
                     onClick={logout}
                     className="w-full flex items-center justify-center gap-2 p-6 bg-rose-50 text-rose-600 rounded-3xl font-black uppercase tracking-widest shadow-sm"
                   >
                     <LogOut className="w-6 h-6" /> Sair
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
