
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { Lead, PipelineStage, FinancialEntry, ScheduleItem, Client, CRMTask, QuickMessageTemplate, FollowUp, CRMFunnel, CRMStage } from '../types';
import { 
  DollarSign, Calendar, Plus, TrendingUp, TrendingDown, 
  X, Trash2, CheckCircle, Clock, Briefcase, 
  Home as HomeIcon, RefreshCw, Zap, ArrowRight, User, Layout, GripVertical,
  Filter, CalendarDays, Wallet, ArrowUpCircle, ArrowDownCircle,
  Lock, Crown, Smartphone, MessageSquare, CreditCard, Link as LinkIcon, FileText, ExternalLink, LayoutGrid, Phone, UserCheck
} from 'lucide-react';
import { PhoneInput } from '../components/PhoneInput';
import { SectionLanding } from '../components/SectionLanding';
import { Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FinanceViewV2 } from '../components/financial/FinanceViewV2';

export const BusinessSuite: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [currentTool, setCurrentTool] = useState<'crm' | 'finance'>('crm');
  const [activeSubTab, setActiveSubTab] = useState<'explain' | 'tool'>('tool');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'finance') {
      setCurrentTool('finance');
      setActiveSubTab('tool');
    } else if (tab === 'finance_home') {
      setCurrentTool('finance');
      setActiveSubTab('explain');
    } else if (tab === 'crm_home') {
      setCurrentTool('crm');
      setActiveSubTab('explain');
    } else {
      // Padrão ou tab === 'crm'
      setCurrentTool('crm');
      setActiveSubTab('tool');
    }
  }, [location.search]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const hasAccess = isAdmin || (user.plan === 'pro' || user.plan === 'full');

  if (!hasAccess) {
      return (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl border border-brand-primary/20">
                  <Lock className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">Módulo de Gestão Business</h2>
              <p className="text-gray-500 max-w-md text-lg font-medium leading-relaxed mb-10">
                  A Central de Negócios (CRM, Financeiro e Agenda) é exclusiva para planos <span className="text-indigo-600 font-bold">PRO</span> e <span className="text-emerald-600 font-bold">Business</span>.
              </p>
              <Link to="/plans" className="bg-[#F67C01] text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                  <Crown className="w-5 h-5" /> DESBLOQUEAR FERRAMENTAS
              </Link>
          </div>
      );
  }

  const ToolIcon = currentTool === 'crm' ? Briefcase : DollarSign;
  const toolTitle = currentTool === 'crm' ? 'CRM & Vendas' : 'Financeiro';
  const toolSub = currentTool === 'crm' 
    ? 'O PAINEL DE CONTROLE DO SEU SUCESSO COMERCIAL.' 
    : 'CONTROLE TOTAL DE FLUXO DE CAIXA E ENTRADAS/SAÍDAS.';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-4 px-4">
      <div className="bg-[#0F172A] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-indigo-500/10 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl">
                 <ToolIcon className="h-10 w-10 text-brand-primary" />
              </div>
              <div>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#F67C01] to-[#9333EA] italic uppercase">{toolTitle}</span>
                 </h1>
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">{toolSub}</p>
              </div>
            </div>
          </div>

          <div className="flex p-1.5 mt-12 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 w-fit overflow-x-auto scrollbar-hide gap-1">
              {[
                { id: 'explain', label: 'Início', desc: 'Explicação', icon: HomeIcon },
                { 
                  id: 'tool', 
                  label: currentTool === 'crm' ? 'Funil & Clientes' : 'Fluxo de Caixa', 
                  desc: currentTool === 'crm' ? 'Gestão comercial' : 'Financeiro', 
                  icon: currentTool === 'crm' ? Briefcase : DollarSign 
                },
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveSubTab(tab.id as any)} 
                  className={`flex flex-col items-center justify-center min-w-[110px] px-6 py-3 rounded-[1.4rem] transition-all duration-300 whitespace-nowrap ${activeSubTab === tab.id ? 'bg-[#F67C01] text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <tab.icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-white' : 'text-brand-primary'}`} />
                    <span className="font-black text-[10px] tracking-widest italic">{tab.label}</span>
                  </div>
                  <span className={`text-[8px] font-medium opacity-60 ${activeSubTab === tab.id ? 'text-white' : ''}`}>{tab.desc}</span>
                </button>
              ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="animate-[fade-in_0.4s_ease-out]">
        {currentTool === 'crm' && activeSubTab === 'explain' && (
            <SectionLanding 
                title="Sua central de inteligência e gestão de leads."
                subtitle="CRM & Vendas"
                description="O painel de controle definitivo para suas vendas. No módulo de CRM, você organiza seu funil de vendas de forma visual (Kanban), acompanha o histórico de interações com os clientes, cria follow-ups e gerencia toda a sua carteira comercial de forma profissional e integrada."
                summaryText="O CRM é a espinha dorsal do seu crescimento comercial. Gerencie leads qualificados, mova-os pelo pipeline, agende lembretes de contato e tenha uma visão clara do seu potencial de receita."
                benefits={[
                  "CRM Kanban: Movimente seus leads e visualize sua previsão de receita.",
                  "Carteira de Clientes: Centralize o histórico e dados de quem confia em você.",
                  "Follow-ups Rápidos: Agende tarefas e registre cada contato feito com seus leads.",
                  "Importação e Exportação: Traga seus contatos via planilha XLSX com um clique."
                ]}
                ctaLabel="ABRIR PIPELINE DE VENDAS"
                onStart={() => setActiveSubTab('tool')}
                icon={Briefcase}
                accentColor="brand"
            />
        )}
        {currentTool === 'finance' && activeSubTab === 'explain' && (
            <SectionLanding 
                title="Seu controle financeiro simplificado e eficiente."
                subtitle="Financeiro"
                description="O painel financeiro ideal para sua empresa. Controle seu fluxo de caixa, registre entradas e saídas, gerencie categorias de receitas e despesas, e tenha relatórios visuais claros para tomar decisões estratégicas seguras."
                summaryText="O módulo Financeiro ajuda você a manter a saúde do seu caixa sob controle. Acompanhe saldos, receitas pendentes, despesas fixas e variáveis sem a complexidade de planilhas confusas."
                benefits={[
                  "Fluxo de Caixa: Registre entradas e saídas de forma extremamente simples.",
                  "Categorias Inteligentes: Organize seus lançamentos para saber exatamente onde gasta.",
                  "Resumo Mensal: Gráficos e indicadores rápidos de receitas, despesas e saldo.",
                  "Contas PF e PJ: Separe e organize suas finanças com total clareza."
                ]}
                ctaLabel="ABRIR CONTROLE FINANCEIRO"
                onStart={() => setActiveSubTab('tool')}
                icon={DollarSign}
                accentColor="brand"
            />
        )}
        {currentTool === 'crm' && activeSubTab === 'tool' && <CRMView user_id={user.id} />}
        {currentTool === 'finance' && activeSubTab === 'tool' && <FinanceViewV2 user_id={user.id} />}
      </div>
    </div>
  );
};

