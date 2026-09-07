import { api } from "./auth";

export async function getClients(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.sort_dir) qs.set("sort_dir", params.sort_dir);

  const path = "/admin/clients" + (qs.toString() ? "?" + qs : "");
  return api("GET", path);
}

export async function getClient(id) {
  return api("GET", `/admin/clients/${id}`);
}

export async function createClient(data) {
  return api("POST", "/admin/clients", data);
}

export async function updateClient(id, data) {
  return api("PUT", `/admin/clients/${id}`, data);
}

export async function updateClientStatus(id, status) {
  return api("PUT", `/admin/clients/${id}/status`, { status });
}

export async function deleteClient(id) {
  return api("DELETE", `/admin/clients/${id}`);
}
