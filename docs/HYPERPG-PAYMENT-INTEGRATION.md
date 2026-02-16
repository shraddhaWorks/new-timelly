# HyperPG Payment Integration – Process & Concepts

## 1. What HyperPG Gave You (Concepts)

### Merchant ID
- **What it is:** A unique identifier for your (or each school’s) account with HyperPG.
- **Use:** Sent in API requests so HyperPG knows which account should receive the money and which settings (e.g. settlement, branding) to use.
- **In your app:** You already do “per school” payments: each school can have its own credentials. For HyperPG we’ll store **HyperPG Merchant ID** per school (like you do with Juspay’s `juspayMerchantId`).

### API Key
- **What it is:** A secret key that proves the request is from you (or that school). Never exposed in the browser.
- **Use:** Sent in server-side API calls (e.g. when creating an order/session). HyperPG validates it and then processes the request.
- **In your app:** Stored per school (e.g. `hyperpgApiKey` in `SchoolSettings`) or as a global fallback in `.env`, and used only in Next.js API routes (e.g. `create-order`).

### Session APIs
- **What it usually means:** “Session” here typically means a **payment session** or **checkout session**:
  1. **Create session** – Your backend calls HyperPG with amount, currency, return URL, etc. HyperPG returns a **session ID** (and often a **payment URL** or **client token**).
  2. **User pays** – Parent/student is sent to HyperPG’s page (or a hosted checkout) using that session.
  3. **Completion** – User is redirected back to your app (with success/failure), or HyperPG notifies you via **webhook**. You then **verify** and update fee in your DB.
- So “session APIs” = the APIs you use to **create** and optionally **query** a payment session; the actual “pay” step is either redirect or embedded UI using that session.

---

## 2. High-Level Process (What We’ll Implement)

Your current flow (Juspay/Razorpay):

1. Student/parent clicks “Pay” → frontend calls **your** `POST /api/payment/create-order` with amount (and optional return path).
2. Your API uses **school’s** (or global) credentials, calls gateway (Juspay), gets back order ID + payment URL (or Razorpay order).
3. User is redirected to gateway (or Razorpay popup), pays, then comes back to your app with `success=1&order_id=...&payment_id=...`.
4. Frontend or return URL calls **your** `POST /api/payment/verify` with gateway, order ID, payment ID, amount.
5. Your API verifies (e.g. signature for Razorpay), creates `Payment` record, updates `StudentFee.amountPaid` / `remainingFee`.

For **HyperPG** we’ll mirror this:

| Step | Current (Juspay) | With HyperPG |
|------|-------------------|--------------|
| 1 | Same | Same – `PayButton` calls `create-order` |
| 2 | Create Juspay order, get payment URL | Create HyperPG **session** (or order), get **payment URL** or **session ID** |
| 3 | Redirect to Juspay | Redirect to HyperPG hosted page (or their SDK if they provide one) |
| 4 | Return URL has `order_id`, `payment_id` | Return URL has HyperPG’s success params (we need exact param names from their docs) |
| 5 | Verify with Juspay order + payment IDs | Verify with HyperPG (webhook or server-side status API), then create `Payment` and update fee |

So the **process** for you:

1. **Get from HyperPG:**  
   - Sandbox **Merchant ID** and **API Key** (you said you have one sandbox test merchant).  
   - **API docs** (PDF or link): especially “create session” (or “create order”) and “verify / status / webhook”.

2. **In the app we will:**  
   - Add HyperPG fields to `SchoolSettings` (e.g. `hyperpgMerchantId`, `hyperpgApiKey`) and optional global env fallback.  
   - In `create-order`: if school (or global) has HyperPG creds, call HyperPG “create session” (or equivalent), return the **payment URL** (or session ID + frontend URL) to the client.  
   - In `PayButton` (and payments page): when gateway is HyperPG, redirect to that URL (same as Juspay).  
   - On return: read HyperPG’s success params and call **verify** with `gateway: "HYPERPG"` and the IDs HyperPG returns.  
   - In **verify**: validate with HyperPG (status API or webhook payload), then create `Payment` and update `StudentFee` (same as today).  
   - Add `HYPERPG` to `Payment.gateway` and store HyperPG-specific IDs (e.g. `hyperpgOrderId`, `hyperpgPaymentId`) in DB.

