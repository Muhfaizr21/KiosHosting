const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const TOKEN_KEY = "kios_token";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function api(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = readToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const cleanPath = path.startsWith("/api/v1") ? path.replace("/api/v1", "") : path;
  const res = await fetch(`${API_BASE}${cleanPath}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

api.get = (path) => api("GET", path);
api.post = (path, body) => api("POST", path, body);
api.put = (path, body) => api("PUT", path, body);
api.delete = (path) => api("DELETE", path);

export async function login(email, password) {
  const data = await api("POST", "/auth/login", { email, password });
  setToken(data.token);
  return { session: data.user };
}

export async function register({ name, email, password }) {
  const data = await api("POST", "/auth/register", { name, email, password });
  setToken(data.token);
  return { session: data.user };
}

export async function logout() {
  setToken(null);
}

export function seedAuth() {
  return null;
}

export async function fetchMe() {
  const data = await api("GET", "/auth/me");
  return data.user;
}

// User-scoped API helpers
export const meApi = {
  invoices: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get(`/me/invoices${qs}`);
  },
  services: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get(`/me/services${qs}`);
  },
  serviceDetail: (id) => api.get(`/me/services/${id}`),
  tickets: () => api.get("/me/tickets"),
  createTicket: (data) => api.post("/me/tickets", data),
  replyTicket: (id, data) => api.post(`/me/tickets/${id}/reply`, data),
  settings: () => api.get("/me/settings"),
  updateSettings: (data) => api.put("/me/settings", data),
};

export function getToken() {
  return readToken();
}

export function isAuthenticated() {
  return !!readToken();
}

export function getSession() {
  try {
    const token = readToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

export function getUsers() {
  return [];
}

export function getUserRole() {
  const session = getSession();
  return session ? session.role : null;
}