const DEFAULT_FUNNEL: CRMFunnel = {
  id: 'default',
  title: 'Funil Principal',
  stages: [
    { id: 'new', label: 'Novo Lead', bg: 'bg-blue-500' },
    { id: 'contacted', label: 'Contato', bg: 'bg-amber-500' },
    { id: 'negotiation', label: 'Proposta', bg: 'bg-purple-500' },
    { id: 'closed', label: 'Fechamento', bg: 'bg-emerald-600' },
  ]
};

const PRESET_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-emerald-500', 'bg-cyan-500', 'bg-slate-500', 'bg-black'
];

const CRMView = ({ user_id }: { user_id: string }) => {
  const [funnels, setFunnels] = useState<CRMFunnel[]>([DEFAULT_FUNNEL]);
  const [activeFunnelId, setActiveFunnelId] = useState<string>('default');
  const [isFunnelsModalOpen, setIsFunnelsModalOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<CRMFunnel | null>(null);
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);


  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'clients'>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({ name: '', phone: '', source: 'manual', stage: 'new', value: 0, notes: '' });
  const [clientFormData, setClientFormData] = useState<Partial<Client>>({ name: '', phone: '', email: '', notes: '' });
  const [followUpModal, setFollowUpModal] = useState<{isOpen: boolean, entityId: string, entityType: 'lead'|'client', entityName: string}>({isOpen: false, entityId: '', entityType: 'lead', entityName: ''});
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newFollowUp, setNewFollowUp] = useState('');
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);

  useEffect(() => { 
    loadLeads(); 
    loadClients();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await supabaseService.getProfileByUserId(user_id);
      if (profile?.store_config?.crm_funnels && profile.store_config.crm_funnels.length > 0) {
        setFunnels(profile.store_config.crm_funnels);
      }
    } catch(e) { console.error(e); }
  };

  const loadLeads = async () => { 
      try {
        const data = await supabaseService.getLeads(user_id); 
        setLeads(data); 
      } catch (e) { console.error(e); }
  };

  const loadClients = async () => {
      try {
        const data = await supabaseService.getClients(user_id);
        setClients(data);
      } catch (e) { console.error(e); }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return;
    setIsSaving(true);
    try {
        if (editingLead) await supabaseService.updateLead(editingLead.id, { ...formData });
        else await supabaseService.addLead({ ...formData, user_id } as Lead);
        setIsModalOpen(false);
        await loadLeads();
    } finally { setIsSaving(false); }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return;
    try {
      await supabaseService.deleteLead(id);
      setIsModalOpen(false);
      await loadLeads();
    } catch (e) { console.error(e); }
  };

  const handleSaveFunnels = async () => {
    setIsSaving(true);
    try {
      const profile = await supabaseService.getProfileByUserId(user_id);
      const newConfig = { ...(profile?.store_config || {}), crm_funnels: funnels };
      await supabaseService.updateProfile(user_id, { store_config: newConfig });
      alert('Configurações de funil salvas com sucesso!');
      setIsFunnelsModalOpen(false);
    } catch(e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handlePromoteLead = async (lead: Lead) => {
    if (!window.confirm(`Deseja promover ${lead.name} para cliente?`)) return;
    setIsSaving(true);
    try {
      await supabaseService.addClient({
        name: lead.name,
        phone: lead.phone,
        user_id: user_id,
        notes: `Promovido de Lead. Origem: ${lead.source}. ${lead.notes || ''}`
      } as Client);
      
      // Perguntar se deseja manter o lead no pipeline ou removê-lo
      if (window.confirm('Deseja remover este lead do pipeline agora que ele é um cliente?')) {
        await supabaseService.deleteLead(lead.id);
      } else {
        // Apenas atualizar para fechado se já não estiver
        if (lead.stage !== 'closed') {
          await supabaseService.updateLead(lead.id, { stage: 'closed' });
        }
      }

      setIsModalOpen(false);
      await loadLeads();
      await loadClients();
      setActiveSubTab('clients');
      alert('Lead promovido a cliente com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao promover lead.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return;
    setIsSaving(true);
    try {
        if (editingClient) await supabaseService.updateClient(editingClient.id, { ...clientFormData });
        else await supabaseService.addClient({ ...clientFormData, user_id } as Client);
        setIsClientModalOpen(false);
        await loadClients();
        setClientFormData({ name: '', phone: '', email: '', notes: '' });
    } finally { setIsSaving(false); }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    await supabaseService.deleteClient(id);
    await loadClients();
  };

  const openFollowUpModal = async (id: string, type: 'lead'|'client', name: string) => {
    setFollowUpModal({ isOpen: true, entityId: id, entityType: type, entityName: name });
    setIsLoadingFollowUps(true);
    try {
      const data = await supabaseService.getFollowUps(id);
      setFollowUps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFollowUps(false);
    }
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.trim() || !user_id) return;
    setIsSaving(true);
    try {
      const saved = await supabaseService.addFollowUp({
        user_id,
        entity_id: followUpModal.entityId,
        entity_type: followUpModal.entityType,
        content: newFollowUp
      });
      setFollowUps([saved, ...followUps]);
      setNewFollowUp('');

      const lines = newFollowUp.split('\n');
      const short = lines[0].length > 50 ? lines[0].substring(0, 50) + '...' : lines[0];
      if (followUpModal.entityType === 'lead') {
        setLeads(prev => prev.map(l => l.id === followUpModal.entityId ? {...l, ultimo_follow_up: short} : l));
        await supabaseService.updateLead(followUpModal.entityId, { ultimo_follow_up: short });
      } else {
        setClients(prev => prev.map(c => c.id === followUpModal.entityId ? {...c, ultimo_follow_up: short} : c));
        await supabaseService.updateClient(followUpModal.entityId, { ultimo_follow_up: short });
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar follow up');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFollowUp = async (id: string) => {
    if (!window.confirm('Excluir esta ação?')) return;
    try {
      await supabaseService.deleteFollowUp(id);
      setFollowUps(prev => prev.filter(f => f.id !== id));
      
      if (followUps.length === 1) { 
        if (followUpModal.entityType === 'lead') {
          setLeads(prev => prev.map(l => l.id === followUpModal.entityId ? {...l, ultimo_follow_up: ''} : l));
          await supabaseService.updateLead(followUpModal.entityId, { ultimo_follow_up: '' });
        } else {
          setClients(prev => prev.map(c => c.id === followUpModal.entityId ? {...c, ultimo_follow_up: ''} : c));
          await supabaseService.updateClient(followUpModal.entityId, { ultimo_follow_up: '' });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportClients = () => {
    if (clients.length === 0) {
      alert("Não há clientes para exportar.");
      return;
    }

    const data = clients.map(client => ({
      "RAZÃO SOCIAL": client.razao_social || "",
      "NOME": client.name || "",
      "CNPJ": client.cnpj || "",
      "TIPO": client.tipo || "",
      "RUA/AV": client.rua_av || "",
      "ENDEREÇO": client.endereco || "",
      "Nº": client.numero || "",
      "BAIRRO": client.bairro || "",
      "COMPLEMENTO": client.complemento || "",
      "CIDADE": client.cidade || "",
      "UF": client.uf || "",
      "Telefones": client.phone || "",
      "Obs": client.notes || "",
      "Site": client.site || "",
      "Responsável": client.responsavel || "",
      "EMAIL": client.email || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "clientes.xlsx");
  };

  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        setIsSaving(true);
        let importedCount = 0;

        for (const row of (data as any[])) {
          const nome = row['NOME'] || row['Nome'] || '';
          if (!nome) continue;

          const newClient: Partial<Client> = {
            user_id,
            razao_social: row['RAZÃO SOCIAL'] || row['Razão Social'] || '',
            name: nome,
            cnpj: row['CNPJ'] || '',
            tipo: row['TIPO'] || row['Tipo'] || '',
            rua_av: row['RUA/AV'] || row['Rua/Av'] || '',
            endereco: row['ENDEREÇO'] || row['Endereço'] || '',
            numero: String(row['Nº'] || row['Número'] || ''),
            bairro: row['BAIRRO'] || row['Bairro'] || '',
            complemento: row['COMPLEMENTO'] || row['Complemento'] || '',
            cidade: row['CIDADE'] || row['Cidade'] || '',
            uf: String(row['UF'] || ''),
            phone: String(row['Telefones'] || row['Telefone'] || ''),
            notes: row['Obs'] || row['Observação'] || '',
            site: row['Site'] || '',
            responsavel: row['Responsável'] || row['Responsavel'] || '',
            email: row['EMAIL'] || row['Email'] || ''
          };

          await supabaseService.addClient(newClient as Client);
          importedCount++;
        }

        alert(`${importedCount} clientes importados com sucesso!`);
        await loadClients();
      } catch (err) {
        console.error("Erro na importação:", err);
        alert("Ocorreu um erro ao importar os clientes. Verifique o formato do arquivo.");
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const data = [{
      "RAZÃO SOCIAL": "Empresa Fictícia LTDA",
      "NOME": "João da Silva",
      "CNPJ": "00.000.000/0001-00",
      "TIPO": "Fornecedor",
      "RUA/AV": "Avenida",
      "ENDEREÇO": "Paulista",
      "Nº": "1000",
      "BAIRRO": "Bela Vista",
      "COMPLEMENTO": "Sala 101",
      "CIDADE": "São Paulo",
      "UF": "SP",
      "Telefones": "(11) 99999-9999",
      "Obs": "Cliente VIP",
      "Site": "www.empresa.com.br",
      "Responsável": "Maria",
      "EMAIL": "contato@empresa.com.br"
    }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo_Importacao");
    XLSX.writeFile(workbook, "modelo_clientes_importacao.xlsx");
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    const leadId = draggedLeadId;
    const currentLead = leads.find(l => l.id === leadId);
    if (currentLead && currentLead.stage !== targetStage) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: targetStage } : l));
      await supabaseService.updateLead(leadId, { stage: targetStage });
    }
    setDraggedLeadId(null);
  };

  const activeFunnel = funnels.find(f => f.id === activeFunnelId) || funnels[0] || DEFAULT_FUNNEL;
  const currentStages = activeFunnel.stages;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex p-1.5 bg-white rounded-[2rem] border border-gray-100 w-fit gap-1 overflow-x-auto scrollbar-hide max-w-full">
          <button onClick={() => setActiveSubTab('pipeline')} className={`px-8 py-3 rounded-[1.4rem] font-black text-[10px] tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'pipeline' ? 'bg-[#F67C01] text-white shadow-lg' : 'text-slate-400 hover:bg-gray-100'}`}>CRM (Pipeline)</button>
          <button onClick={() => setActiveSubTab('clients')} className={`px-8 py-3 rounded-[1.4rem] font-black text-[10px] tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'clients' ? 'bg-[#F67C01] text-white shadow-lg' : 'text-slate-400 hover:bg-gray-100'}`}>Clientes</button>
      </div>

      {activeSubTab === 'pipeline' && (
        <div className="space-y-4 max-w-full">
           <div className="flex items-center justify-between mb-4">
              <div className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-1 gap-1">
                 {funnels.map(funnel => (
                   <button 
                     key={funnel.id}
                     onClick={() => setActiveFunnelId(funnel.id)}
                     className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeFunnelId === funnel.id ? 'bg-[#F67C01] text-white shadow-sm' : 'text-slate-400 hover:bg-gray-50'}`}
                   >
                     {funnel.title}
                   </button>
                 ))}
              </div>
              <button onClick={() => setIsFunnelsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                 <LayoutGrid className="w-4 h-4" /> Configurar Funis
              </button>
           </div>
           
            <div className="flex gap-6 pb-8 px-2 overflow-x-auto snap-x custom-scrollbar">
              {currentStages.map(stage => (
                <div key={stage.id} className="flex flex-col gap-4 min-w-[300px] md:min-w-[320px] snap-start" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}>
                   <div className="flex items-center justify-between px-6">
                      <h3 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-3 italic">
                         <span className={`w-3 h-3 rounded-full ${stage.bg} shadow-sm`}></span> {stage.label}
                      </h3>
                      <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 border border-gray-100">
                         {leads.filter(l => l.stage === stage.id).length}
                      </span>
                   </div>
                   <div className={`bg-gray-50/50 rounded-[3.5rem] p-4 space-y-4 min-h-[550px] border border-gray-100 shadow-inner`}>
                      {leads.filter(l => l.stage === stage.id).map(lead => (
                         <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} className={`bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-brand-primary/30 transition-all cursor-grab active:cursor-grabbing ${draggedLeadId === lead.id ? 'opacity-40' : ''}`} onClick={() => { setEditingLead(lead); setFormData(lead); setIsModalOpen(true); }}>
                            <div className="flex justify-between items-start mb-4">
                               <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                            <h4 className="font-black text-gray-900 text-base mb-1 tracking-tight leading-tight">{lead.name}</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase">{lead.source}</p>
                            <div className="flex flex-col items-start gap-3 mt-4">
                               <div className="flex gap-2 justify-start">
                                  {lead.phone && (
                                    <a href={`https://wa.me/${(lead.country_code || '55')}${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-all shadow-sm">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                    </a>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); openFollowUpModal(lead.id, 'lead', lead.name); }} className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-[10px] items-center flex gap-1 font-bold hover:bg-indigo-100 transition-all shadow-sm"><Plus className="w-3 h-3" /> FUP</button>
                               </div>
                               {Number(lead.value) > 0 && <p className="text-sm font-black text-[#F67C01]">R$ {Number(lead.value).toFixed(2)}</p>}
                            </div>
                            {lead.ultimo_follow_up && (
                              <div className="mt-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all" onClick={(e) => { e.stopPropagation(); openFollowUpModal(lead.id, 'lead', lead.name); }}>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> ÚLTIMA AÇàO</p>
                                 <p className="text-[11px] font-bold text-gray-700 line-clamp-2">{lead.ultimo_follow_up}</p>
                              </div>
                            )}
                         </div>
                      ))}
                      <button onClick={() => { setEditingLead(null); setFormData({ name: '', phone: '', source: 'manual', stage: stage.id, value: 0 }); setIsModalOpen(true); }} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2">
                         <Plus className="w-4 h-4" /> Novo lead
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'clients' && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
           <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                 <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Carteira de Clientes</h3>
                 <div className="flex gap-2 mt-2">
                    <button onClick={handleDownloadTemplate} className="text-[9px] font-bold text-slate-500 underline hover:text-indigo-600 uppercase tracking-widest">
                      Baixar Modelo XLSX
                    </button>
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 <label className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-2 shadow-sm">
                   <ArrowDownCircle className="w-4 h-4" /> IMPORTAR
                   <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportClients} />
                 </label>
                 <button onClick={handleExportClients} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2 shadow-sm">
                   <ArrowUpCircle className="w-4 h-4" /> EXPORTAR
                 </button>
                 <button onClick={() => { setEditingClient(null); setClientFormData({ name: '', phone: '', email: '', notes: '' }); setIsClientModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                   <Plus className="w-4 h-4" /> NOVO CLIENTE
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              {clients.length > 0 ? clients.map(client => (
                 <div key={client.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-black text-gray-900 text-base tracking-tight">{client.name}</h4>
                          {client.tipo && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{client.tipo}</p>}
                          {client.ultimo_follow_up && (
                             <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-1">
                               <span className="font-bold text-indigo-500">Ação:</span> {client.ultimo_follow_up}
                             </p>
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                       {client.phone && (
                         <a href={`https://wa.me/${(client.country_code || '55')}${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                         </a>
                       )}
                       <button onClick={() => openFollowUpModal(client.id, 'client', client.name)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center gap-1">
                          <Plus className="w-3 h-3" /> FUP
                       </button>
                       <button onClick={() => { setEditingClient(client); setClientFormData(client); setIsClientModalOpen(true); }} className="px-4 py-2 bg-sky-50 text-sky-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-100 transition-colors">
                          Editar
                       </button>
                       <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              )) : (
                 <div className="text-center py-20 opacity-40">
                    <User className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sua carteira de clientes está vazia.</p>
                 </div>
              )}
           </div>
        </div>
      )}

      {isModalOpen && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/5 animate-scale-in flex flex-col max-h-[95vh]">
                <div className="bg-[#0F172A] p-8 text-white flex justify-between items-center">
                    <div><h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingLead ? 'Detalhes do Lead' : 'Capturar Lead'}</h3></div>
                    <div className="flex items-center gap-2">
                        {editingLead && (
                            <button 
                                type="button"
                                onClick={() => handleDeleteLead(editingLead.id)}
                                className="p-3 hover:bg-rose-500/20 text-rose-400 rounded-2xl transition-all"
                                title="Excluir Lead"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                    </div>
                </div>
                <form onSubmit={handleSaveLead} className="p-10 space-y-8 overflow-y-auto scrollbar-hide flex-1">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Nome completo</label>
                          <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
                             <Phone className="w-3 h-3" /> Telefone WhatsApp
                          </label>
                          <div className="flex gap-2">
                            <select className="bg-gray-50 border-none rounded-2xl p-5 font-bold w-[120px] text-sm" value={formData.country_code || '55'} onChange={e => setFormData({...formData, country_code: e.target.value})}>
                              <option value="55">🇧🇷 +55</option>
                              <option value="1">🇺🇸 +1</option>
                              <option value="351">🇵🇹 +351</option>
                              <option value="244">🇦🇴 +244</option>
                              <option value="258">🇲🇿 +258</option>
                              <option value="34">🇪🇸 +34</option>
                              <option value="33">🇫🇷 +33</option>
                              <option value="44">🇬🇧 +44</option>
                              <option value="49">🇩🇪 +49</option>
                              <option value="39">🇮🇹 +39</option>
                              <option value="81">🇯🇵 +81</option>
                              <option value="86">🇨🇳 +86</option>
                              <option value="91">🇮🇳 +91</option>
                              <option value="54">🇦🇷 +54</option>
                              <option value="56">🇨🇱 +56</option>
                              <option value="57">🇨🇴 +57</option>
                              <option value="52">🇲🇽 +52</option>
                              <option value="595">🇵🇾 +595</option>
                              <option value="598">🇺🇾 +598</option>
                            </select>
                            <input type="text" placeholder="Ex: (11) 99999-9999" className="flex-1 bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Valor do Negócio</label>
                          <input type="number" step="0.01" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                       </div>
                       <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Funil</label>
                           <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold focus:ring-2 focus:ring-[#F67C01]/30 transition-all custom-select text-gray-700" value={funnels.find(f => f.stages.find(s => s.id === formData.stage))?.id || activeFunnelId} onChange={e => {
                              const newFunnel = funnels.find(f => f.id === e.target.value);
                              if (newFunnel && newFunnel.stages.length > 0) {
                                 setFormData({...formData, stage: newFunnel.stages[0].id});
                              }
                           }}>
                              {funnels.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Etapa</label>
                           <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold focus:ring-2 focus:ring-[#F67C01]/30 transition-all custom-select text-gray-700" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                              {(funnels.find(f => f.stages.find(s => s.id === formData.stage)) || funnels.find(f => f.id === activeFunnelId) || funnels[0]).stages.map(s => (
                                 <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                           </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button type="submit" disabled={isSaving} className="w-full bg-[#F67C01] text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-sm hover:bg-orange-600 transition-all">
                            {isSaving ? <RefreshCw className="animate-spin w-5 h-5 mx-auto" /> : (editingLead ? 'Atualizar Lead' : 'Salvar Lead')}
                        </button>
                        
                        {editingLead && (
                            <button 
                                type="button"
                                onClick={() => handlePromoteLead(editingLead)}
                                disabled={isSaving}
                                className="w-full bg-emerald-600 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                            >
                                <UserCheck className="w-5 h-5" /> PROMOVER PARA CLIENTE
                            </button>
                        )}
                    </div>
                </form>
            </div>
         </div>
      )}

      {isClientModalOpen && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/5 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="bg-[#0F172A] p-8 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                        {editingClient ? editingClient.name : 'Novo Cliente'}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Gestão de Cliente</p>
                    </div>
                    <button onClick={() => setIsClientModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-10">
                    <form onSubmit={handleSaveClient} className="space-y-6">
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Nome / Fantasia (*)</label>
                                 <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.name || ''} onChange={e => setClientFormData({...clientFormData, name: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Razão Social</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.razao_social || ''} onChange={e => setClientFormData({...clientFormData, razao_social: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">CNPJ / CPF</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.cnpj || ''} onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Tipo</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" placeholder="Ex: Fornecedor, Cliente..." value={clientFormData.tipo || ''} onChange={e => setClientFormData({...clientFormData, tipo: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Responsável</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.responsavel || ''} onChange={e => setClientFormData({...clientFormData, responsavel: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Telefone WhatsApp
                                 </label>
                                 <div className="flex gap-2">
                                   <select className="bg-gray-50 border-none rounded-2xl p-5 font-bold w-[120px] text-sm" value={clientFormData.country_code || '55'} onChange={e => setClientFormData({...clientFormData, country_code: e.target.value})}>
                                     <option value="55">🇧🇷 +55</option>
                                     <option value="1">🇺🇸 +1</option>
                                     <option value="351">🇵🇹 +351</option>
                                     <option value="244">🇦🇴 +244</option>
                                     <option value="258">🇲🇿 +258</option>
                                     <option value="34">🇪🇸 +34</option>
                                     <option value="33">🇫🇷 +33</option>
                                     <option value="44">🇬🇧 +44</option>
                                     <option value="49">🇩🇪 +49</option>
                                     <option value="39">🇮🇹 +39</option>
                                     <option value="81">🇯🇵 +81</option>
                                     <option value="86">🇨🇳 +86</option>
                                     <option value="91">🇮🇳 +91</option>
                                     <option value="54">🇦🇷 +54</option>
                                     <option value="56">🇨🇱 +56</option>
                                     <option value="57">🇨🇴 +57</option>
                                     <option value="52">🇲🇽 +52</option>
                                     <option value="595">🇵🇾 +595</option>
                                     <option value="598">🇺🇾 +598</option>
                                   </select>
                                   <input type="text" placeholder="Ex: (11) 99999-9999" className="flex-1 bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.phone || ''} onChange={e => setClientFormData({...clientFormData, phone: e.target.value})} />
                                 </div>
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Email</label>
                                 <input type="email" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.email || ''} onChange={e => setClientFormData({...clientFormData, email: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Rua / Av / Endereço</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={(clientFormData.rua_av ? clientFormData.rua_av + ' ' : '') + (clientFormData.endereco || '')} onChange={e => setClientFormData({...clientFormData, endereco: e.target.value, rua_av: ''})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Número</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.numero || ''} onChange={e => setClientFormData({...clientFormData, numero: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Complemento</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.complemento || ''} onChange={e => setClientFormData({...clientFormData, complemento: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Bairro</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.bairro || ''} onChange={e => setClientFormData({...clientFormData, bairro: e.target.value})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Cidade</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.cidade || ''} onChange={e => setClientFormData({...clientFormData, cidade: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">UF</label>
                                 <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.uf || ''} onChange={e => setClientFormData({...clientFormData, uf: e.target.value})} />
                              </div>
                           </div>

                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Site</label>
                              <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={clientFormData.site || ''} onChange={e => setClientFormData({...clientFormData, site: e.target.value})} />
                           </div>

                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Anotações / Obs</label>
                              <textarea className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold h-24 resize-none" value={clientFormData.notes || ''} onChange={e => setClientFormData({...clientFormData, notes: e.target.value})}></textarea>
                           </div>
                        </div>
                        <button type="submit" disabled={isSaving} className="w-full bg-[#F67C01] text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-sm hover:bg-orange-600 transition-all">
                            {isSaving ? <RefreshCw className="animate-spin w-5 h-5 mx-auto" /> : 'Salvar Cliente'}
                        </button>
                    </form>
                </div>
            </div>
         </div>
      )}

      {followUpModal.isOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/5 animate-scale-in flex flex-col max-h-[90vh] md:max-h-[80vh]">
                <div className="bg-[#0F172A] p-8 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Follow Ups</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{followUpModal.entityName}</p>
                    </div>
                    <button onClick={() => setFollowUpModal({isOpen: false, entityId: '', entityType: 'lead', entityName: ''})} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                </div>

                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                   <form onSubmit={handleSaveFollowUp} className="flex flex-col gap-4">
                      <textarea required className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-medium text-sm h-24 resize-none shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="Adicione uma nova anotação, ligação, reunião..." value={newFollowUp} onChange={e => setNewFollowUp(e.target.value)}></textarea>
                      <button type="submit" disabled={isSaving} className="self-end bg-[#F67C01] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
                        {isSaving ? <RefreshCw className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4" /> ADICIONAR FUP</>}
                      </button>
                   </form>
                </div>

                 <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-4 bg-white">
                   {isLoadingFollowUps ? (
                      <div className="flex justify-center p-10"><RefreshCw className="w-8 h-8 text-brand-primary animate-spin" /></div>
                   ) : followUps.length > 0 ? (
                      followUps.map(fup => (
                         <div key={fup.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 relative group">
                            <button onClick={() => handleDeleteFollowUp(fup.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                            <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(fup.created_at).toLocaleString('pt-BR')}</p>
                            <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">{fup.content}</p>
                         </div>
                      ))
                   ) : (
                      <div className="text-center py-12 opacity-50">
                         <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum follow up registrado.</p>
                      </div>
                   )}
                </div>
            </div>
         </div>
      )}

      {isFunnelsModalOpen && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/5 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="bg-[#0F172A] p-8 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Gerenciar Funis</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Crie e edite seus funis de vendas</p>
                    </div>
                    <button onClick={() => setIsFunnelsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-10 space-y-8">
                   {funnels.map(funnel => (
                      <div key={funnel.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-4 relative">
                         <div className="flex justify-between items-center mb-4">
                            {editingFunnel?.id === funnel.id ? (
                               <input type="text" className="bg-white border text-sm border-gray-200 rounded-xl px-4 py-2 font-bold w-1/2" value={editingFunnel.title} onChange={e => setEditingFunnel({...editingFunnel, title: e.target.value})} />
                            ) : (
                               <h4 className="font-black text-gray-900 text-lg">{funnel.title}</h4>
                            )}
                            <div className="flex gap-2">
                               {editingFunnel?.id === funnel.id ? (
                                  <>
                                     <button onClick={() => {
                                        setFunnels(funnels.map(f => f.id === funnel.id ? editingFunnel : f));
                                        setEditingFunnel(null);
                                     }} className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-[10px] font-bold">Salvar</button>
                                     <button onClick={() => setEditingFunnel(null)} className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-bold">Cancelar</button>
                                  </>
                               ) : (
                                  <>
                                     <button onClick={() => setEditingFunnel(funnel)} className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-[10px] font-bold">Editar Funil</button>
                                     {funnel.id !== 'default' && (
                                        <button onClick={() => setFunnels(funnels.filter(f => f.id !== funnel.id))} className="text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg text-[10px] font-bold">Excluir</button>
                                     )}
                                  </>
                               )}
                            </div>
                         </div>
                         <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                             {(editingFunnel?.id === funnel.id ? editingFunnel.stages : funnel.stages).map((stage, idx) => (
                                <div key={stage.id} className="flex gap-2 items-center">
                                   <div className={`w-3 h-3 rounded-full ${stage.bg}`}></div>
                                   {editingFunnel?.id === funnel.id ? (
                                      <>
                                          <input type="text" className="bg-white border text-xs border-gray-200 rounded-lg px-2 py-1 flex-1 font-medium" value={stage.label} onChange={e => {
                                             const newStages = [...editingFunnel.stages];
                                             newStages[idx].label = e.target.value;
                                             setEditingFunnel({...editingFunnel, stages: newStages});
                                         }} />
                                         <div className="relative">
                                            <button 
                                               type="button"
                                               onClick={() => setOpenColorPicker(openColorPicker === `${funnel.id}-${stage.id}` ? null : `${funnel.id}-${stage.id}`)}
                                               className={`w-6 h-6 rounded-full ${stage.bg} border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform`}
                                            />
                                            {openColorPicker === `${funnel.id}-${stage.id}` && (
                                               <>
                                                  <div className="fixed inset-0 z-[60]" onClick={() => setOpenColorPicker(null)}></div>
                                                  <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[70] grid grid-cols-4 gap-1 w-[116px] animate-scale-in">
                                                     {PRESET_COLORS.map(color => (
                                                        <button 
                                                           key={color}
                                                           type="button"
                                                           onClick={() => {
                                                              const newStages = [...editingFunnel.stages];
                                                              newStages[idx].bg = color;
                                                              setEditingFunnel({...editingFunnel, stages: newStages});
                                                              setOpenColorPicker(null);
                                                           }}
                                                           className={`w-5 h-5 rounded-full ${color} ${stage.bg === color ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-60 hover:opacity-100'} transition-all`}
                                                        />
                                                     ))}
                                                  </div>
                                               </>
                                            )}
                                         </div>
                                         <button onClick={() => {
                                             const newStages = editingFunnel.stages.filter((_, i) => i !== idx);
                                             setEditingFunnel({...editingFunnel, stages: newStages});
                                         }} className="p-1 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                      </>
                                   ) : (
                                      <span className="text-sm font-medium text-slate-600">{stage.label}</span>
                                   )}
                                </div>
                             ))}
                             {editingFunnel?.id === funnel.id && (
                                <button onClick={() => {
                                   setEditingFunnel({
                                      ...editingFunnel,
                                      stages: [...editingFunnel.stages, { id: `custom_${Date.now()}`, label: 'Nova Etapa', bg: 'bg-indigo-500' }]
                                   });
                                }} className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 mt-2">
                                   <Plus className="w-3 h-3"/> Adicionar Etapa
                                </button>
                             )}
                         </div>
                      </div>
                   ))}
                   <button onClick={() => {
                      const newFunnel: CRMFunnel = { id: `funnel_${Date.now()}`, title: 'Novo Funil', stages: [{ id: `stage_${Date.now()}`, label: 'Nova Etapa', bg: 'bg-blue-500' }] };
                      setFunnels([...funnels, newFunnel]);
                      setEditingFunnel(newFunnel);
                   }} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> CRIAR NOVO FUNIL
                   </button>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-[3.5rem] flex gap-4">
                   <button onClick={handleSaveFunnels} disabled={isSaving} className="flex-1 bg-[#F67C01] text-white font-black py-4 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:bg-[#F67C01]/90 transition-all flex justify-center items-center gap-2">
                      {isSaving ? <RefreshCw className="animate-spin w-4 h-4" /> : 'SALVAR CONFIGURAÇÕES'}
                   </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
// Fix: Added missing FinanceView component
const FinanceView = ({ user_id }: { user_id: string }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entityFilter, setEntityFilter] = useState<'personal' | 'business'>('personal');
  const [formData, setFormData] = useState<Partial<FinancialEntry>>({ 
    description: '', 
    value: 0, 
    type: 'income', 
    date: new Date().toISOString().split('T')[0], 
    category: 'Geral',
    entity_type: 'personal'
  });

  useEffect(() => { loadEntries(); }, []);
  const loadEntries = async () => {
    try {
      const data = await supabaseService.getFinancialEntries(user_id);
      setEntries(data);
    } catch (e) { console.error(e); }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return;
    setIsSaving(true);
    try {
      await supabaseService.addFinancialEntry({ ...formData, user_id } as FinancialEntry);
      setIsModalOpen(false);
      await loadEntries();
      setFormData({ 
        description: '', 
        value: 0, 
        type: 'income', 
        date: new Date().toISOString().split('T')[0], 
        category: 'Geral', 
        entity_type: entityFilter 
      });
    } finally { setIsSaving(false); }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    await supabaseService.deleteFinancialEntry(id);
    await loadEntries();
  };

  const filteredEntries = entries.filter(e => e.entity_type === entityFilter);
  const totalIncome = filteredEntries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = filteredEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.value, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filtro de Entidade */}
      <div className="flex p-1.5 bg-white rounded-[2rem] border border-gray-100 w-fit gap-1 shadow-sm">
          <button 
            onClick={() => setEntityFilter('personal')} 
            className={`px-8 py-3 rounded-[1.4rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${entityFilter === 'personal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-gray-100'}`}
          >
            <User className="w-3.5 h-3.5" /> Pessoa Física (PF)
          </button>
          <button 
            onClick={() => setEntityFilter('business')} 
            className={`px-8 py-3 rounded-[1.4rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${entityFilter === 'business' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-gray-100'}`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Pessoa Jurídica (PJ)
          </button>
      </div>

      <div className="bg-[#0F172A] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl border border-white/5">
        <div className="flex gap-12">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Entradas Totais ({entityFilter === 'personal' ? 'PF' : 'PJ'})</p>
               <h4 className="text-4xl font-black text-emerald-400 tracking-tighter italic">R$ {totalIncome.toFixed(2)}</h4>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Saídas Totais ({entityFilter === 'personal' ? 'PF' : 'PJ'})</p>
               <h4 className="text-4xl font-black text-rose-400 tracking-tighter italic">R$ {totalExpense.toFixed(2)}</h4>
            </div>
        </div>
        <div className="bg-white/10 px-10 py-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1 text-center">Saldo em Caixa</p>
            <h4 className={`text-4xl font-black tracking-tighter text-center ${balance >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>R$ {balance.toFixed(2)}</h4>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
        <div className="flex justify-between items-center">
           <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Fluxo de Caixa - {entityFilter === 'personal' ? 'PF' : 'PJ'}</h3>
           <button onClick={() => {
              setFormData({...formData, entity_type: entityFilter});
              setIsModalOpen(true);
           }} className="bg-[#F67C01] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
             <Plus className="w-4 h-4" /> NOVO LANÇAMENTO
           </button>
        </div>

        <div className="space-y-4">
           {filteredEntries.length > 0 ? filteredEntries.map(entry => (
              <div key={entry.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:bg-white transition-all">
                 <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${entry.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                       {entry.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                       <h4 className="font-black text-gray-900 text-base tracking-tight">{entry.description}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.category} • {new Date(entry.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-8">
                    <span className={`text-lg font-black ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {entry.type === 'income' ? '+' : '-'} R$ {entry.value.toFixed(2)}
                    </span>
                    <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           )) : (
              <div className="text-center py-20 opacity-40">
                 <DollarSign className="w-12 h-12 mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem lançamentos para este perfil.</p>
              </div>
           )}
        </div>
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white rounded-[3.5rem] w-full max-w-md shadow-2xl overflow-y-auto max-h-[80vh] border border-white/5 animate-scale-in">
                <div className="bg-[#0F172A] p-8 text-white flex justify-between items-center">
                    <div><h3 className="text-2xl font-black uppercase italic tracking-tighter">Financeiro ({formData.entity_type === 'personal' ? 'PF' : 'PJ'})</h3></div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                </div>
                <form onSubmit={handleSaveEntry} className="p-10 space-y-8">
                    <div className="space-y-6">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Descrição</label>
                          <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Pagamento Consultoria" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Valor (R$)</label>
                             <input required type="number" step="0.01" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Tipo</label>
                             <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                <option value="income">Receita (+)</option>
                                <option value="expense">Despesa (-)</option>
                             </select>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Data</label>
                             <input required type="date" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Perfil</label>
                             <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.entity_type} onChange={e => setFormData({...formData, entity_type: e.target.value as any})}>
                                <option value="personal">Pessoa Física (PF)</option>
                                <option value="business">Pessoa Jurídica (PJ)</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Categoria (Opcional)</label>
                          <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Serviços" />
                       </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-[#F67C01] text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-sm hover:bg-orange-600 transition-all">
                        {isSaving ? <RefreshCw className="animate-spin w-5 h-5 mx-auto" /> : 'Lançar no Caixa'}
                    </button>
                </form>
            </div>
         </div>
      )}
    </div>
  );
};

