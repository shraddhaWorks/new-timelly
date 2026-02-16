/**
 * HyperPG Payment Gateway – server-side helpers
 *
 * Uses Session API to create a payment and Order Status API to verify.
 * Base URLs: sandbox https://sandbox.hyperpg.in, production https://api.hyperpg.in
 * This file runs only in Node (API routes). Buffer is available there.
 */
declare const Buffer: {
  from(s: string, enc?: string): { toString(enc: string): string };
};
/** Options required to create a payment session with HyperPG */
export type CreateSessionParams = {
  /** Main merchant ID (from HyperPG dashboard / env) */
  merchantId: string;
  /** API key for Basic auth (never expose in frontend) */
  apiKey: string;
  /** Base URL, e.g. https://sandbox.hyperpg.in */
  baseUrl: string;
  /** Amount in rupees (major units, e.g. 100.50) */
  amount: number;
  /** Currency code, e.g. INR */
  currency: string;
  /** Your unique order id (must be unique per transaction) */
  orderId: string;
  /** Full URL where user is redirected after payment */
  returnUrl: string;
  /** Your customer/student id (for reference) */
  customerId: string;
  /** Customer email */
  customerEmail: string;
  /** Customer phone (e.g. 10 digits) */
  customerPhone: string;
  /** Customer first name */
  firstName: string;
  /** Customer last name */
  lastName: string;
  /** Short description shown on payment page */
  description: string;
  /**
   * Optional: split settlement for sub-merchants (schools).
   * If provided, a part of the amount is settled to the sub-merchant (school).
   */
  splitSettlementDetails?: {
    /** Sub-merchant id (sub_mid) from HyperPG dashboard for this school */
    subMid: string;
    /** Amount in rupees to settle to this sub-merchant */
    amount: number;
  };
};

/** Response from HyperPG Session API (create session) */
export type CreateSessionResponse = {
  status: string;
  id: string;
  order_id: string;
  payment_links: {
    web: string;
    expiry?: string;
  };
  sdk_payload?: unknown;
  order_expiry?: string;
};

/**
 * Creates a payment session with HyperPG.
 * Returns the payment page URL to redirect the user to.
 */
export async function createSession(
  params: CreateSessionParams
): Promise<CreateSessionResponse> {
  const {
    merchantId,
    apiKey,
    baseUrl,
    amount,
    currency,
    orderId,
    returnUrl,
    customerId,
    customerEmail,
    customerPhone,
    firstName,
    lastName,
    description,
    splitSettlementDetails,
  } = params;

  // Build request body as per HyperPG Session API
  const body: Record<string, unknown> = {
    mobile_country_code: "+91",
    payment_page_client_id: "timelly",
    amount: Math.round(amount * 100) / 100, // keep 2 decimal places
    currency,
    action: "paymentPage",
    customer_email: customerEmail,
    customer_phone: customerPhone,
    first_name: firstName,
    last_name: lastName,
    description,
    customer_id: customerId,
    order_id: orderId,
    return_url: returnUrl,
    source_object: "PAYMENT_LINK",
    send_mail: false,
    send_sms: false,
    send_whatsapp: false,
    "metadata.expiryInMins": "60",
  };

  // If this school has a sub-merchant id, send split settlement so money goes to the school
  // marketplace.amount = 0 so main merchant keeps nothing; full amount goes to school (vendor)
  if (splitSettlementDetails && splitSettlementDetails.amount > 0) {
    const vendorAmount = Math.round(splitSettlementDetails.amount * 100) / 100;
    const splitPayload = {
      marketplace: { amount: Math.round((amount - vendorAmount) * 100) / 100 },
      mdr_borne_by: "ALL" as const,
      vendor: {
        split: [
          {
            amount: vendorAmount,
            merchant_commission: 0,
            sub_mid: splitSettlementDetails.subMid,
          },
        ],
      },
    };
    body["metadata.split_settlement_details"] = JSON.stringify(splitPayload);
  }

  // HyperPG uses Basic auth: base64(apiKey + ":")
  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const url = `${baseUrl.replace(/\/$/, "")}/session`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      "x-merchantid": merchantId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HyperPG session failed: ${res.status} ${errText}`);
  }

  return res.json() as Promise<CreateSessionResponse>;
}

/** Options for fetching order status from HyperPG */
export type GetOrderStatusParams = {
  merchantId: string;
  apiKey: string;
  baseUrl: string;
  /** The order_id you sent when creating the session (your own id) */
  orderId: string;
};

/** Order status response from HyperPG (relevant fields) */
export type OrderStatusResponse = {
  status: string;
  status_id?: number;
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  txn_id?: string;
  refunded?: boolean;
  amount_refunded?: number;
  effective_amount?: number;
};

/**
 * Fetches order status from HyperPG (server-to-server).
 * Use this after redirect to confirm payment before updating your DB.
 */
export async function getOrderStatus(
  params: GetOrderStatusParams
): Promise<OrderStatusResponse> {
  const { merchantId, apiKey, baseUrl, orderId } = params;
  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const url = `${baseUrl.replace(/\/$/, "")}/orders/${encodeURIComponent(orderId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-merchantid": merchantId,
      Authorization: `Basic ${auth}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HyperPG order status failed: ${res.status} ${errText}`);
  }

  return res.json() as Promise<OrderStatusResponse>;
}
