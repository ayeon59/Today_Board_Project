const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token, query, headers } = options;
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  const reqHeaders = new Headers(headers ?? {});
  if (body && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url.toString(), {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message ?? "요청에 실패했습니다.";
    throw new Error(message);
  }

  return data;
}

export const apiClient = {
  request: apiRequest,
  API_BASE,
};

export default API_BASE;
