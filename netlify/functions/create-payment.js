exports.handler = async (event) => {
  const H = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'};
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers:H,body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers:H,body:JSON.stringify({error:'Method not allowed'})};
  const TOKEN = 'rLtt6JWvbUHDDhsZnfpAhpYk4dxYDQkbcPTyGaKp2TYqQgG7FGZ5Th_WD53Oq8ebR8tWMqHBtH';
  const BASE = 'https://apitest.myfatoorah.com';
  try {
    const {amount,customerName,customerEmail,customerPhone,items,orderRef} = JSON.parse(event.body);
    const SITE = process.env.URL || 'https://inspired-by-eisha.com';
    const r = await fetch(BASE+'/v2/SendPayment', {
      method:'POST',
      headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({
        NotificationOption:'LNK',
        InvoiceValue:amount,
        CustomerName:customerName||'Customer',
        DisplayCurrencyIso:'KWD',
        CallBackUrl:SITE+'/payment-success.html',
        ErrorUrl:SITE+'/payment-error.html',
        Language:'AR'
      })
    });
    const txt = await r.text();
    let d;
    try { d = JSON.parse(txt); } catch(e) {
      return {statusCode:500,headers:H,body:JSON.stringify({success:false,error:'API response error'})};
    }
    if(d.IsSuccess) return {statusCode:200,headers:H,body:JSON.stringify({success:true,paymentUrl:d.Data.InvoiceURL,invoiceId:d.Data.InvoiceId})};
    return {statusCode:400,headers:H,body:JSON.stringify({success:false,error:d.Message||'Payment failed'})};
  } catch(e) {
    return {statusCode:500,headers:H,body:JSON.stringify({success:false,error:'Error: '+e.message})};
  }
};