3. **Session APIs in practice:**  
   - “Create session” = the API we call in `create-order` to get the link/token for the user.  
   - “Session” = one payment attempt; after they pay, we either verify via redirect params or via webhook.

---

## 3. What I Need From You (So We Can Implement)

To wire this end-to-end without guessing:

1. **HyperPG API documentation**  
   - Do you have a PDF, link, or portal section that shows:  
     - Base URL (e.g. `https://api.sandbox.hyperpg.in` or similar)?  
     - “Create session” or “Create order” endpoint (path, method, request/response body)?  
     - How to verify a payment (redirect query params vs webhook vs “get transaction status” API)?

2. **Success / failure flow**  
   - After payment, does HyperPG **redirect** the user back to your site with query params (e.g. `?order_id=...&payment_id=...&status=success`)?  
   - Or do they only send a **webhook** to your server? (If both, we’ll support both.)

3. **Sandbox credentials**  
   - Confirm you have:  
     - Sandbox **Merchant ID**  
     - Sandbox **API Key**  
   - We’ll use these in `.env` as global fallback and optionally per school in DB.

4. **Per-school vs single merchant**  
   - You said “each school has merchant id and api key”. For now do you want:  
     - Only the **one** sandbox merchant for all schools, or  
     - DB fields per school so later each school can have its own HyperPG merchant?

5. **Replace or add**  
   - Should HyperPG **replace** Juspay/Razorpay for fee payments, or run **alongside** them (school chooses gateway)?

---

## 4. Implementation Done – Code Overview

### Backend

- **`lib/hyperpg.ts`**  
  - `createSession(params)` – Calls HyperPG `POST /session` with amount, customer details, optional `metadata.split_settlement_details` for school sub-merchant. Returns `payment_links.web` for redirect.  
  - `getOrderStatus(params)` – Calls HyperPG `GET /orders/:orderId` to confirm status (e.g. `CHARGED`) before recording payment.

- **`app/api/payment/create-order/route.ts`**  
  - Only students can call. Reads `HYPERPG_MERCHANT_ID`, `HYPERPG_API_KEY`, `HYPERPG_BASE_URL` from env. Loads student and school; if school has `hyperpgSubMid`, sends split settlement so the full amount goes to that sub-merchant. Builds `return_url` with `success=1&order_id=...&amount=...`. Returns `payment_url` for the client to redirect.

- **`app/api/payment/verify/route.ts`**  
  - Accepts `order_id` (ours) and `amount`. Idempotent: if a payment with that `order_id` already exists, returns success. Otherwise calls `getOrderStatus`, checks `status === "CHARGED"`, then creates `Payment` (gateway `HYPERPG`, `transactionId` = our order_id) and updates `StudentFee.amountPaid` / `remainingFee`.

### Frontend

- **`components/PayButton.tsx`**  
  - Calls `POST /api/payment/create-order` with amount and optional `return_path`, then redirects to `order.payment_url` (HyperPG payment page).

- **`app/payments/page.tsx`** and **`app/frontend/.../ParentFeesTab.tsx`**  
  - On load, if URL has `success=1&order_id=...&amount=...`, call `POST /api/payment/verify` with those params, then refresh fee state and clean the URL.

### School settings

- **`app/api/school/settings/route.ts`**  
  - GET/PUT support `hyperpgSubMid`. Main merchant is in env; each school can set its Sub Account Id (sub_mid) for split settlement.

- **`components/school.tsx`**  
  - School form includes “HyperPG Sub-Merchant ID”; saved via PUT to `/api/school/settings`.

### Env (see `.env.example`)

- `HYPERPG_MERCHANT_ID` – Main merchant ID from HyperPG.  
- `HYPERPG_API_KEY` – API key (Basic auth).  
- `HYPERPG_BASE_URL` – Optional; default `https://sandbox.hyperpg.in` (production: `https://api.hyperpg.in`).  
- `NEXTAUTH_URL` – Used to build `return_url` (e.g. `https://yoursite.com/payments`).

### Database

- **Migration** `prisma/migrations/20260216120000_hyperpg_payment` adds `SchoolSettings.hyperpgSubMid` and `Payment.hyperpgOrderId`, `hyperpgPaymentId`, `hyperpgStatus`; default `Payment.gateway` set to `HYPERPG`.  
- Run: `npx prisma migrate deploy` (or `prisma migrate dev` locally).
