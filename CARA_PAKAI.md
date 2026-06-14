# Cara Pakai GlidePool — Step by Step via Web App

**URL:** https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev

---

## STEP 1 — Buka App & Connect Wallet

1. Buka URL di atas di browser
2. Klik tombol **Connect Wallet** (pojok kanan atas)
3. Pilih wallet kamu (MetaMask, Coinbase Wallet, dll)
4. Kalau muncul popup "Switch Network" → klik **Switch to Base**
5. Pastikan di header muncul alamat wallet kamu (0x...) → berarti sudah connect

> Kalau belum punya Base Mainnet di MetaMask:
> Buka MetaMask → Add Network → masukkan:
> - RPC: `https://mainnet.base.org`
> - Chain ID: `8453`
> - Symbol: `ETH`

---

## STEP 2 — Lihat Pools

1. Klik **Pools** di navbar
2. Akan muncul daftar 28 pool Maverick V2 di Base Mainnet
3. Data yang tampil adalah data real dari on-chain: TVL, harga, fee rate
4. Klik salah satu pool, misalnya **WETH/USDC** untuk lihat detailnya
5. Di halaman detail pool:
   - Lihat **Current Price**, **Active Tick**, **TVL**, **Bin Count**
   - Kalau TVL = $0 dan Bin Count = 0 → pool masih kosong, belum ada likuiditas
   - Pool yang bagus untuk dicoba: **WETH/USDC**, **msUSD/USDC**, **DAI/USDC**

---

## STEP 3 — Tanya AI Advisor

Dari halaman detail pool, klik tombol **Tanya AI Advisor** (di bawah halaman).
Atau buka langsung: klik **Deploy Agent** di navbar → tidak, salah → klik menu yang ada **AI Advisor**... tunggu, navigasi langsung:

Buka: `/advisor` atau klik link "AI Advisor" di footer halaman pool detail.

1. **Pool** — sudah ter-select otomatis kalau dari pool detail, atau pilih manual
2. **My Position** — kosongkan kalau belum punya posisi LP
3. **Your Goal** — ketik tujuan kamu, contoh:

```
Maximize fee income on WETH/USDC. Medium risk. Planning to hold 2 weeks.
```

4. Klik **Analyze**
5. Tunggu 3-5 detik → Claude Opus 4 akan kasih rekomendasi:
   - **Action**: hold / rebalance / add_liquidity / withdraw
   - **Risk Level**: low / medium / high
   - **Bin Range**: range tick yang disarankan
   - **Reasoning**: penjelasan kenapa

---

## STEP 4 — Deploy Agent

1. Klik **Deploy Agent** di navbar
2. Wallet harus sudah connect — kalau belum, connect dulu
3. Isi form:

   | Field | Isi |
   |---|---|
   | Pool | Pilih **WETH/USDC** (paling likuid) |
   | Strategy | Pilih **Balanced** (aman untuk mulai) |
   | USDC Budget | Isi `100` (minimum 10) |
   | Interval | Pilih **5 min** |

4. Klik **Deploy Agent**
5. Kalau sukses → muncul konfirmasi dengan Agent ID, pool, strategy, status: ACTIVE
6. Klik **Open Monitor** untuk lihat agent langsung

---

## STEP 5 — Pantau Agent di Monitor

1. Klik **Monitor** di navbar
2. Connect wallet kalau belum
3. Pilih agent kamu dari dropdown di atas (kalau ada lebih dari satu)
4. Log akan muncul setiap kali agent selesai analisis (sesuai interval yang diset)
5. Yang tampil di log:
   - `HOLD` → harga masih dalam range, tidak perlu aksi
   - `REBALANCE` / `ADD LIQUIDITY` → agent sarankan aksi → perlu tanda tangan wallet
   - Timestamp dalam UTC

---

## STEP 6 — Kelola Agent di Dashboard

1. Klik **Dashboard** di navbar
2. Tampil semua agent yang kamu deploy
3. Aksi yang bisa dilakukan per agent:
   - ⏸ **Pause** → agent berhenti analisis sementara
   - ▶ **Resume** → aktifkan lagi
   - ⏹ **Stop** → matikan permanent (tidak bisa di-resume)
4. Stat yang tampil: jumlah agent aktif, total budget, jumlah posisi LP

---

## STEP 7 — Lihat Posisi LP Kamu (kalau ada)

1. Klik **Positions** di navbar
2. Kalau wallet kamu punya Maverick V2 LP position di Base → akan muncul di sini
3. Klik salah satu posisi untuk lihat detail:
   - Token A/B amount
   - Nilai USD
   - Bin IDs
   - Pool address
4. Ada tombol **Tanya AI Advisor** → langsung analisis posisi itu

---

## STEP 8 — Sign Transaksi (kalau agent rekomen aksi)

Kalau agent rekomen `rebalance` atau `withdraw`:

1. Buka **Monitor** → lihat log yang statusnya `PENDING SIGNATURE`
2. Di halaman **Position Detail** (`/positions/NFT_ID`) → ada tombol **Execute**
3. Klik → wallet popup muncul → review transaksi
4. Klik **Confirm** di wallet
5. Transaksi dikirim ke Base Mainnet
6. Setelah confirmed → status di monitor berubah jadi `signed`

---

## Alur Singkat (Cheat Sheet)

```
Buka app
  → Connect Wallet (Base Mainnet)
    → Pools → pilih WETH/USDC
      → Tanya AI Advisor → isi goal → Analyze
        → Deploy Agent → pilih pool + Balanced + 100 USDC + 5min → Deploy
          → Monitor → lihat keputusan LLM tiap 5 menit
            → Dashboard → pause/stop kalau perlu
```

---

## Yang Perlu Diingat

- **GlidePool tidak pegang dana kamu** — semua transaksi butuh tanda tangan wallet sendiri
- **Pool TVL $0** = pool kosong, agent tetap jalan tapi tidak ada aksi rebalance
- **AI Advisor butuh wallet connect** — tanpa connect tidak bisa analisis
- **x402** = kalau muncul error 402 saat analisis, artinya server butuh 0.05 USDC per query (mode ini off by default)
- **Interval minimum** = 30 detik, tapi rekomen 5 menit agar tidak spam LLM
