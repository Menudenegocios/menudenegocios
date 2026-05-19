
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Smartphone, Package, 
  Trophy, LogOut, Menu, X, Star, Layout, 
  Store, ChevronLeft, Briefcase, GraduationCap,
  Handshake, CreditCard, Sparkles, BookOpen, Settings2,
  AlertCircle, ChevronRight, Globe, LayoutGrid, Lock,
  Rocket, ArrowRight, Eye, TrendingUp
} from 'lucide-react';
import { Logo } from './Logo';
import { AIChatAgent } from './AIChatAgent';
import { motion } from 'framer-motion';
import { NotificationCenter } from './NotificationCenter';
import { MessageSquare } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isImpersonating, stopImpersonating, adminUser } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradePlanInfo, setUpgradePlanInfo] = useState<{ plan: string; to: string }>({ plan: '', to: '' });

  if (!user) return null;

  // Verifica se o usuário tem permissão de acesso (Se for Admin ou se o plano for PRO/Business)
  const isAdmin = user.role === 'admin';
  const hasPaidPlan = user.plan === 'pro' || user.plan === 'full';
  const isPreRegistration = user.plan === 'pre-cadastro';

  const menuItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, to: '/dashboard', locked: false, minPlan: 'pre-cadastro' },
    { 
      label: 'Comece por aqui', 
      icon: GraduationCap, 
      to: '/academy', 
      locked: false, 
      minPlan: 'pre-cadastro',
      subItems: [
        { label: 'Treinamentos', to: '/academy' },
        { label: 'Certificados', to: '/academy' }
      ]
    },
    ...(isAdmin ? [{ 
      label: 'Central Admin', 
      icon: Settings2, 
      to: '/admin-central', 
      locked: false, 
      minPlan: 'admin',
      subItems: [
        { label: 'Membros', to: '/admin-central?tab=membros' },
        { label: 'Agenda', to: '/admin-central?tab=agenda' },
        { label: 'Marketplace', to: '/admin-central?tab=marketplace' },
        { label: 'Parceiros', to: '/admin-central?tab=parceiros' }
      ]
    }] : []),
    { 
      label: 'Minha vitrine', 
      icon: Globe, 
      to: '/catalog', 
      locked: isPreRegistration && !isAdmin, 
      minPlan: 'basic',
      subItems: [
        { label: 'Identidade', to: '/catalog?tab=identity' },
        { label: 'Produtos', to: '/catalog?tab=products' },
        { label: 'Blog', to: '/catalog?tab=blog' },
        { label: 'Configurações', to: '/catalog?tab=landing' },
        { label: 'Ver minha vitrine', to: `/store/${user.id}` }
      ]
    },
    { 
      label: 'CRM', 
      icon: Briefcase, 
      to: '/business-suite?tab=crm',
      locked: (user.plan === 'basic' || isPreRegistration) && !isAdmin,
      minPlan: 'pro',
      subItems: [
        { label: 'Início', to: '/business-suite?tab=crm_home' },
        { label: 'Pipeline de Vendas', to: '/business-suite?tab=crm' }
      ]
    },
    { 
      label: 'Financeiro', 
      icon: TrendingUp, 
      to: '/business-suite?tab=finance',
      locked: (user.plan === 'basic' || isPreRegistration) && !isAdmin,
      minPlan: 'pro',
      subItems: [
        { label: 'Início', to: '/business-suite?tab=finance_home' },
        { label: 'Fluxo de Caixa', to: '/business-suite?tab=finance' }
      ]
    },
    { 
      label: 'Menu Match', 
      icon: Trophy, 
      to: '/rewards',
      subItems: [
        ...(!isPreRegistration || isAdmin ? [{ label: 'Chat', to: '/rewards?tab=chat' }] : []),
        { label: 'Reunião 1x1', to: '/rewards?tab=meeting' },
        { label: 'Pontos & Ranking', to: '/rewards' },
        { label: 'Níveis', to: '/rewards?tab=acceleration' },
        { label: 'Indicações', to: '/rewards?tab=referrals' }
      ]
    },
    { 
      label: 'Gestão de projetos', 
      icon: LayoutGrid, 
      to: '/project-management', 
      locked: isPreRegistration && !isAdmin, 
      minPlan: 'basic',
      subItems: [
        { label: 'Meus projetos', to: '/project-management' },
        { label: 'Quadro Kanban', to: '/project-management' }
      ]
    },
    { 
      label: 'Gestão de Conteúdo', 
      icon: BookOpen, 
      to: '/content-management', 
      locked: isPreRegistration && !isAdmin, 
      minPlan: 'basic',
      subItems: [
        { label: 'Visão Geral', to: '/content-management' },
        { label: 'Calendário', to: '/content-management' }
      ]
    },
    { 
      label: 'Menu Club', 
      icon: Sparkles, 
      to: '/local-plus', 
      locked: false, 
      minPlan: 'pre-cadastro',
      subItems: [
        { label: 'Marketplace', to: '/local-plus?tab=home' },
        { label: 'Negócios', to: '/local-plus?tab=match' },
        { label: 'Categorias', to: '/local-plus?tab=categories' }
      ]
    },
    { 
      label: 'Planos de adesão', 
      icon: CreditCard, 
      to: '/plans', 
      locked: false, 
      minPlan: 'pre-cadastro',
      subItems: [
        { label: 'Trocar plano', to: '/plans' },
        { label: 'Minhas faturas', to: '/plans' }
      ]
    },
  ];

  // Auto-expande o menu se uma sub-página estiver ativa
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => isActive(sub.to))) {
        if (!expandedItems.includes(item.label)) {
          setExpandedItems(prev => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const toggleSubItems = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpanded) {
      setExpandedItems(prev => 
        prev.includes(item.label) 
          ? prev.filter(v => v !== item.label) 
          : [...prev, item.label]
      );
    } else {
      setIsExpanded(true);
      setExpandedItems([item.label]);
    }
  };

  const handleItemClick = (e: React.MouseEvent, item: any) => {
    if (item.locked && item.to !== '/plans') {
      e.preventDefault();
      setUpgradePlanInfo({ plan: planNames[item.minPlan] || 'Próximo Plano', to: item.to });
      setIsUpgradeModalOpen(true);
      return;
    }

    if (item.to === '#') e.preventDefault();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const planNames: Record<string, string> = {
    'pre-cadastro': 'Pré-cadastro',
    basic: 'Plano Start',
    pro: 'Plano PRO',
    full: 'Plano FULL'
  };

  return (
    <div className="flex flex-col h-screen bg-brand-surface overflow-hidden transition-colors duration-300 font-sans">
      <style>{`
        @keyframes shimmerSidebar {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        .animate-shimmer-sidebar {
          animation: shimmerSidebar 2.5s infinite ease-in-out;
        }
      `}</style>
      
      {/* BANNER MODO PERSONIFICAÇÃO */}
      {isImpersonating && (
        <div className="bg-emerald-600 text-white px-6 py-3 flex justify-between items-center z-[100] shadow-xl animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest">Modo Personificação Ativo</p>
                 <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Editando a vitrine de: <span className="underline">{user.name}</span></p>
              </div>
           </div>
           <button 
             onClick={stopImpersonating}
             className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg"
           >
              <ArrowRight className="w-4 h-4 rotate-180" /> VOLTAR PARA ADMIN
           </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside 
          className={`hidden lg:flex flex-col relative flex-shrink-0 transition-all duration-500 ease-in-out my-5 ml-5 h-[calc(100vh-2.5rem)] z-40 ${
            isExpanded ? 'w-72' : 'w-[5.5rem]'
          }`}
        >
          {/* Fundo Glassmorphism */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden flex flex-col pointer-events-auto">
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className={`flex items-center mb-10 transition-all ${isExpanded ? 'justify-start px-2' : 'justify-center'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <Link to="/" className="flex items-center">
                     <Logo variant={isExpanded ? 'full' : 'icon'} size={isExpanded ? "xs" : "xxs"} />
                  </Link>
                </div>
              </div>

              <nav className="space-y-0.5">
              {menuItems.map((item) => (
                <div key={item.label}>
                  <Link
                    to={item.to}
                    onClick={(e) => handleItemClick(e, item)}
                    className={`flex items-center rounded-2xl transition-all duration-300 group overflow-hidden relative ${
                      isActive(item.to) 
                        ? 'text-white shadow-lg shadow-indigo-500/30' 
                        : 'text-slate-500 hover:bg-white/60 hover:text-indigo-600'
                    } ${isExpanded ? 'px-4 py-2.5 gap-4' : 'p-3.5 justify-center mx-auto w-12 h-12'}`}
                  >
                    {isActive(item.to) && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl"></div>
                        <div className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sidebar"></div>
                      </>
                    )}
                    
                    <item.icon className={`w-5 h-5 transition-transform duration-300 relative z-10 ${isActive(item.to) ? 'text-white scale-110' : 'text-slate-400 group-hover:text-indigo-600 group-hover:scale-110'}`} />
                    {isExpanded && (
                      <div className="flex items-center justify-between flex-1 overflow-hidden relative z-10">
                        <span className={`animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap text-[13px] font-black italic ${isActive(item.to) ? 'text-white' : 'text-slate-600 group-hover:text-indigo-600'}`}>
                          {item.label}
                        </span>
                        {item.subItems && (
                          <div 
                            onClick={(e) => toggleSubItems(e, item)}
                            className={`p-1 rounded-lg transition-all ${isActive(item.to) ? 'hover:bg-white/20 text-white' : 'hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600'}`}
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedItems.includes(item.label) ? 'rotate-90' : ''}`} />
                          </div>
                        )}
                      </div>
                    )}
                  </Link>

                  {isExpanded && item.subItems && (
                    <div className={`mt-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-80 mb-2' : 'max-h-0'}`}>
                      <div className="pl-12 space-y-1">
                        {item.subItems
                          .filter(sub => sub.to !== item.to)
                          .map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            className={`block py-1.5 text-[11px] font-bold transition-colors ${isActive(sub.to) ? 'text-indigo-600' : 'text-slate-400 hover:text-brand-dark'}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

            <div className="mt-auto p-5 border-t border-white/50 relative z-10">
              <button 
                onClick={logout}
                className={`flex items-center gap-4 py-4 rounded-2xl font-black text-[10px] tracking-widest bg-rose-50/50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all duration-300 w-full group shadow-sm border border-rose-100/50 ${!isExpanded ? 'justify-center p-3.5 mx-auto w-12 h-12' : 'px-5'}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                {isExpanded && <span className="animate-in fade-in slide-in-from-left-1 duration-300">Sair da conta</span>}
              </button>
            </div>
          </div>
          
          {/* Floating Expand/Collapse Button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3.5 top-16 p-2 bg-white border border-indigo-100 shadow-[0_4px_16px_rgba(31,38,135,0.12)] text-slate-400 hover:text-indigo-600 hover:scale-110 hover:shadow-[0_4px_20px_rgba(79,70,229,0.3)] rounded-full transition-all duration-300 z-50 flex items-center justify-center cursor-pointer"
          >
             <ChevronLeft className={`w-4 h-4 transition-transform duration-500 ${!isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className={`h-20 bg-white border-b border-brand-secondary/10 px-6 lg:px-10 flex justify-between items-center sticky top-0 z-30 flex-shrink-0`}>
             <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2.5 bg-brand-surface rounded-xl text-brand-secondary lg:hidden"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <nav className="hidden md:flex items-center gap-8">
                  <Link to="/" className="text-[10px] font-black tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">SITE PRINCIPAL</Link>
                </nav>

                <div className="h-6 w-px bg-brand-secondary/10 hidden md:block"></div>

                <span className="font-black text-brand-dark text-sm tracking-tight hidden sm:block uppercase">
                  {menuItems.find(i => isActive(i.to))?.label || 'Painel'}
                </span>
             </div>
             
              <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col text-right">
                     <div className="flex items-center justify-end gap-2">
                       <span className="text-[11px] font-black text-brand-dark leading-none">{user.name}</span>
                       {user.has_founder_badge && (
                         <span className="bg-gradient-to-r from-[#F67C01] to-orange-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">
                           FUNDADOR
                         </span>
                       )}
                     </div>
                     <span className="text-[9px] text-indigo-500 font-black tracking-widest mt-1 uppercase">
                       {isAdmin ? 'ADMINISTRADOR' : planNames[user.plan]}
                     </span>
                  </div>
                 <div className="flex items-center gap-2">
                   <NotificationCenter />
                   <Link to="/profile" className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm font-black border border-brand-secondary/10 hover:scale-105 transition-transform overflow-hidden">
                     {user.photo_url ? (
                       <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                       user.name.charAt(0)
                     )}
                   </Link>
                   <button 
                     onClick={logout}
                     className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:scale-105 transition-all border border-rose-100"
                     title="Sair"
                   >
                     <LogOut className="w-5 h-5" />
                   </button>
                 </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col bg-white">
            <div className="flex-1 p-6 md:p-10">
              {children}
            </div>

            <footer className="bg-white border-t border-brand-secondary/10 py-8 px-10 mt-auto">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-brand-secondary">
                <div className="flex items-center gap-2">
                   <Logo size="sm" />
                </div>
                <div className="flex flex-col gap-1 items-center md:items-end">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-center md:text-right">
                    &copy; 2026 MENU MENU DE NEGÓCIOS ALL-IN-ONE
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-center md:text-right">
                    CNPJ 34.718.659/0001-08
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-fade-in">
           <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute top-0 left-0 bottom-0 w-[280px] bg-white/70 backdrop-blur-3xl border-r border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col animate-slide-in-left">
              <div className="p-6 border-b border-brand-secondary/10 flex justify-between items-center">
                 <Logo size="sm" />
                 <div className="flex items-center gap-2">
                   <NotificationCenter />
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group overflow-hidden relative ${
                        isActive(item.to) ? 'text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-white/80 hover:text-indigo-600 hover:shadow-sm'
                      }`}
                    >
                      {isActive(item.to) && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl"></div>
                          <div className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sidebar"></div>
                        </>
                      )}
                      <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive(item.to) ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-600'}`} />
                      <span className={`text-xs font-black italic relative z-10 transition-colors ${isActive(item.to) ? 'text-white' : 'text-slate-600 group-hover:text-indigo-600'}`}>{item.label}</span>
                    </Link>
                 ))}
              </div>
              <div className="p-6 border-t border-brand-secondary/10">
                 <button 
                   onClick={logout}
                   className="flex items-center gap-4 w-full p-4 rounded-2xl bg-rose-50/50 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm border border-rose-100/50 transition-all duration-300 group"
                 >
                   <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                   <span className="text-xs font-black italic">Sair da conta</span>
                 </button>
              </div>
           </aside>
        </div>
      )}

      <AIChatAgent />

      {/* Modal de Upgrade Necessário */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-sans">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
              <div className="absolute top-4 right-4 text-white/50">
                <Lock className="w-12 h-12 rotate-12 opacity-20" />
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="absolute top-6 right-6 p-2 h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-brand-primary" />
              </div>
              
              <h3 className="text-2xl font-black uppercase italic leading-tight">Acesso <span className="text-brand-primary">Limitado</span></h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mt-2">Este recurso pertence ao {upgradePlanInfo.plan}</p>
            </div>
            
            <div className="p-10 space-y-8">
              <p className="text-slate-500 font-medium leading-relaxed">
                Você está tentando acessar uma área exclusiva. Para desbloquear este e outros recursos premium, você precisa fazer o upgrade do seu plano atual.
              </p>
              
              <div className="space-y-3">
                <Link 
                  to="/plans" 
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  Ver planos disponíveis <ArrowRight className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="w-full bg-slate-50 text-slate-400 font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
                >
                  Voltar ao painel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
