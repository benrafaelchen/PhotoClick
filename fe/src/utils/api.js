const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8801";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      handleAuthExpired();
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return response.json();
}

export async function apiPost(endpoint, body) {
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      handleAuthExpired();
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function apiUpload(endpoint, formData) {
  const token = localStorage.getItem("authToken");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      handleAuthExpired();
    }
    throw new Error(data.message || `Upload failed (${response.status})`);
  }
  return data;
}

function handleAuthExpired() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  if (window.location.pathname !== "/signin" && window.location.pathname !== "/") {
    window.location.href = "/signin";
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

export function getUserInfo() {
  return {
    email: localStorage.getItem("userEmail"),
    userId: localStorage.getItem("userId"),
    role: parseInt(localStorage.getItem("userRole"), 10) || 0,
    name: localStorage.getItem("userName"),
    token: localStorage.getItem("authToken"),
  };
}

export function setUserSession(data) {
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("userEmail", data.email);
  localStorage.setItem("userId", data.personalId);
  localStorage.setItem("userRole", data.roleID);
  localStorage.setItem("userName", data.firstName || "");
}

export function clearSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
}

export { API_BASE };
