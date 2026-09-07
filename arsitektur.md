# Arsitektur Sistem & Blueprint KiosHosting.id (Production-Ready)

Dokumen ini adalah cetak biru teknis dan operasional untuk mentransformasi KiosHosting.id dari landing page statis menjadi platform SaaS Web Hosting terotomatisasi penuh, aman, dan siap scale.

---

## 1. Topologi Arsitektur 3-Tier

```
[ FRONTEND TIER ]
   ├── Public Landing Page (React + Tailwind + GSAP) -> kioshosting.id
   └── Client Portal / Billing UI (Custom Theme)     -> app.kioshosting.id
            │
            ▼ (REST API / Webhook)
[ ORCHESTRATION & BILLING TIER ]
   ├── Billing Engine (WHMCS / FOSSBilling / Custom FastAPI)
   ├── Payment Gateway Integration (Midtrans / Tripay / Xendit)
   ├── Domain Registrar Connector (ResellerClub / Domainesia API)
   ├── Notification Hub (WhatsApp Gateway API + Resend/Mailgun Email)
   └── Automated Cron Worker (Dunning, Invoicing, Provisioning)
            │
            ▼ (Encrypted API / SSH Keys)
[ INFRASTRUCTURE & NODE TIER ]
   ├── DNS Edge: Cloudflare Pro (DDoS Mitigation, SSL/TLS, Caching)
   ├── Web Server Node 1 (Ubuntu 22.04 LTS + CyberPanel/HestiaCP/WHM)
   │     ├── Web Engine (OpenLiteSpeed / NGINX)
   │     ├── Runtime Sandbox (cgroups / CloudLinux CageFS)
   │     └── Security Layer (UFW, Fail2ban, ModSecurity WAF)
   └── Off-Site Backup Node (S3-Compatible / Wasabi / Google Drive Cold Storage)
```

---

## 2. Definisi Hak Akses & Peran (RBAC)

1. **Super Admin (Owner)**
   - Manajemen paket, alokasi resource, dan pricing matrix.
   - Dashboard analitik real-time: MRR (Monthly Recurring Revenue), LTV, Churn Rate, Server Load.
   - Manajemen darurat: Force Suspend/Unsuspend, Re-issue License, Node Migration.
2. **Support Agent (Staff)**
   - Akses read/reply tiket bantuan & viewing log error klien.
   - Tanpa akses ke saldo payment gateway atau konfigurasi root server.
3. **Client (Pelanggan)**
   - One-click SSO Login ke panel hosting tanpa mengetik password cPanel/CyberPanel.
   - Manajemen DNS, file backup on-demand, dan perpanjangan invoice.
   - Buka tiket kendala teknis + upload attachment log error.
4. **Automated Cron Daemon**
   - Berjalan per jam/harian untuk rekonsiliasi pembayaran, dunning reminder, dan lifecycle akun.

---

## 3. Matriks Fitur Lengkap & Konkrit

### A. Modul Checkout, Domain & Onboarding
- **Live Domain Availability Checker:** Cek domain .com/.id/.net via API langsung dari halaman depan dengan saran alternatif jika nama domain sudah terpakai.
- **Smart Cart Flow:** Pilihan durasi billing (Bulanan / Tahunan + bonus domain gratis) langsung menghitung diskon dan total secara real-time.
- **SSO & Social Auth:** Pendaftaran cepat via Google OAuth untuk menurunkan friksi checkout.

### B. Modul Pembayaran & Finansial Otomatis
- **Multi-Channel Payment Gateway:**
  - QRIS Dinamis (ShopeePay, GoPay, Dana, OVO, LinkAja).
  - Virtual Account Bank Otomatis (BCA, Mandiri, BNI, BRI).
  - Pembayaran ritel (Alfamart / Indomaret jika target pasar UMKM luas).
- **Auto-Confirmation Callback:** Webhook handler dengan verifikasi checksum aman untuk validasi pembayaran instan (< 5 detik).
- **Auto-Invoicing & Pajak:** Invoice PDF digital otomatis terkirim via Email dan link unduh di WhatsApp.

