// Lightweight PIN gate for admin surfaces. The PIN lives in the ADMIN_PIN env
// var (set in Vercel). The gate is ACTIVE only when ADMIN_PIN is set — if it's
// unset (e.g. local dev without the var) everything stays open so nothing breaks.
// Attendee-facing routes (/, /qr, /api/submit) are never gated.
export function pinOk(req: Request): boolean {
  const expected = process.env.ADMIN_PIN
  if (!expected) return true
  const header = req.headers.get('x-admin-pin')
  const fromQuery = new URL(req.url).searchParams.get('pin')
  return header === expected || fromQuery === expected
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
