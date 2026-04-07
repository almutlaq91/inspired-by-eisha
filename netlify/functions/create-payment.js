exports.handler = async (event) => {
  const H = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'};
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers:H,body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers:H,body:JSON.stringify({error:'Method not allowed'})};
  const TOKEN = 'SK_QAT_IwOx1ozWy8tIT0O7hITNGi4HJSEZyDlYT9GxKek65cQtQ6oZNaJUiU17CV0v3Jvm';
  const BASE = 'https://api-qa.myfatoorah.com';
  try {
    const {amount,customerName} = JSON.parse(event.body);
    const SITE = process.env.URL || 'https://inspired-by-eisha.com';
    const r = await fetch(BASE+'/v2/SendPayment', {
      method:'POST',
      headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({
        NotificationOption:'LNK',
        InvoiceValue:amount||1,
        CustomerName:customerName||'Customer',
        DisplayCurrencyIso:'QAR',
        MobileCountryCode:'+974',
        CustomerMobile:'12345678',
        CallBackUrl:SITE+'/payment-success.html',
        ErrorUrl:SITE+'/payment-error.html',
        Language:'AR'
      })
    });
    if(!r.ok) return {statusCode:r.status,headers:H,body:JSON.stringify({success:false,error:'API status: '+r.status})};
    const d = await r.json();
    if(d.IsSuccess) return {statusCode:200,headers:H,body:JSON.stringify({success:true,paymentUrl:d.Data.InvoiceURL,invoiceId:d.Data.InvoiceId})};
    return {statusCode:400,headers:H,body:JSON.stringify({success:false,error:d.Message||'Failed'})};
  } catch(e) {
    return {statusCode:500,headers:H,body:JSON.stringify({success:false,error:'Error: '+e.message})};
  }
};
