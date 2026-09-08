// DEPRECATED — replaced by real API via lib/auth.js (meApi)
// All user data now fetched from /api/v1/me/* endpoints.
// This file is kept for reference only and should be removed.

export function getInvoices() { return []; }
export function getTickets() { return []; }
export function getServices() { return []; }
export function payInvoice() {}
export function createTicket() {}
export function formatRupiah(n) { return `Rp${n.toLocaleString("id-ID")}`; }