### C. Modul Server Provisioning & Lifecycle Automation
- **Instant Auto-Provisioning:** Begitu webhook `payment.success` tervalidasi, API otomatis membuat akun di server node, mengaktifkan vHost, memasang SSL Let's Encrypt, dan mengirim email detail login.
- **Siklus Dunning & Kebijakan Jatuh Tempo:**
  - `H-7 & H-3`: Reminder invoice via WhatsApp & Email.
  - `H-0`: Invoice jatuh tempo.
  - `H+3 (Grace Period)`: Akun otomatis di-*suspend* sementara jika belum lunas (website menampilkan halaman suspend rapi).
  - `H+30`: Akun di-*terminate* dari server aktif setelah arsip snapshot cold storage dibuat.
  - `Instant Unsuspend`: Pembayaran tagihan tertunggak langsung mengaktifkan kembali website dalam hitungan detik.

### D. Modul Keamanan, Isolasi & WAF
- **Account Sandbox:** Isolasi proses antar-user (mencegah satu website yang kena malware menulari website pelanggan lain di node yang sama).
- **Brute Force & DDoS Shield:**
  - Cloudflare Edge proxy di layer DNS.
  - Fail2ban untuk ban otomatis IP penyerang SSH/FTP/Panel login setelah 5x gagal.
- **Auto-SSL Renewal:** Cron otomatis memperbarui sertifikat SSL sebelum masa berlaku 90 hari habis.

### E. Modul Backup & Disaster Recovery (Aturan 3-2-1)
- **Snapshot Mingguan Otomatis:** Script backup berjalan tiap dini hari, mengenkripsi arsip, dan mengirimkannya ke storage terpisah (Wasabi / AWS S3 / Cloud Storage).
- **Self-Service Restore:** Pelanggan bisa melakukan restore point website mereka langsung dari Client Area.

### F. Modul Helpdesk & Komunikasi Pelanggan
- **WhatsApp Transactional Gateway:** Notifikasi real-time ke nomor HP pelanggan untuk tagihan, konfirmasi pembayaran, dan status tiket.
- **Helpdesk Ticket System:** Kategorisasi kendala (Billing, Teknis, Domain, Darurat) dengan SLA response target (< 15 menit).
- **Knowledgebase Terstruktur:** Panduan pointing DNS, setting email outlook, upload WordPress, dan migrasi mandiri.

---

## 4. Monitoring & Observabilitas Sistem

- **Uptime Monitoring:** Ping setiap 60 detik via UptimeRobot / BetterStack ke server node.
- **Resource Saturation Alert:** Webhook ke grup WhatsApp/Telegram Admin jika:
  - CPU Usage > 85% selama 10 menit berturut-turut.
  - RAM Usage > 80%.
  - Storage Disk Free < 15%.
- **Public Status Page:** Halaman `status.kioshosting.id` untuk transparansi uptime ke pelanggan.

---

## 5. Rencana Eksekusi & Roadmap Terstruktur

```
[ FASE 1: LANDING PAGE & BRANDING ] ── (SELESAI)
   └── UI/UX Landing Page selesai, tema dark violet, copywriting fokus penjualan.

[ FASE 2: SERVER HARDENING & NODE SETUP ]
   ├── Setup VPS OS (Ubuntu 22.04 LTS), Firewall UFW, Fail2ban.
   ├── Install Hosting Panel (CyberPanel OpenLiteSpeed / HestiaCP / cPanel).
   ├── Konfigurasi Private Name Server (ns1.kioshosting.id, ns2.kioshosting.id).
   └── Setup Off-Site Automated Backup Target.

[ FASE 3: BILLING & AUTOMATION ENGINE ]
   ├── Deploy WHMCS / Billing Core di subdomain app.kioshosting.id.
   ├── Integrasi Payment Gateway (Tripay / Midtrans API).
   ├── Integrasi WhatsApp API (Fonnte / Wablas) untuk notifikasi instan.
   └── Integrasi Panel Server API untuk auto-create akun.

[ FASE 4: UI/UX SINKRONISASI CLIENT AREA ]
   ├── Porting desain dark purple ke template Client Area WHMCS.
   └── Integrasi Domain Checker API ke Landing Page depan.

[ FASE 5: UAT (END-TO-END TRANSACTION TEST) ]
   ├── Uji coba order paket Rp 1.000 dengan QRIS.
   ├── Validasi auto-create akun, auto-SSL, dan auto-WhatsApp notification.
   └── Uji coba simulasi suspend dan unsuspend otomatis.

[ FASE 6: PUBLIC LAUNCH & ACQUISITION ]
   ├── Setup Google Analytics 4 & Meta Pixel.
   ├── Kampanye peluncuran UMKM & Developer di media sosial.
   └── GO LIVE resmi KiosHosting.id.
```
