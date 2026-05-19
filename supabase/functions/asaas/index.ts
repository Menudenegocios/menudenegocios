import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') || '').replace(/^['"]+|['"]+$/g, '')
const SUPABASE_SERVICE_ROLE_KEY = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').replace(/^['"]+|['"]+$/g, '')
const ASAAS_API_KEY = (Deno.env.get('ASAAS_API_KEY') || '').trim().replace(/^['"]+|['"]+$/g, '')
const ASAAS_API_URL = (Deno.env.get('ASAAS_API_URL') || '').trim().replace(/^['"]+|['"]+$/g, '').replace(/\/$/, '') || 'https://api.asaas.com/v3'
const VENCER_HUB_WALLET_ID = 'cebe7593-d482-4f68-b95b-3782a679690a'

async function asaasFetch(endpoint: string, method = 'GET', body: any = null) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${ASAAS_API_URL}${cleanEndpoint}`
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      'User-Agent': 'VencerHub-App'
    }
  }

  if (body && method !== 'GET') options.body = JSON.stringify(body)

  const response = await fetch(url, options)
  const text = await response.text()
  
  let data: any = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      data = { rawResponse: text }
    }
  }

  if (!response.ok) {
    const errorMsg = data.errors?.map((e: any) => e.description).join(', ') 
      || data.error 
      || (text ? `Erro: ${text}` : `Erro HTTP ${response.status}: ${response.statusText}`)
    throw new Error(errorMsg)
  }

  return data
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Identificar se é Webhook (Asaas envia POST sem Auth de usuário)
    const url = new URL(req.url)
    const isWebhook = url.searchParams.get('token') === Deno.env.get('ASAAS_WEBHOOK_TOKEN') || req.headers.get('user-agent')?.includes('Asaas')

    if (req.method === 'POST' && (isWebhook || !req.headers.get('Authorization'))) {
      const payload = await req.json()
      const { event, payment } = payload
      
      console.log(`[Webhook] Evento recebido: ${event} para pagamento ${payment?.id}`)

      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED_IN_CASH') {
        const userId = payment.externalReference
        if (!userId) {
          console.error('[Webhook] externalReference (userId) não encontrado no pagamento')
          return new Response(JSON.stringify({ received: true, error: 'No userId' }), { status: 200, headers: corsHeaders })
        }

        // 1. Registrar o pagamento na tabela financeira
        const paymentRecord = {
          user_id: userId,
          asaas_payment_id: payment.id,
          asaas_customer_id: payment.customer,
          amount: payment.value,
          billing_type: payment.billingType,
          status: payment.status,
          description: payment.description || 'Assinatura Vencer Hub',
          paid_at: payment.confirmedDate || new Date().toISOString(),
          created_at: new Date().toISOString()
        }

        const { error: payErr } = await supabase.from('payments').upsert(paymentRecord, { onConflict: 'asaas_payment_id' })
        if (payErr) console.error('[Webhook] Erro ao salvar payment:', JSON.stringify(payErr))

        // 2. Buscar Perfil e Referenciador
        const { data: profile } = await supabase.from('profiles').select('id, user_id, referrer_id, points').eq('user_id', userId).single()
        
        if (profile) {
          // 2. Atualizar status de membro
          await supabase.from('profiles').update({ 
            membership_status: 'active',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          }).eq('user_id', userId)

          // 3. Adicionar Pontos para o Usuário (100 pontos pela assinatura)
          const newPoints = (profile.points || 0) + 100
          await supabase.from('profiles').update({ points: newPoints }).eq('user_id', userId)
          
          await supabase.from('points_history').insert({
            user_id: userId,
            amount: 100,
            description: 'Pontos por assinatura de plano (Asaas)',
            type: 'earn'
          })

          // 4. Adicionar Pontos para quem indicou (50 pontos)
          if (profile.referrer_id) {
            const { data: referrer } = await supabase.from('profiles').select('points').eq('user_id', profile.referrer_id).single()
            if (referrer) {
              const referrerPoints = (referrer.points || 0) + 50
              await supabase.from('profiles').update({ points: referrerPoints }).eq('user_id', profile.referrer_id)
              
              await supabase.from('points_history').insert({
                user_id: profile.referrer_id,
                amount: 50,
                description: `Bônus por indicação de novo membro (Asaas)`,
                type: 'referral'
              })
              
              // Incrementar contador de indicações
              await supabase.rpc('increment_referrals', { user_id: profile.referrer_id })
            }
          }
          
          console.log(`[Webhook] Pontos processados para ${userId} e seu referenciador.`)
        }
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders })
    }

    // Fluxo normal de criação (Checkout/Payment)
    const { action, ...params } = await req.json()
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (!profile) throw new Error('Perfil não encontrado')

    let customerId = profile.asaas_customer_id
    if (customerId) {
      try {
        await asaasFetch(`/customers/${customerId}`)
      } catch (e) {
        customerId = null
      }
    }

    if (!customerId) {
      const cpfCnpj = profile.cpf_cnpj?.replace(/\D/g, '') || params.cpfCnpj?.replace(/\D/g, '')
      
      if (cpfCnpj) {
        try {
          const listRes = await asaasFetch(`/customers?cpfCnpj=${cpfCnpj}`)
          if (listRes.data && listRes.data.length > 0) {
            customerId = listRes.data[0].id
            await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('user_id', user.id)
          }
        } catch (searchErr) {
          console.error('[Asaas Customer Search Error]', searchErr.message)
        }
      }

      if (!customerId) {
        if (!cpfCnpj) throw new Error('CPF/CNPJ obrigatório.')
        const customer = await asaasFetch('/customers', 'POST', {
          name: profile.business_name || profile.name || user.email,
          email: user.email,
          cpfCnpj,
          mobilePhone: profile.phone?.replace(/\D/g, '') || undefined,
          externalReference: user.id,
          notificationDisabled: true
        })
        customerId = customer.id
        await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('user_id', user.id)
      }
    }

    if (action === 'create-payment' || action === 'checkout') {
      const { value, billingType, description, planId } = params
      const today = new Date()
      today.setDate(today.getDate() + 1)
      
      const payment = await asaasFetch('/payments', 'POST', {
        customer: customerId,
        billingType: billingType || 'PIX',
        value: value || (planId === 'premium' ? 97 : 47),
        dueDate: today.toISOString().split('T')[0],
        description: description || `Assinatura Vencer Hub - ${planId}`,
        externalReference: user.id,
        splits: [{ walletId: VENCER_HUB_WALLET_ID, percentualValue: 20 }],
        notificationDisabled: true
      })

      if (billingType === 'PIX') {
        try {
          const qrCodeData = await asaasFetch(`/payments/${payment.id}/pixQrCode`)
          return new Response(JSON.stringify({ ...payment, pixQrCode: qrCodeData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        } catch (qrErr) {
          console.error('[Pix QRCode Error]', qrErr.message)
        }
      }

      return new Response(JSON.stringify(payment), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'create-subscription') {
      const { planId, billingType, cycle } = params
      const subscription = await asaasFetch('/subscriptions', 'POST', {
        customer: customerId,
        billingType,
        value: planId === 'premium' ? 97 : 47,
        nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        cycle: cycle || 'MONTHLY',
        description: `Plano ${planId} - Vencer Hub`,
        externalReference: user.id,
        splits: [{ walletId: VENCER_HUB_WALLET_ID, percentualValue: 20 }],
        notificationDisabled: true
      })
      return new Response(JSON.stringify(subscription), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Ação não implementada' }), { status: 404, headers: corsHeaders })

  } catch (error: any) {
    console.error('[Critical Error]', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
