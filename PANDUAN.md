# Panduan GlidePool — Siap Pakai di Production

**URL Production:**
```
https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev
```

---

## Daftar Isi

1. [Yang Dibutuhkan](#1-yang-dibutuhkan)
2. [Cek API — Tanpa Wallet](#2-cek-api--tanpa-wallet)
3. [Lihat Semua Pool](#3-lihat-semua-pool)
4. [Detail Pool Tertentu](#4-detail-pool-tertentu)
5. [AI Advisor — Lewat Browser](#5-ai-advisor--lewat-browser)
6. [Deploy Agent — Lewat Browser](#6-deploy-agent--lewat-browser)
7. [Deploy Agent — Lewat API (curl)](#7-deploy-agent--lewat-api-curl)
8. [Kelola Agent — Pause / Resume / Stop](#8-kelola-agent--pause--resume--stop)
9. [Monitor Live Decisions](#9-monitor-live-decisions)
10. [Lihat Posisi LP (jika punya)](#10-lihat-posisi-lp-jika-punya)
11. [Pool yang Aktif & Rekomen untuk Test](#11-pool-yang-aktif--rekomen-untuk-test)

---

## 1. Yang Dibutuhkan

| Kebutuhan | Keterangan |
|---|---|
| Browser | Chrome / Brave / Firefox |
| Wallet | MetaMask, Coinbase Wallet, atau WalletConnect |
| Network | Base Mainnet (Chain ID: 8453) |
| ETH di Base | Untuk gas fee (beberapa sen cukup) |
| USDC di Base | Opsional — hanya jika x402 payment gating diaktifkan |

**Cara tambah Base Mainnet ke MetaMask:**
- Buka MetaMask → Networks → Add Network
- Network Name: `Base`
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- Symbol: `ETH`
- Explorer: `https://basescan.org`

Atau langsung klik "Add to MetaMask" di: https://chainlist.org/chain/8453

---

## 2. Cek API — Tanpa Wallet

Verifikasi server hidup:

```bash
curl https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/healthz
```

Response yang diharapkan:
```json
{"status":"ok"}
```

---

## 3. Lihat Semua Pool

```bash
curl https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/pools
```

Response: array 28 pool Maverick V2 dari Base Mainnet dengan data on-chain (TVL, current price, active tick, fee rate).

---

## 4. Detail Pool Tertentu

Gunakan salah satu pool address di bawah (pool dengan likuiditas aktif):

```bash
# WETH/USDC — pool paling likuid
curl https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/pools/0x3d70b2f31f75dc84acdd5e1588695221959b2d37
```

```bash
# msUSD/USDC — stablecoin pair, low fee
curl https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/pools/0xf4c6d8547bc99ba986c9f45a2ebd867a23efd0d7
```

```bash
# WETH/msETH — ETH-correlated pair
curl https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/pools/0x4bf2ce4b332917d68682811c8b4f0e7079057dbc
```

Response contoh:
```json
{
  "poolAddress": "0x3d70b2f31f75dc84acdd5e1588695221959b2d37",
  "tokenASymbol": "WETH",
  "tokenBSymbol": "USDC",
  "feeRate": 0.0015,
  "currentPrice": 3421.58,
  "activeTick": 2103,
  "tvlUsd": 21310,
  "binCounter": 48
}
```

---

## 5. AI Advisor — Lewat Browser

1. Buka: `https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/advisor`
2. Klik **Connect Wallet** → pilih MetaMask → pastikan di Base Mainnet
3. Di dropdown **Pool**, pilih misalnya `WETH/USDC`
4. **My Position** — biarkan kosong jika belum punya posisi LP
5. **Your Goal** — isi salah satu contoh berikut (tinggal copy-paste):

```
Maximize fee income on WETH/USDC with medium risk tolerance. I plan to hold for 2 weeks.
```

```
I'm new to DLMM. Suggest the safest entry strategy for a stablecoin pool with minimal IL risk.
```

```
I want to add liquidity to WETH/USDC. What bin mode and range is optimal given current price?
```

6. Klik **Analyze** → tunggu 3-5 detik → Claude Opus 4 akan return:
   - **Action**: hold / rebalance / add_liquidity / withdraw
   - **Risk Level**: low / medium / high
   - **Suggested Bin Range**: lower tick – upper tick
   - **Reasoning**: penjelasan lengkap

> Jika muncul **402 Payment Required** — artinya `X402_ENABLED=true` di server. Perlu 0.05 USDC di Base untuk lanjut.

---

## 6. Deploy Agent — Lewat Browser

1. Buka: `https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/agent/setup`
2. Connect wallet
3. Pilih **Pool** — rekomen: `WETH/USDC` atau `msUSD/USDC`
4. Pilih **Strategy**:
   - `Balanced` → paling aman untuk mulai
5. Set **USDC Budget**: `100` (atau minimum 10)
6. Set **Interval**: `5 min` (300 detik)
7. Klik **Deploy Agent**

Agent langsung aktif. Setiap 5 menit agent akan:
- Baca state pool dari Base Mainnet
- Kirim ke Claude Opus 4 untuk analisis
- Simpan keputusan ke database
- Tampil di Monitor page

---

## 7. Deploy Agent — Lewat API (curl)

Ganti `0xYOUR_WALLET_ADDRESS` dengan alamat wallet kamu:

```bash
curl -X POST https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0xYOUR_WALLET_ADDRESS",
    "poolAddress": "0x3d70b2f31f75dc84acdd5e1588695221959b2d37",
    "strategy": "balanced",
    "budgetUsdc": 100,
    "analysisIntervalSec": 300
  }'
```

Response:
```json
{
  "id": "uuid-agent-id",
  "userAddress": "0xyouraddress",
  "poolAddress": "0x3d70b2f31f75dc84acdd5e1588695221959b2d37",
  "strategy": "balanced",
  "budgetUsdc": "100",
  "status": "active",
  "analysisIntervalSec": 300,
  "lastAnalysisAt": null,
  "createdAt": "2026-06-14T..."
}
```

**Simpan `id` dari response — butuh untuk langkah berikutnya.**

---

## 8. Kelola Agent — Pause / Resume / Stop

Ganti `AGENT_ID` dan `0xYOUR_WALLET_ADDRESS` sesuai:

```bash
# Pause agent
curl -X PUT "https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/agents/AGENT_ID/status?userAddress=0xYOUR_WALLET_ADDRESS" \
  -H "Content-Type: application/json" \
  -d '{"status": "paused"}'
```

```bash
# Resume agent
curl -X PUT "https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/agents/AGENT_ID/status?userAddress=0xYOUR_WALLET_ADDRESS" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

```bash
# Stop agent (permanent)
curl -X PUT "https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/agents/AGENT_ID/status?userAddress=0xYOUR_WALLET_ADDRESS" \
  -H "Content-Type: application/json" \
  -d '{"status": "stopped"}'
```

---

## 9. Monitor Live Decisions

**Lewat browser:**

```
https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/monitor
```

Connect wallet → lihat live log semua keputusan agent per interval.

**Lewat API:**

```bash
# Lihat semua agent milik wallet
curl "https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/agents?userAddress=0xYOUR_WALLET_ADDRESS"
```

```bash
# Lihat 20 keputusan LLM terakhir dari satu agent
curl "https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/agents/AGENT_ID/actions"
```

Response actions:
```json
[
  {
    "id": "action-uuid",
    "agentId": "agent-uuid",
    "actionType": "hold",
    "status": "completed",
    "llmReasoning": "Pool reserves are stable, price within optimal range...",
    "llmRecommendation": {
      "action": "hold",
      "riskLevel": "low",
      "summary": "Hold current position — no rebalance needed",
      "recommendation": {
        "action": "hold",
        "reasoning": "Current tick is within the suggested bin range...",
        "suggestedBinRange": { "lowerTick": 2090, "upperTick": 2120 }
      }
    },
    "createdAt": "2026-06-14T10:30:00.000Z"
  }
]
```

---

## 10. Lihat Posisi LP (jika punya)

Jika wallet punya Maverick V2 LP position di Base:

```bash
curl https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/api/positions/0xYOUR_WALLET_ADDRESS
```

Lewat browser:
```
https://70546dec-db32-482c-8017-ded0c061af4c-00-2lcz3ei5e7ww2.sisko.replit.dev/positions
```

---

## 11. Pool yang Aktif & Rekomen untuk Test

| Pool | Address | Fee | Rekomen Untuk |
|---|---|---|---|
| WETH/USDC | `0x3d70b2f31f75dc84acdd5e1588695221959b2d37` | 0.15% | Test advisor & agent |
| msUSD/USDC | `0xf4c6d8547bc99ba986c9f45a2ebd867a23efd0d7` | 0.045% | Stablecoin low-risk |
| WETH/msETH | `0x4bf2ce4b332917d68682811c8b4f0e7079057dbc` | 0.042% | ETH-correlated |
| DAI/USDC | `0x1b55d94b553475e7561fab889bf88fe4f491d29c` | 0.002% | Ultra low fee stable |
| WETH/wstETH | `0xaaf7c86c2f631bac45c671645e583c7f93c8b6cf` | 0.1% | ETH staking pair |
| cbETH/WETH | `0x2cebcf66f023aa88003593804504a8df882d12e6` | 0.01% | LSD pair |

> Pool dengan `binCounter = 0` dan `tvlUsd = 0` artinya kosong on-chain — agent tetap bisa dipasang dan advisor tetap jalan, tapi tidak akan ada rebalance action sampai ada liquidity.

---

## Alur Lengkap Sekali Coba

```
1. Buka /pools → pilih WETH/USDC → lihat data on-chain
2. Klik "Tanya AI Advisor" → isi goal → klik Analyze
3. Buka /agent/setup → connect wallet → pilih pool → Deploy Agent
4. Buka /monitor → lihat keputusan LLM masuk setiap 5 menit
5. Buka /dashboard → pause / resume agent dari sini
```

---

*GlidePool adalah platform non-custodial. Server tidak pernah menyimpan private key atau dana. Setiap transaksi on-chain membutuhkan tanda tangan wallet pengguna.*
