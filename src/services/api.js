const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export function githubLogin() {
  window.location.href = `${API_BASE_URL}/api/auth/github`;
}