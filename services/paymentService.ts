import { supabase } from './supabaseClient';

export const paymentService = {
  checkout: async (checkoutData: { planId: string, billingType: string, cycle: string, value?: number, cpfCnpj?: string, installments?: number }) => {
    const { data, error } = await supabase.functions.invoke('payment', {
      body: { action: 'checkout', ...checkoutData }
    });

    if (error) throw new Error(error.message || 'Erro ao processar checkout no Asaas');
    if (data?.success === false) throw new Error(data.error);
    if (data?.error) throw new Error(data.error);
    
    return data;
  },

  createAsaasCustomer: async (customerData: { name: string, email: string, cpfCnpj: string, phone?: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase.functions.invoke('payment', {
      body: { action: 'create-customer', ...customerData }
    });

    if (error) throw new Error(error.message || 'Erro ao cadastrar cliente no Asaas');
    if (data?.success === false) throw new Error(data.error);
    if (data?.error) throw new Error(data.error);
    
    return data;
  },

  createAsaasSubscription: async (planId: string, billingType: 'PIX' | 'CREDIT_CARD', cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY' = 'MONTHLY') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase.functions.invoke('payment', {
      body: { action: 'create-subscription', planId, billingType, cycle }
    });

    if (error) throw new Error(error.message || 'Erro ao criar assinatura no Asaas');
    if (data?.success === false) throw new Error(data.error);
    if (data?.error) throw new Error(data.error);

    return data;
  },

  createAsaasPayment: async (paymentData: { value: number, billingType: 'PIX' | 'CREDIT_CARD', description: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase.functions.invoke('payment', {
      body: { action: 'create-payment', ...paymentData }
    });

    if (error) throw new Error(error.message || 'Erro ao criar pagamento no Asaas');
    if (data?.success === false) throw new Error(data.error);
    if (data?.error) throw new Error(data.error);

    return data;
  }
};
