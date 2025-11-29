/**
 * Stripe Payment Integration
 * Handles subscriptions, payments, and webhooks
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const path = event.path.split('/').pop();
    const body = event.body ? JSON.parse(event.body) : {};

    // Get Stripe key from environment
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Payment system not configured' }),
      };
    }

    switch (path) {
      case 'create-checkout':
        return await createCheckoutSession(body, stripeKey, headers);
      
      case 'create-portal':
        return await createPortalSession(body, stripeKey, headers);
      
      case 'webhook':
        return await handleWebhook(event, stripeKey, headers);
      
      case 'subscription-status':
        return await getSubscriptionStatus(body, stripeKey, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Payment error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Payment failed',
      }),
    };
  }
};

async function createCheckoutSession(body: any, stripeKey: string, headers: any) {
  const { priceId, userId, email, successUrl, cancelUrl } = body;

  if (!priceId || !userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  // Create Stripe checkout session
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': successUrl || 'https://pssi.netlify.app/success',
      'cancel_url': cancelUrl || 'https://pssi.netlify.app/pricing',
      'customer_email': email || '',
      'client_reference_id': userId,
      'metadata[userId]': userId,
      'subscription_data[metadata][userId]': userId,
      'allow_promotion_codes': 'true',
    }).toString(),
  });

  const session = await response.json();

  if (!response.ok) {
    throw new Error(session.error?.message || 'Failed to create checkout session');
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      sessionId: session.id,
      url: session.url,
    }),
  };
}

async function createPortalSession(body: any, stripeKey: string, headers: any) {
  const { customerId, returnUrl } = body;

  if (!customerId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Customer ID required' }),
    };
  }

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'customer': customerId,
      'return_url': returnUrl || 'https://pssi.netlify.app/dashboard',
    }).toString(),
  });

  const session = await response.json();

  if (!response.ok) {
    throw new Error(session.error?.message || 'Failed to create portal session');
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      url: session.url,
    }),
  };
}

async function handleWebhook(event: HandlerEvent, stripeKey: string, headers: any) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing signature or secret' }),
    };
  }

  // Verify webhook signature (simplified - use Stripe SDK in production)
  const payload = event.body || '';
  
  // Parse event
  const webhookEvent = JSON.parse(payload);

  // Handle different event types
  switch (webhookEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(webhookEvent.data.object);
      break;
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(webhookEvent.data.object);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(webhookEvent.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(webhookEvent.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(webhookEvent.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(webhookEvent.data.object);
      break;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ received: true }),
  };
}

async function getSubscriptionStatus(body: any, stripeKey: string, headers: any) {
  const { customerId, subscriptionId } = body;

  if (!customerId && !subscriptionId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Customer ID or Subscription ID required' }),
    };
  }

  let url = 'https://api.stripe.com/v1/subscriptions';
  if (subscriptionId) {
    url += `/${subscriptionId}`;
  } else {
    url += `?customer=${customerId}&status=active`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to get subscription');
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      subscription: data,
    }),
  };
}

// Webhook handlers (would update database in production)
async function handleCheckoutCompleted(session: any) {
  console.log('Checkout completed:', session.id);
  // TODO: Update database with subscription info
  // TODO: Send welcome email
  // TODO: Update AI fund
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);
  // TODO: Update database
  // TODO: Grant access
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id);
  // TODO: Update database
  // TODO: Adjust access
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id);
  // TODO: Update database
  // TODO: Revoke access
  // TODO: Send cancellation email
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded:', invoice.id);
  // TODO: Update AI fund (50% split)
  // TODO: Send receipt
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed:', invoice.id);
  // TODO: Send payment failure email
  // TODO: Retry logic
}

export { handler };
