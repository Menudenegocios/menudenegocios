import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Rocket, User, Trophy, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'semestral'>('semestral');

  const [loading, setLoading] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>('PIX');
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  const [pixModalData, setPixModalData] = useState<{ isOpen: boolean, qrCodeImage: string, payload: string, invoiceUrl?: string } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [installments, setInstallments] = useState<number>(12);

  const handleCopyPix = () => {
    if (pixModalData?.payload) {
      navigator.clipboard.writeText(pixModalData.payload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'danger' | 'success' | 'warning'
  });

  const showAlert = (title: string, message: string, type: any = 'info') => {
    setModalConfig({ isOpen: true, title, message, type });
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase.from('profiles').select('cpf_cnpj').eq('user_id', user.id).single();
        if (data) {
          setUserProfile(data);
          if (data.cpf_cnpj) setCpfCnpj(data.cpf_cnpj);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, navigate, user?.id]);

  const handleSubscribe = async (planKey: 'start' | 'pro' | 'full', methodOverride?: 'CREDIT_CARD' | 'PIX') => {
    if (!isAuthenticated) {
      navigate(`/register?plan=${planKey}&cycle=${billingCycle}`);
      return;
    }

    setLoading(true);
    try {
      const cycle = billingCycle === 'mensal' ? 'MONTHLY' : 'YEARLY';
      
      let value = 47;
      if (planKey === 'start') {
        value = billingCycle === 'mensal' ? 67 : 597;
      } else if (planKey === 'pro') {
        value = billingCycle === 'mensal' ? 197 : 1590;
      } else if (planKey === 'full') {
        value = billingCycle === 'mensal' ? 397 : 2990;
      }
      
      const result = await paymentService.checkout({
        planId: planKey,
        billingType: methodOverride || paymentMethod,
        cycle,
        value,
        cpfCnpj: cpfCnpj || undefined,
        installments: (methodOverride || paymentMethod) === 'CREDIT_CARD' && billingCycle === 'semestral' ? installments : undefined
      });

      if ((methodOverride || paymentMethod) === 'PIX' && result.pixQrCode) {
        setPixModalData({
          isOpen: true,
          qrCodeImage: result.pixQrCode.encodedImage,
          payload: result.pixQrCode.payload,
          invoiceUrl: result.invoiceUrl
        });
      } else if (result.invoiceUrl) {
        window.open(result.invoiceUrl, '_blank');
      } else {
        showAlert("Aviso", "Assinatura criada, mas o link de pagamento não foi gerado. Verifique seu e-mail.", "warning");
      }

    } catch (err: any) {
      if (err.message?.includes("CPF ou CNPJ") || err.message?.includes("cpfCnpj")) {
        setPendingPlan({ planKey });
        setShowCpfModal(true);
      } else {
        console.error("Erro na integração Asaas:", err);
        showAlert("Erro no Pagamento", err.message || "Ocorreu um erro ao processar sua assinatura.", "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCpf = async () => {
    if (!cpfCnpj || cpfCnpj.length < 11) {
      showAlert("Dados Incompletos", "Por favor, informe um CPF ou CNPJ válido para continuar.", "warning");
      return;
    }
    setShowCpfModal(false);
    if (pendingPlan) {
      handleSubscribe(pendingPlan.planKey, paymentMethod);
    }
  };

  const PlanCard = ({
    type, title, subtitle, priceMonthly, priceSemiannual, oldPrice, features, recommended = false, icon: Icon, color, btnText, planKey, extraInfo, rewards
  }: any) => {
    const currentPrice = billingCycle === 'mensal' ? priceMonthly : priceSemiannual;
    const cycleText = billingCycle === 'mensal' ? 'Mensal' : 'Semestral';

    return (
    <div className={`relative flex flex-col p-8 rounded-[3rem] border transition-all duration-500 ${recommended ? 'border-brand-primary bg-[#0F172A] text-white shadow-2xl scale-105 z-10' : 'border-gray-100 bg-white text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-2'}`}>
      {recommended && (
        <div className="absolute top-0 right-12 -mt-4 bg-gradient-to-r from-brand-primary to-orange-600 text-white text-[10px] font-black tracking-widest px-6 py-2 rounded-full shadow-xl">
          MAIS POPULAR
        </div>
      )}
      <div className="mb-8">
        <div className={`inline-flex items-center justify-center p-5 rounded-[2rem] mb-6 ${recommended ? 'bg-brand-primary/20 text-brand-primary shadow-[0_0_30px_rgba(246,124,1,0.2)]' : 'bg-gray-50 text-brand-primary'}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-3">{type}</h3>
        <h2 className="text-2xl font-black leading-tight mb-3 tracking-tighter italic uppercase">{title}</h2>
        <p className={`text-xs leading-relaxed font-medium whitespace-pre-line ${recommended ? 'text-slate-400' : 'text-gray-500'}`}>{subtitle}</p>
      </div>

      <div className="mb-10 flex flex-col min-h-[4.5rem] justify-center">
        {oldPrice && <span className="text-xs font-bold line-through opacity-40 mb-1 font-mono uppercase tracking-widest leading-none">De R$ {oldPrice}</span>}
        <div className="flex flex-col">
          {billingCycle === 'semestral' ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest font-mono opacity-60">Anual</span>
                <span className="text-4xl font-black tracking-tighter italic">
                  {planKey === 'start' && '12x R$ 59,00'}
                  {planKey === 'pro' && '12x R$ 159,00'}
                  {planKey === 'full' && '12x R$ 297,00'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                {planKey === 'start' && 'ou R$ 597,00 à vista'}
                {planKey === 'pro' && 'ou R$ 1.590,00 à vista'}
                {planKey === 'full' && 'ou R$ 2.990,00 à vista'}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest font-mono opacity-60">{cycleText}</span>
              <span className="text-4xl font-black tracking-tighter italic">R$ {currentPrice}</span>
            </div>
          )}
        </div>
        {extraInfo && <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-4 bg-brand-primary/10 w-fit px-3 py-1 rounded-full">{extraInfo}</p>}
        {rewards && (
          <div className={`mt-6 p-4 rounded-2xl border ${recommended ? 'bg-white/5 border-white/10' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-2 flex items-center gap-2">
              <Trophy className="w-3 h-3" /> Recompensas Imediatas:
            </p>
            <div className="flex flex-col">
              <span className={`text-lg font-black ${recommended ? 'text-white' : 'text-gray-900'}`}>{rewards.points} Pts</span>
              <span className="text-[8px] font-bold uppercase opacity-50">Autoridade na plataforma</span>
            </div>
          </div>
        )}
      </div>

      <ul className="flex-1 space-y-4 mb-10">
        {features.map((feature: any, idx: number) => {
          if (feature.startsWith('category:')) {
            const categoryTitle = feature.replace('category:', '');
            return (
              <li key={idx} className="pt-4 first:pt-0 border-t border-gray-100/50 first:border-none">
                <span className={`text-[10px] font-black uppercase tracking-wider ${recommended ? 'text-brand-primary' : 'text-indigo-600'}`}>{categoryTitle}</span>
              </li>
            );
          }
          return (
            <li key={idx} className="flex items-start gap-3">
              <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${recommended ? 'text-emerald-400' : 'text-brand-primary'}`} />
              <span className={`text-xs font-bold ${recommended ? 'text-slate-300' : 'text-gray-600'}`}>{feature}</span>
            </li>
          );
        })}
      </ul>
        <button 
          onClick={() => {
            setPendingPlan({ planKey });
            setShowCpfModal(true);
          }}
          disabled={loading}
          className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${recommended ? 'bg-brand-primary text-white shadow-[0_20px_50px_rgba(246,124,1,0.3)] hover:bg-orange-600 hover:-translate-y-1' : 'bg-[#0F172A] text-white hover:bg-slate-800 hover:-translate-y-1'}`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Rocket className="w-4 h-4" /> {btnText}</>}
        </button>
    </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 pt-4 px-4 animate-[fade-in_0.4s_ease-out]">

      <div className="flex flex-col items-center gap-6 text-center">
        <div className="space-y-4">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">Escolha seu plano de acesso</h2>
           <div className="h-1 w-20 bg-brand-primary rounded-full mx-auto"></div>
        </div>
        <div className="bg-white border border-gray-200 p-1.5 rounded-full flex items-center shadow-lg relative max-w-sm w-full mx-auto justify-center">
           <button onClick={() => setBillingCycle('mensal')} className={`flex-1 py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all z-10 ${billingCycle === 'mensal' ? 'bg-gray-900 shadow-xl text-white' : 'text-slate-400 hover:text-slate-600 bg-transparent'}`}>MENSAL</button>
           <button onClick={() => setBillingCycle('semestral')} className={`flex-1 py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-2 ${billingCycle === 'semestral' ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'text-slate-400 hover:text-slate-600 bg-transparent'}`}>
             ANUAL {billingCycle === 'semestral' && <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] -ml-1">PROMO</span>}
           </button>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch px-4 max-w-7xl mx-auto mt-12">
        <PlanCard type="STARTER" title="Plano Starter" planKey="start" priceMonthly="67,00" priceSemiannual="597,00" rewards={{ points: 50 }} icon={User} color="text-indigo-500" btnText="FAZER PARTE" subtitle="Para quem quer começar sua jornada empreendedora" features={['category:Comunidade & Networking', 'Comunidade exclusiva de empreendedores', 'Perfil profissional na plataforma', 'Oportunidades e vagas de negócios', 'category:Crescimento & Educação', 'Mentoria online semanal', 'Cursos gravados', 'Trilhas de desenvolvimento profissional', 'category:Benefícios & Engajamento', 'Programa de pontos e recompensas', 'Sistema de indicação', '20% de desconto em eventos presenciais']} />
        <PlanCard type="PRO" title="Plano Pro" planKey="pro" priceMonthly="197,00" priceSemiannual="1.590,00" rewards={{ points: 100 }} icon={Zap} color="text-brand-primary" btnText="ACELERAR NEGÓCIOS" recommended={true} extraInfo="BÔNUS: SELO FUNDADOR" subtitle="Para negócios que querem crescer, vender mais e ganhar posicionamento" features={['category:Crescimento & Autoridade', 'Maior exposição dentro da plataforma', 'Perfil e empresa verificados', 'Publicação de artigos', 'Menu Club Anúncios', 'category:Vendas & Expansão', 'Marketplace empresarial', 'Loja virtual completa', 'Catálogo digital profissional', 'CRM profissional integrado', 'Captação e gestão de leads', 'category:Gestão & Produtividade', 'Controle financeiro', 'Gestão de projetos', 'Gestão de conteúdo para redes sociais', 'category:Estratégia & Desenvolvimento', 'Análise 360 da empresa', 'Mentorias estratégicas', 'Networking empresarial direcionado', 'category:Eventos & Experiências', '1 evento presencial mensal incluso', '50% de desconto nos demais eventos']} />
        <PlanCard type="ENTERPRISE" title="Plano Enterprise" planKey="full" priceMonthly="397,00" priceSemiannual="2.990,00" rewards={{ points: 300 }} icon={Rocket} color="text-purple-500" btnText="ASSUMIR LIDERANÇA" extraInfo="VAGAS LIMITADAS" subtitle="Para empresas que desejam autoridade, expansão e posicionamento premium" features={['category:Estrutura do Plano', '1 empresa cadastrada', 'Até 3 pessoas com acesso', 'Produtos ilimitados', 'category:Autoridade & Visibilidade', 'Destaque na plataforma', 'Destaque no marketplace e feed', 'Participação no Menucast', 'Convite para palestrar em eventos', 'Posicionamento premium dentro da comunidade', 'category:Branding & Conteúdo', 'Teaser profissional Menucast', 'Fotos profissionais da equipe/empresa', 'Conteúdo estratégico para posicionamento', 'category:Crescimento & Expansão', 'Workshop exclusivo de vendas', 'Treinamento presencial exclusivo', 'Networking com empresários e parceiros estratégicos', 'Oportunidades de parcerias e negócios', 'category:Experiência Premium', 'Eventos VIP gratuitos', 'Área exclusiva em eventos', 'Prioridade máxima em networking e oportunidades']} />
      </div>
      </div>

      {showCpfModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">Dados de Faturamento</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Escolha a forma de pagamento e informe seus dados.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('PIX')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'PIX' ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <Zap className={`w-5 h-5 ${paymentMethod === 'PIX' ? 'text-brand-primary' : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'PIX' ? 'text-brand-primary' : 'text-gray-400'}`}>PIX</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('CREDIT_CARD')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'CREDIT_CARD' ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'CREDIT_CARD' ? 'text-brand-primary' : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'CREDIT_CARD' ? 'text-brand-primary' : 'text-gray-400'}`}>Cartão</span>
                  </button>
                </div>
                {billingCycle === 'semestral' && (
                  <div className="space-y-4 mt-3">
                    {paymentMethod === 'CREDIT_CARD' ? (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Opções de Parcelamento</label>
                        <select 
                          value={installments} 
                          onChange={(e) => setInstallments(Number(e.target.value))} 
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-slate-700 shadow-inner"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                            const total = pendingPlan?.planKey === 'start' ? 597 : pendingPlan?.planKey === 'pro' ? 1590 : 2990;
                            let parcelValue = 0;
                            if (num === 12) {
                              parcelValue = pendingPlan?.planKey === 'start' ? 59 : pendingPlan?.planKey === 'pro' ? 159 : 297;
                            } else {
                              parcelValue = Math.round((total / num) * 100) / 100;
                            }
                            return (
                              <option key={num} value={num}>
                                {num}x de R$ {parcelValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {num === 12 ? '⭐ (Promoção)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : (
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center animate-pulse italic mt-2">
                        {pendingPlan?.planKey === 'start' && 'R$ 597,00 à vista via PIX'}
                        {pendingPlan?.planKey === 'pro' && 'R$ 1.590,00 à vista via PIX'}
                        {pendingPlan?.planKey === 'full' && 'R$ 2.990,00 à vista via PIX'}
                      </p>
                    )}
                  </div>
                )}
                {billingCycle === 'mensal' && (
                   <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest text-center mt-2 italic opacity-60">
                    {paymentMethod === 'CREDIT_CARD' ? (
                      <>
                        {pendingPlan?.planKey === 'start' && 'R$ 67,00/mês no Cartão de Crédito'}
                        {pendingPlan?.planKey === 'pro' && 'R$ 197,00/mês no Cartão de Crédito'}
                        {pendingPlan?.planKey === 'full' && 'R$ 397,00/mês no Cartão de Crédito'}
                      </>
                    ) : (
                      <>
                        {pendingPlan?.planKey === 'start' && 'R$ 67,00 à vista via PIX'}
                        {pendingPlan?.planKey === 'pro' && 'R$ 197,00 à vista via PIX'}
                        {pendingPlan?.planKey === 'full' && 'R$ 397,00 à vista via PIX'}
                      </>
                    )}
                  </p>
                )}
              </div>

              {!userProfile?.cpf_cnpj && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF ou CNPJ</label>
                  <input type="text" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} placeholder="000.000.000-00" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none" />
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button onClick={handleConfirmCpf} className="w-full py-5 bg-brand-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">Confirmar e Assinar</button>
                <button onClick={() => setShowCpfModal(false)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pixModalData && pixModalData.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 text-center space-y-4 md:space-y-6 custom-scrollbar">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-8 h-8 text-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">Pagamento via PIX</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Escaneie o QR Code abaixo ou copie o código Pix para pagar.
              </p>
            </div>

            {pixModalData.qrCodeImage && (
              <div className="bg-slate-50 p-4 md:p-6 rounded-3xl inline-block mx-auto border border-gray-100 shadow-inner">
                <img 
                  src={`data:image/png;base64,${pixModalData.qrCodeImage}`} 
                  alt="Pix QR Code" 
                  className="w-40 h-40 md:w-44 md:h-44 mx-auto rounded-xl"
                />
              </div>
            )}

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Código Pix Copia e Cola</label>
              <div className="relative bg-slate-50 border border-gray-100 rounded-2xl p-4 font-mono text-[10px] text-slate-600 break-all max-h-24 overflow-y-auto select-all shadow-inner leading-relaxed">
                {pixModalData.payload}
              </div>
              <button 
                onClick={handleCopyPix}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${copiedPix ? 'bg-emerald-500 text-white shadow-emerald-500/10' : 'bg-gray-900 text-white hover:bg-slate-800'}`}
              >
                {copiedPix ? '✓ Código Copiado!' : 'Copiar Código Pix'}
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {pixModalData.invoiceUrl && (
                <button 
                  onClick={() => window.open(pixModalData.invoiceUrl, '_blank')}
                  className="w-full py-4 bg-brand-primary/10 text-brand-primary rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-brand-primary/20 transition-all"
                >
                  Página de Pagamento Completa
                </button>
              )}
              <button 
                onClick={() => setPixModalData(null)}
                className="w-full py-4 bg-gray-100 text-slate-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="Entendi"
      />
    </div>
  );
};