// Fix: Added missing ScheduleView component
const ScheduleView = ({ user_id }: { user_id: string }) => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({ 
    title: '', 
    client: '', 
    date: new Date().toISOString().split('T')[0], 
    time: '09:00', 
    type: 'servico', 
    status: 'pending' 
  });

  useEffect(() => { loadSchedule(); }, []);
  const loadSchedule = async () => {
    try {
      const data = await supabaseService.getSchedule(user_id);
      setItems(data);
    } catch (e) { console.error(e); }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return;
    setIsSaving(true);
    try {
      await supabaseService.addScheduleItem({ ...formData, user_id } as ScheduleItem);
      setIsModalOpen(false);
      await loadSchedule();
      setFormData({ title: '', client: '', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'servico', status: 'pending' });
    } finally { setIsSaving(false); }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Excluir este compromisso?')) return;
    await supabaseService.deleteScheduleItem(id);
    await loadSchedule();
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
             <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight flex items-center gap-3">
                <CalendarDays className="text-indigo-600" /> Agenda de Serviços
             </h3>
             <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> NOVO AGENDAMENTO
             </button>
          </div>

          <div className="grid gap-4">
             {items.length > 0 ? items.map(item => (
                <div key={item.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white transition-all">
                   <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-[1.8rem] shadow-sm border border-indigo-50">
                         <span className="text-[10px] font-black text-indigo-400 uppercase">{new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                         <span className="text-2xl font-black text-gray-900">{new Date(item.date).getDate()}</span>
                      </div>
                      <div>
                         <h4 className="font-black text-gray-900 text-xl tracking-tight leading-none mb-2">{item.title}</h4>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {item.client}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {item.time}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${
                         item.type === 'visita' ? 'bg-purple-50 text-purple-600' :
                         item.type === 'reuniao' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                         {item.type}
                      </span>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-3 text-slate-200 hover:text-rose-500 transition-colors">
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             )) : (
                <div className="text-center py-24 opacity-30">
                   <Calendar className="w-16 h-16 mx-auto mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">Agenda livre por enquanto.</p>
                </div>
             )}
          </div>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
             <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/5 animate-scale-in flex flex-col max-h-[95vh]">
                <div className="bg-[#0F172A] p-8 text-white flex justify-between items-center">
                    <div><h3 className="text-2xl font-black uppercase italic tracking-tighter">Agendamento</h3></div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                </div>
                <form onSubmit={handleSaveItem} className="p-10 space-y-6 overflow-y-auto scrollbar-hide flex-1">
                    <div className="space-y-6">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Título do Compromisso</label>
                          <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Entrega de Pedido" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Nome do Cliente</label>
                          <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Data</label>
                             <input required type="date" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Horário</label>
                             <input required type="time" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Tipo de Serviço</label>
                          <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                             <option value="servico">Execução de Serviço</option>
                             <option value="visita">Visita Técnica</option>
                             <option value="reuniao">Reunião / Café</option>
                          </select>
                       </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-[#F67C01] text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-sm hover:bg-orange-600 transition-all">
                        {isSaving ? <RefreshCw className="animate-spin w-5 h-5 mx-auto" /> : 'Confirmar Agenda'}
                    </button>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

const MenuzapProView = ({ user }: { user: any }) => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-gradient-to-br from-[#0F172A] via-brand-dark to-indigo-900 rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F67C01]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#F67C01] border border-[#F67C01]/20">
                            <Zap className="w-4 h-4" /> Integração Nativa
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
                            Menuzap <br/>
                            <span className="text-[#F67C01]">Pro Extension</span>
                        </h2>
                        <p className="text-slate-300 text-lg font-medium leading-relaxed">
                            Conecte seu WhatsApp Web diretamente ao seu Kanban e Agenda. Gerencie leads, mova cards e agende horários sem sair da conversa.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a 
                                href="/menuzap-pro-placeholder.txt" 
                                download="menuzap-pro.txt"
                                className="inline-flex items-center gap-3 bg-[#F67C01] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                            >
                                BAIXAR EXTENSÃO <RefreshCw className="w-5 h-5" />
                            </a>
                            <div className="flex items-center gap-3 px-6 py-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-[#F67C01] uppercase tracking-widest">SEU TOKEN DE ACESSO</p>
                                    <p className="text-xs font-mono font-bold tracking-wider">MN-PRO-{user.id.substring(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden lg:block">
                        <div className="w-80 h-80 bg-[#F67C01]/20 rounded-full blur-[100px] absolute inset-0 animate-pulse"></div>
                        <div className="relative bg-white/5 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Smartphone className="w-48 h-48 text-[#F67C01] opacity-80" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { 
                        step: '01', 
                        title: 'Instale a Extensão', 
                        desc: 'Baixe o arquivo e adicione ao seu navegador Chrome em segundos.', 
                        icon: RefreshCw,
                        instruction: 'Vá em chrome://extensions, ative o "Modo do desenvolvedor" e clique em "Carregar sem compactação". Selecione a pasta baixada.'
                    },
                    { 
                        step: '02', 
                        title: 'Conecte seu Token', 
                        desc: 'Copie seu token de acesso acima e cole na barra lateral do WhatsApp.', 
                        icon: Lock,
                        instruction: 'Abra o WhatsApp Web, clique no ícone de raio (⚡) e cole seu token MN-PRO.'
                    },
                    { 
                        step: '03', 
                        title: 'Sincronize Leads', 
                        desc: 'Seus contatos do WhatsApp agora aparecem direto no seu Kanban.', 
                        icon: Layout,
                        instruction: 'Mova cards, crie agendamentos e gerencie seu caixa sem sair da conversa.'
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6 group hover:border-orange-500/30 transition-all">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F67C01] font-black text-xl italic">
                            {item.step}
                        </div>
                        <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">
                            <item.icon className="w-5 h-5 inline-block mr-2 mb-1 text-[#F67C01]" />
                            {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        <div className="pt-4 border-t border-gray-50">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                {item.instruction}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
