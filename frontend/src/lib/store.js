// ponytail: demo frontend via localStorage. Ganti dengan API backend saat production.
const INV_KEY = "kios_invoices";
const TICKET_KEY = "kios_tickets";
const SERVICE_KEY = "kios_services";

const seedInvoices = [
  { id: "INV-2026-001", paket: "Bisnis", periode: "Sep 2026", total: 100000, status: "lunas", jatuhTempo: "2026-09-01", dibayarPada: "2026-08-30" },
  { id: "INV-2026-002", paket: "Bisnis", periode: "Okt 2026", total: 100000, status: "belum", jatuhTempo: "2026-10-01", dibayarPada: null },
  { id: "INV-2026-003", paket: "Bisnis", periode: "Nov 2026", total: 100000, status: "belum", jatuhTempo: "2026-11-01", dibayarPada: null },
];

const seedTickets = [
  { id: "TCK-001", judul: "Website lambat saat promo", kategori: "Teknis", prioritas: "tinggi", status: "dibalas", pesan: "Min, website saya lambat saat trafik naik kemarin.", balasan: "Sudah kami optimasi cache. Coba cek ulang.", tanggal: "2026-09-03" },
  { id: "TCK-002", judul: "Minta bantuan pointing domain", kategori: "Domain", prioritas: "sedang", status: "dibuka", pesan: "Mau arahkan domain baru ke hosting.", balasan: null, tanggal: "2026-09-06" },
];

const seedServices = [
  { id: "SRV-01", nama: "tokobudi.com", paket: "Bisnis", status: "aktif", ssl: "aktif", backup: "hari ini", uptime: 99.9, trafik: [42, 58, 49, 67, 55, 71, 63] },
  { id: "SRV-02", nama: "blogbudi.id", paket: "Hemat", status: "aktif", ssl: "aktif", backup: "kemarin", uptime: 99.8, trafik: [28, 33, 31, 40, 36, 39, 34] },
];

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* kosongkan */ }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function getInvoices() {
  return load(INV_KEY, seedInvoices);
}

export function payInvoice(id, metode) {
  const list = getInvoices();
  const now = new Date().toISOString().slice(0, 10);
  const next = list.map((i) => (i.id === id ? { ...i, status: "lunas", dibayarPada: now, metode } : i));
  localStorage.setItem(INV_KEY, JSON.stringify(next));
  return next;
}

export function getTickets() {
  return load(TICKET_KEY, seedTickets);
}

export function createTicket({ judul, kategori, prioritas, pesan }) {
  const list = getTickets();
  const id = `TCK-${String(list.length + 1).padStart(3, "0")}`;
  const ticket = { id, judul, kategori, prioritas, status: "dibuka", pesan, balasan: null, tanggal: new Date().toISOString().slice(0, 10) };
  const next = [ticket, ...list];
  localStorage.setItem(TICKET_KEY, JSON.stringify(next));
  return next;
}

export function getServices() {
  return load(SERVICE_KEY, seedServices);
}

export function formatRupiah(n) {
  return `Rp${n.toLocaleString("id-ID")}`;
}
