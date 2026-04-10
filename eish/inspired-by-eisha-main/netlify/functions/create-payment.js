exports.handler = async (event) => {
  const ALLOWED_ORIGINS = [
    process.env.URL || 'https://inspired-by-eisha.com',
    'https://inspired-by-eisha.netlify.app'
  ];
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  const H = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: H, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: H, body: JSON.stringify({ error: 'Method not allowed' }) };

  // Token from Netlify environment variables (Settings > Environment)
  const TOKEN = process.env.MYFATOORAH_TOKEN;
  if (!TOKEN) {
    return { statusCode: 500, headers: H, body: JSON.stringify({ success: false, error: 'Payment not configured' }) };
  }

  const isLive = process.env.MYFATOORAH_MODE === 'live';
  const BASE = isLive ? 'https://api.myfatoorah.com' : 'https://api-qa.myfatoorah.com';

  try {
    const body = JSON.parse(event.body);
    const amount = parseFloat(body.amount);
    const customerName = (body.customerName || 'Customer').substring(0, 100);

    if (!amount || amount <= 0 || amount > 100000) {
      return { statusCode: 400, headers: H, body: JSON.stringify({ success: false, error: 'Invalid amount' }) };
    }

    const SITE = process.env.URL || 'https://inspired-by-eisha.com';
    const r = await fetch(BASE + '/v2/SendPayment', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        NotificationOption: 'LNK',
        InvoiceValue: amount,
        CustomerName: customerName,
        DisplayCurrencyIso: 'QAR',
        MobileCountryCode: '+974',
        CustomerMobile: (body.customerPhone || '12345678').replace(/\D/g, '').substring(0, 15),
        CustomerEmail: body.customerEmail || '',
        CallBackUrl: SITE + '/payment-success.html',
        ErrorUrl: SITE + '/payment-error.html?payment_failed=1',
        Language: 'AR',
        CustomerReference: body.orderRef || '',
        UserDefinedField: body.notes || ''
      })
    });

    if (!r.ok) {
      return { statusCode: r.status, headers: H, body: JSON.stringify({ success: false, error: 'Payment gateway error: ' + r.status }) };
    }

    const d = await r.json();
    if (d.IsSuccess) {
      return { statusCode: 200, headers: H, body: JSON.stringify({ success: true, paymentUrl: d.Data.InvoiceURL, invoiceId: d.Data.InvoiceId }) };
    }
    return { statusCode: 400, headers: H, body: JSON.stringify({ success: false, error: d.Message || 'Payment failed' }) };
  } catch (e) {
    return { statusCode: 500, headers: H, body: JSON.stringify({ success: false, error: 'Server error' }) };
  }
};
