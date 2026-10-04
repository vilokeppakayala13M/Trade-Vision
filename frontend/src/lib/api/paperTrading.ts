export interface PaperAccount {
  _id: string;
  userId: string;
  balance: number;
  startingBalance: number;
  currency: string;
  positionsValue?: number;
  equity?: number;
}

export interface PaperPosition {
  _id: string;
  userId: string;
  symbol: string;
  displaySymbol: string;
  companyName: string;
  side: string;
  quantity: number;
  avgEntryPrice: number;
  totalInvested: number;
  currentPrice?: number;
  currentValue?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
}

export interface PaperOrder {
  _id: string;
  userId: string;
  symbol: string;
  displaySymbol: string;
  side: 'BUY' | 'SELL' | 'buy' | 'sell';
  type: string;
  quantity: number;
  requestedPrice?: number;
  filledPrice: number;
  totalValue: number;
  status: 'pending' | 'filled' | 'rejected' | 'cancelled';
  filledAt: string;
  createdAt: string;
}

export interface CreateOrderPayload {
  symbol: string;
  companyName?: string;
  side: 'BUY' | 'SELL' | 'buy' | 'sell';
  type?: 'market' | 'MARKET';
  quantity: number;
  price?: number;
}

const getHeaders = (token?: string | null) => {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export async function fetchPaperAccount(token?: string | null): Promise<PaperAccount> {
  const res = await fetch('/api/paper-trading/account', {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    // Fallback to legacy endpoint if proxy routes to NestJS
    const legacyRes = await fetch('/api/paper-trading/portfolio', {
      headers: getHeaders(token),
    });
    if (!legacyRes.ok) throw new Error('Failed to fetch paper account');
    const data = await legacyRes.json();
    return data.portfolio || data;
  }
  const data = await res.json();
  return data.data || data;
}

export async function fetchPaperPositions(token?: string | null): Promise<PaperPosition[]> {
  const res = await fetch('/api/paper-trading/positions', {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch paper positions');
  const data = await res.json();
  return data.data || data;
}

export async function placePaperOrder(payload: CreateOrderPayload, token?: string | null): Promise<PaperOrder> {
  const res = await fetch('/api/paper-trading/orders', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.error || data.message || 'Order execution failed';
    throw new Error(errorMsg);
  }
  return data.data || data;
}

export async function fetchPaperOrders(token?: string | null): Promise<{ data: PaperOrder[] }> {
  const res = await fetch('/api/paper-trading/orders', {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch order history');
  const data = await res.json();
  return data;
}

export async function resetPaperAccount(token?: string | null): Promise<{ success: boolean }> {
  const res = await fetch('/api/paper-trading/account/reset', {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to reset account');
  return res.json();
}
