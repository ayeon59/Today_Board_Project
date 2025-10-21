const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request(path, options = {}) {
  const { method = "GET", body, token, headers } = options;
  const reqHeaders = new Headers(headers ?? {});
  if (body && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
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
      ? data?.message?.[0]
      : data?.message ?? "요청에 실패했습니다.";
    throw new Error(message);
  }

  return data;
}

export async function register(payload) {
  return request("/auth/register", { method: "POST", body: payload });
}

export async function login(payload) {
  return request("/auth/login", { method: "POST", body: payload });
}

export async function fetchProfile(token) {
  if (!token) throw new Error("로그인이 필요합니다.");
  return request("/auth/profile", { token });
}

export const authApi = {
  register,
  login,
  fetchProfile,
};
