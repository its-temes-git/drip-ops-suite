const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`).replace(/\/$/, '');

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'sales';
  full_name: string;
  branch_id: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: string | number;
  brand: string;
  name: string;
  price: number;
  sizes: string[];
  color: string;
  image: string;
  qty?: number;
  category?: string;
}

export interface SaleTransactionItem {
  product_id: string | number;
  quantity: number;
}

export interface SaleTransaction {
  items: SaleTransactionItem[];
  sale_channel: string;
  notes?: string;
}

export interface DashboardData {
  today: number;
  today_transactions: number;
  week: number;
  month: number;
  top_products: any[];
  low_stock_alerts: any[];
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignored
    }

    // Handle session expiry — clear token and notify the app
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error('SESSION_EXPIRED');
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  auth: {
    login: (credentials: any): Promise<AuthResponse> => 
      fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    me: (): Promise<{user: User}> => fetchAPI('/api/auth/me'),
  },
  public: {
    products: (): Promise<Product[]> => fetchAPI('/api/products'),
    product: (id: string): Promise<Product> => fetchAPI(`/api/products/${id}`),
    categories: (): Promise<string[]> => fetchAPI('/api/products/categories'),
    trackClick: (elementId: string, page: string): Promise<any> => 
      fetchAPI('/api/products/click', { method: 'POST', body: JSON.stringify({ elementId, page }) }),
  },
  sales: {
    products: (): Promise<Product[]> => fetchAPI('/api/sales/products'),
    recordTransaction: (data: SaleTransaction) => 
      fetchAPI('/api/sales/transactions', { method: 'POST', body: JSON.stringify(data) }),
    editTransaction: (id: string, data: any) => 
      fetchAPI(`/api/sales/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTransaction: (id: string, reason: string) => 
      fetchAPI(`/api/sales/transactions/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
    mySales: () => fetchAPI('/api/sales/my-sales'),
  },
  owner: {
    dashboard: (): Promise<DashboardData> => fetchAPI('/api/owner/dashboard'),
    sales: (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchAPI(`/api/owner/sales${query}`);
    },
    deleteSale: (id: string) => fetchAPI(`/api/owner/sales/${id}`, { method: 'DELETE' }),
    deleteAllSales: () => fetchAPI('/api/owner/sales/all', { method: 'DELETE' }),
    addProduct: (data: any) => fetchAPI('/api/owner/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: string, data: any) => fetchAPI(`/api/owner/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: string | number) => fetchAPI(`/api/owner/products/${id}`, { method: 'DELETE' }),
    restock: (data: {product_id: string|number, branch_id: string, quantity: number, note?: string}) => 
      fetchAPI('/api/owner/inventory/restock', { method: 'POST', body: JSON.stringify(data) }),
    inventory: (): Promise<Product[]> => fetchAPI('/api/owner/inventory'),
    inventorySummary: () => fetchAPI('/api/owner/inventory/summary'),
    reports: {
      daily: (date: string) => fetchAPI(`/api/owner/reports/daily?date=${date}`),
      monthly: (year: string | number, month: string | number) => fetchAPI(`/api/owner/reports/monthly?year=${year}&month=${month}`),
    },
    addStaff: (data: any) => fetchAPI('/api/owner/staff', { method: 'POST', body: JSON.stringify(data) }),
    recentActivities: (limit = 20) => fetchAPI(`/api/owner/activities/recent?limit=${limit}`),
    clearActivities: () => fetchAPI('/api/owner/activities', { method: 'DELETE' }),
    profitAnalytics: (params?: { startDate?: string; endDate?: string; period?: string }) => {
      const q = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return fetchAPI(`/api/owner/analytics/profit${q}`);
    },
  }
};
