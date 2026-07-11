const BASE_URL = "http://localhost:5000";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errJson = JSON.parse(text);
      if (errJson.error || errJson.message) {
        errorMsg = errJson.error || errJson.message;
      }
    } catch {
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}
