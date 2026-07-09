// Simulated - Culqi real payment not configured
export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Pago real no configurado. Usa el modo simulado.' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}
