// Network utility for menu upload/fetch

export class MenuNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MenuNetworkError';
  }
}

export class MenuRateLimitError extends Error {
  public waitTimeMinutes: number;
  
  constructor(message: string, waitTimeMinutes: number = 0) {
    super(message);
    this.name = 'MenuRateLimitError';
    this.waitTimeMinutes = waitTimeMinutes;
  }
}

// Helper function to parse 429 rate limit responses
async function parseRateLimitError(response: Response): Promise<MenuRateLimitError> {
  const errorText = await response.text().catch(() => '');
  if (errorText) {
    const errorData = JSON.parse(errorText);
    if (errorData && errorData.retryAfter?.minutes) {
      const waitTimeMinutes = errorData.retryAfter.minutes;
      return new MenuRateLimitError('Rate limit exceeded', waitTimeMinutes);
    }
  }
  return new MenuRateLimitError('Too many requests. Please try again later.', 0);
}

function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Use Next.js in-app proxy during development (same-origin avoids CORS)
    return '/api/proxy/v1';
  }
  // Use real API in prod/export
  return 'https://api.relationshipmenu.org/v1';
}

// Upload encrypted menu data, returns token
export async function uploadEncryptedMenu(encryptedData: Uint8Array): Promise<string> {
  try {
    const baseUrl = getApiBaseUrl();
    const base64 = btoa(String.fromCharCode(...encryptedData));
    const res = await fetch(`${baseUrl}/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: base64
    });
    if (res.status === 201) {
      const json = await res.json();
      if (!json.token) throw new MenuNetworkError('Invalid response');
      return json.token;
    } else if (res.status === 400) {
      throw new MenuNetworkError('Bad request: malformed data');
    } else if (res.status === 429) {
      throw await parseRateLimitError(res);
    } else {
      throw new MenuNetworkError(`Unexpected status: ${res.status}`);
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof MenuRateLimitError || error instanceof MenuNetworkError) {
      throw error;
    }
    throw new MenuNetworkError('Upload failed');
  }
}

// Fetch encrypted menu data by token (triggers auto-deletion timer)
export async function fetchEncryptedMenu(token: string): Promise<Uint8Array<ArrayBuffer>> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/menus/${token}`);
    if (res.status === 200) {
      const base64 = await res.text();
      const binary = atob(base64);
      return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    } else if (res.status === 404) {
      throw new MenuNetworkError('Menu not found');
    } else if (res.status === 429) {
      throw await parseRateLimitError(res);
    } else {
      throw new MenuNetworkError(`Unexpected status: ${res.status}`);
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof MenuRateLimitError || error instanceof MenuNetworkError) {
      throw error;
    }
    console.error('Fetch failed:', error);
    throw new MenuNetworkError('Fetch failed');
  }
}

// Check if a menu exists (does NOT trigger auto-deletion)
export async function checkMenuExists(token: string): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/menus/${token}/exists`);
    if (res.status === 200) {
      const data = await res.json();
      return data.exists;
    } else if (res.status === 404) {
      return false;
    } else if (res.status === 429) {
      throw await parseRateLimitError(res);
    } else {
      throw new MenuNetworkError(`Unexpected status: ${res.status}`);
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof MenuRateLimitError || error instanceof MenuNetworkError) {
      throw error;
    }
    throw new MenuNetworkError('Failed to check menu existence');
  }
} 

// Delete a shared menu by token
export async function deleteSharedMenu(token: string): Promise<void> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/menus/${token}`, { method: 'DELETE' });
    if (res.status === 204 || res.status === 200) {
      return; // Successfully deleted
    } else if (res.status === 404) {
      throw new MenuNetworkError('Menu not found');
    } else if (res.status === 429) {
      throw await parseRateLimitError(res);
    } else {
      throw new MenuNetworkError(`Unexpected status: ${res.status}`);
    }
  } catch (error) {
    if (error instanceof MenuRateLimitError || error instanceof MenuNetworkError) {
      throw error;
    }
    throw new MenuNetworkError('Delete failed');
  }
}