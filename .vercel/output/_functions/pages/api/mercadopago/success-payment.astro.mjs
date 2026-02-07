import { Resend } from 'resend';
export { renderers } from '../../../renderers.mjs';

const commonStyles = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #ffffff;
    background-color: #000000;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
    border-radius: 16px;
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #E8BD0D 0%, #ffcc00 100%);
    padding: 40px 24px;
    text-align: center;
  }
  .header h1 {
    color: #000000;
    font-size: 28px;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
  }
  .header p {
    color: rgba(0,0,0,0.7);
    font-size: 14px;
    margin: 8px 0 0;
    font-weight: 600;
  }
  .content {
    padding: 32px 24px;
  }
  .success-badge {
    background: rgba(34, 197, 94, 0.2);
    border: 2px solid #22c55e;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    margin-bottom: 24px;
  }
  .success-badge span {
    color: #22c55e;
    font-weight: 700;
    font-size: 16px;
  }
  .plan-box {
    background: rgba(232, 189, 13, 0.1);
    border: 2px solid rgba(232, 189, 13, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .plan-box h2 {
    color: #E8BD0D;
    font-size: 20px;
    font-weight: 800;
    margin: 0 0 8px;
    text-transform: uppercase;
  }
  .plan-box p {
    color: #999999;
    font-size: 14px;
    margin: 0;
  }
  .details {
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .details h3 {
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-label {
    color: #666666;
    font-size: 14px;
  }
  .detail-value {
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
  .next-steps {
    margin-bottom: 24px;
  }
  .next-steps h3 {
    color: #E8BD0D;
    font-size: 16px;
    font-weight: 800;
    margin: 0 0 16px;
    text-transform: uppercase;
  }
  .step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
  .step-number {
    background: #E8BD0D;
    color: #000000;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
  }
  .step-text {
    color: #cccccc;
    font-size: 14px;
  }
  .step-text strong {
    color: #ffffff;
  }
  .cta-button {
    display: block;
    background: #E8BD0D;
    color: #000000;
    text-decoration: none;
    padding: 16px 32px;
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 12px;
    margin-bottom: 24px;
  }
  .footer {
    background: rgba(0,0,0,0.5);
    padding: 24px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .footer p {
    color: #666666;
    font-size: 12px;
    margin: 0 0 8px;
  }
  .footer a {
    color: #E8BD0D;
    text-decoration: none;
  }
`;
const planDetails = {
  basic: {
    name: "Plan Básico",
    description: "Mentoría 1 Mes",
    features: [
      "Mes completo de contenido, comunidad y grabaciones",
      "Portfolio listo + oferta estructurada para vender",
      "Acceso a comunidad de Discord y soporte grupal",
      "Biblioteca de recursos y toolkit"
    ]
  },
  pro: {
    name: "Plan Pro",
    description: "Mentoría Personalizada",
    features: [
      "Todo lo del Plan Básico incluido",
      "2 llamadas 1:1 (45 min) para destrabar y acelerar",
      "Revisión personalizada de tu oferta y packs",
      "Prioridad de respuesta y acceso directo"
    ]
  }
};
function getConfirmationEmailHTML(data) {
  const plan = planDetails[data.planType];
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Pago Confirmado! - Diseñá Como Yo</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido/a!</h1>
      <p>Tu inscripción ha sido confirmada</p>
    </div>
    
    <div class="content">
      <div class="success-badge">
        <span>✓ PAGO PROCESADO EXITOSAMENTE</span>
      </div>
      
      <div class="plan-box">
        <h2>${plan.name}</h2>
        <p>${plan.description}</p>
      </div>
      
      <div class="details">
        <h3>Detalles del Pago</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr class="detail-row">
            <td class="detail-label">ID de Pago</td>
            <td class="detail-value" style="text-align: right;">#${data.paymentId}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">Monto</td>
            <td class="detail-value" style="text-align: right;">USD $${data.amount}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">Fecha</td>
            <td class="detail-value" style="text-align: right;">${data.paymentDate}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">Plan</td>
            <td class="detail-value" style="text-align: right; color: #E8BD0D;">${plan.name}</td>
          </tr>
        </table>
      </div>
      
      <div class="next-steps">
        <h3>Próximos Pasos</h3>
        <div class="step">
          <span class="step-number">1</span>
          <span class="step-text"><strong>Revisá tu email</strong> para recibir el acceso al grupo y materiales</span>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <span class="step-text"><strong>Unite a Discord</strong> donde está toda la comunidad</span>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <span class="step-text"><strong>Preparate</strong> para la primera clase en vivo</span>
        </div>
        ${data.planType === "pro" ? `
        <div class="step">
          <span class="step-number">4</span>
          <span class="step-text"><strong>Agendá tu llamada 1:1</strong> (recibirás link por email)</span>
        </div>
        ` : ""}
      </div>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h4 style="color: #ffffff; font-size: 14px; font-weight: 700; margin: 0 0 12px; text-transform: uppercase;">Lo que incluye tu plan:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${plan.features.map((f) => `<li style="color: #999999; font-size: 13px; margin-bottom: 8px;">${f}</li>`).join("")}
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>¿Tenés preguntas? Escribinos a <a href="mailto:skinedit03@gmail.com">skinedit03@gmail.com</a></p>
      <p style="margin-top: 16px; color: #444;">© Diseñá Como Yo - Todos los derechos reservados</p>
    </div>
  </div>
</body>
</html>
  `;
}
function getEmailSubject(planType) {
  const planName = planType === "pro" ? "Plan Pro" : "Plan Básico";
  return `🎉 ¡Bienvenido/a al ${planName}! - Diseñá Como Yo`;
}

const resend = new Resend("re_3UVGvUbR_PfguTD5LKeuojUASGBH8n7zq");
const MP_ACCESS_TOKEN = "APP_USR-2507558046208031-012819-4f1736c5be604b916da4211b6a2b5d98-490782989";
const FROM_EMAIL = "SKIN LABS PRO <skinedit03@gmail.com>";
function getPlanType(amount) {
  if (amount >= 500) return "pro";
  return "basic";
}
async function getPaymentDetails(paymentId) {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      console.error("Failed to fetch payment details:", response.status, response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return null;
  }
}
async function sendConfirmationEmail(payment) {
  const planType = getPlanType(payment.transaction_amount);
  const paymentData = {
    customerEmail: payment.payer.email,
    customerName: payment.payer.first_name ? `${payment.payer.first_name} ${payment.payer.last_name || ""}`.trim() : void 0,
    paymentId: payment.id.toString(),
    amount: payment.transaction_amount,
    planType,
    paymentDate: new Date(payment.date_approved).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  };
  const htmlContent = getConfirmationEmailHTML(paymentData);
  const subject = getEmailSubject(planType);
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [payment.payer.email],
    subject,
    html: htmlContent
  });
  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
  console.log(`✅ Email sent successfully to ${payment.payer.email}. Email ID: ${data?.id}`);
  return data;
}
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("📥 Webhook received:", JSON.stringify(body, null, 2));
    if (body.type !== "payment") {
      console.log("⏭️ Ignoring non-payment notification:", body.type);
      return new Response(JSON.stringify({ status: "ignored", reason: "Not a payment notification" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error("❌ No payment ID in webhook");
      return new Response(JSON.stringify({ error: "Missing payment ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const payment = await getPaymentDetails(paymentId);
    if (!payment) {
      console.error("❌ Could not fetch payment details for ID:", paymentId);
      return new Response(JSON.stringify({ error: "Could not fetch payment details" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("💰 Payment details:", {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
      email: payment.payer.email
    });
    if (payment.status !== "approved") {
      console.log(`⏭️ Payment ${paymentId} is not approved (status: ${payment.status}). Skipping email.`);
      return new Response(JSON.stringify({
        status: "skipped",
        reason: `Payment status is ${payment.status}`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailResult = await sendConfirmationEmail(payment);
    return new Response(JSON.stringify({
      status: "success",
      message: "Email sent successfully",
      emailId: emailResult?.id,
      paymentId: payment.id,
      planType: getPlanType(payment.transaction_amount)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  return new Response(JSON.stringify({
    status: "ok",
    message: "MercadoPago webhook endpoint is active. Use POST to send webhook notifications.",
    endpoint: "/api/mercadopago/webhook"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
