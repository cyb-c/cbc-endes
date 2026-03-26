const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Health check
export async function checkHealth() {
  return fetchApi<{ status: string; timestamp: string }>('/api/health');
}

// Test endpoint
export async function getTest() {
  return fetchApi<{ message: string }>('/api/test');
}

// D1 test
export async function getDbTest() {
  return fetchApi<{ success: boolean; data: any[] }>('/api/db/test');
}
