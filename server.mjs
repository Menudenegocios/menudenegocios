
import express from 'express';
import stripePackage from 'stripe';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Configuração Asaas
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Helper para chamadas Asaas
async function asaasFetch(endpoint, method = 'GET', body = null) {
  const url = `${ASAAS_API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY
    }
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors?.[0]?.description || 'Erro na API do Asaas');
  return data;
}

// Asaas Webhook Endpoint
app.post('/api/webhooks/asaas', async (req, res) => {
  const event = req.body;
  const token = req.headers['asaas-access-token'];

  // Verificação simples se o token for configurado
  if (process.env.ASAAS_WEBHOOK_TOKEN && token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    console.warn("Webhook Asaas: Token inválido recebido.");
    return res.status(401).send('Unauthorized');
  }
  
  console.log(`Recebendo webhook Asaas: ${event.event}`);

  try {
    const payment = event.payment;
    
    // Identificar usuário pelo externalReference (que passamos na criação) ou metadata
    const user_id = payment.externalReference;
    if (!user_id) return res.status(200).send('No external reference');

    switch (event.event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        await handlePaymentSuccess(payment, user_id);
        break;
      case 'PAYMENT_OVERDUE':
        // Marcar como inadimplente no banco se necessário
        console.log(`Pagamento em atraso para usuário ${user_id}`);
        await supabase.from('subscriptions').update({ status: 'overdue' }).eq('user_id', user_id);
        break;
      case 'PAYMENT_DELETED':
        console.log(`Pagamento removido para usuário ${user_id}`);
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('user_id', user_id);
        break;
      default:
        console.log(`Evento não tratado: ${event.event}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Erro no processamento do webhook: ${err.message}`);
    res.status(500).send(`Erro no servidor`);
  }
});

// JSON parsing for other routes
app.use(express.json());

// Asaas: Criar Cliente
app.post('/api/asaas/create-customer', async (req, res) => {
  const { name, email, cpfCnpj, phone } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    const customer = await asaasFetch('/customers', 'POST', {
      name,
      email,
      cpfCnpj,
      phone,
      externalReference: user.id,
      notificationDisabled: true
    });

    // Salvar asaas_customer_id no perfil
    await supabase.from('profiles').update({ 
      asaas_customer_id: customer.id,
      cpf_cnpj: cpfCnpj 
    }).eq('user_id', user.id);

    res.json(customer);
  } catch (err) {
    console.error("Erro ao criar cliente Asaas:", err);
    res.status(500).json({ error: err.message });
  }
});

// Asaas: Criar Cobrança (PIX/Cartão avulso)
app.post('/api/asaas/create-payment', async (req, res) => {
  const { value, billingType, description, dueDate } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('asaas_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.asaas_customer_id) throw new Error("Cliente não cadastrado no Asaas");

    const payment = await asaasFetch('/payments', 'POST', {
      customer: profile.asaas_customer_id,
      billingType,
      value,
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0], // 1 dia
      description: description || 'Pagamento Menu de Negócios',
      externalReference: user.id,
      notificationDisabled: true
    });

    res.json(payment);
  } catch (err) {
    console.error("Erro ao criar pagamento Asaas:", err);
    res.status(500).json({ error: err.message });
  }
});

// Asaas: Criar Assinatura (Planos SaaS)
app.post('/api/asaas/create-subscription', async (req, res) => {
  const { planId, billingType, cycle } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('asaas_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.asaas_customer_id) throw new Error("Cliente não cadastrado no Asaas");

    // Mapeamento de valores por plano (em Reais, ex: 59.00)
    const planValues = {
      'start': cycle === 'YEARLY' || cycle === 'SEMIANNUAL' ? 249 : 59,
      'pro': cycle === 'YEARLY' || cycle === 'SEMIANNUAL' ? 997 : 197,
      'full': cycle === 'YEARLY' || cycle === 'SEMIANNUAL' ? 1997 : 397
    };
    
    // Corrigido para valores da campanha se existirem
    const value = planValues[planId] || 59;

    const subscription = await asaasFetch('/subscriptions', 'POST', {
      customer: profile.asaas_customer_id,
      billingType,
      value,
      nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      cycle: cycle || 'MONTHLY',
      description: `Assinatura Plano ${planId.toUpperCase()}`,
      externalReference: user.id,
      notificationDisabled: true
    });

    // Buscar a primeira fatura da assinatura para pegar a invoiceUrl
    const payments = await asaasFetch(`/subscriptions/${subscription.id}/payments`);
    const invoiceUrl = payments.data?.[0]?.invoiceUrl || subscription.invoiceUrl;

    res.json({ ...subscription, invoiceUrl });
  } catch (err) {
    console.error("Erro ao criar assinatura Asaas:", err);
    res.status(500).json({ error: err.message });
  }
});

// Compatibilidade com endpoint antigo de Checkout (Redirecionando para asaas se necessário)
app.post('/api/create-checkout-session', async (req, res) => {
    // Redireciona lógica para manter compatibilidade frontend enquanto migra
    res.status(400).json({ error: 'Este endpoint foi desativado. Use /api/asaas/create-subscription' });
});

// Helper centralizado para sucesso de pagamento (Unificado de Stripe e Asaas)
async function handlePaymentSuccess(payment, user_id) {
    // Determinar o plano pelo valor ou descrição da assinatura do Asaas
    let plan_id = 'basic';
    const value = payment.value;
    
    if (value >= 1497) plan_id = 'full';
    else if (value >= 599) plan_id = 'pro';

    const asaas_customer_id = payment.customer;
    const asaas_subscription_id = payment.subscription;

    // Atualizar tabela subscriptions
    await supabase.from('subscriptions').upsert({
        user_id,
        asaas_customer_id,
        asaas_subscription_id,
        asaas_payment_id: payment.id,
        plan: plan_id,
        status: 'active',
        current_period_end: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString() // Aproximadamente 1 mês
    }, { onConflict: 'user_id' });

    // Lógica de recompensas (mantida de stripe para asaas)
    let rewardPoints = 0;
    let rewardCash = 0;

    if (plan_id === 'basic') { rewardPoints = 100; rewardCash = 50; }
    else if (plan_id === 'pro') { rewardPoints = 300; rewardCash = 100; }
    else if (plan_id === 'full') { rewardPoints = 500; rewardCash = 200; }

    const now = new Date();
    const deadline = new Date('2026-04-01');
    const getFounderBadge = now < deadline;

    const updateData = { plan: plan_id, level: 'Nível Base' };
    const { data: profile } = await supabase.from('profiles').select('points, menu_cash').eq('user_id', user_id).single();

    if (profile && getFounderBadge) updateData.has_founder_badge = true;

    await supabase.from('profiles').update(updateData).eq('user_id', user_id);

    if (rewardPoints > 0) {
        await supabase.from('points_history').insert({
            user_id, points: rewardPoints,
            action: `Ativação Plano ${plan_id.toUpperCase()} (Asaas)`,
            category: 'plano', date: new Date().toISOString()
        });
    }

    // --- LOGICA DE INDICAÇÃO REMOVIDA (MANIPULADA POR TRIGGER DB) ---
}

// Remover funções Stripe obsoletas
async function handleSubscriptionCreated(session) {}
async function handleInvoicePaid(invoice) {}
async function handleSubscriptionDeleted(subscription) {}

// Admin: Update User (Password, Email, Profile)
app.post('/api/admin/update-user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !adminUser) return res.status(401).json({ error: 'Invalid token' });

    // Check if requester is admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', adminUser.id)
        .single();

    if (adminProfile?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { userId, business_name, email, password, plan, level, points: newPoints, role, menu_cash: newMenuCash, has_founder_badge, display_id, cpf_cnpj } = req.body;
    
    try {
        // Fetch current profile to check for activation
        const { data: oldProfile } = await supabase.from('profiles').select('plan, points, menu_cash, referrer_id').eq('user_id', userId).single();
        
        const updateData = {};
        if (password) updateData.password = password;
        if (email) updateData.email = email;

        // 1. Update Auth if needed
        if (Object.keys(updateData).length > 0) {
            const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, updateData);
            if (updateAuthError) throw updateAuthError;
        }

        const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({
                business_name,
                email,
                plan,
                level,
                points: newPoints,
                role,
                menu_cash: newMenuCash,
                has_founder_badge,
                display_id,
                cpf_cnpj,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateProfileError) throw updateProfileError;

        // --- Lógica de Ativação Manual (REMOVIDA: AGORA HANDLED BY DATABASE TRIGGER) ---

        // 3. Update or Create Subscription Validity if plan is not pre-cadastro
        if (plan && plan !== 'pre-cadastro') {
            await supabase.from('subscriptions').upsert({
                user_id: userId,
                plan: plan,
                status: 'active',
                current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 year from now
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        console.error("Admin update error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete User
app.all('/api/admin/delete-user', async (req, res) => {
    console.log(`[Admin] Request ${req.method} /api/admin/delete-user`);
    
    // Garantir que aceitamos POST ou DELETE
    if (req.method !== 'DELETE' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    
    try {
        const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !adminUser) {
            console.error("Auth error:", authError);
            return res.status(401).json({ error: 'Invalid token or session expired' });
        }

        // Check if requester is admin
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', adminUser.id)
            .single();

        if (adminProfile?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // Aceitar tanto via query (DELETE antigo) quanto via body (POST novo)
        const userId = req.query.userId || req.body.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        console.log(`[Admin] Deleting user: ${userId}`);

        // Delete from Auth (this also deletes from public tables if there are CASCADE foreign keys)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteError) {
            console.error("Supabase Admin Delete Error:", deleteError);
            throw deleteError;
        }

        res.json({ success: true, message: 'User deleted successfully from Auth and Profiles' });
    } catch (err) {
        console.error("Admin delete route error:", err);
        res.status(500).json({ error: err.message || 'Erro interno ao excluir usuário' });
    }
});

// Catch-all for undefined /api routes to return JSON instead of HTML
app.all(/\/api\/.*/, (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Serve static files from production build
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/.*/, (req, res) => {
  // Se a requisição for para um asset que não existe, retorna 404 real para evitar erro de MIME
  if (req.path.startsWith('/assets/')) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
