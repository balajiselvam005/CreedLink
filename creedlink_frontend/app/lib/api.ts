const BASE_URL = "http://localhost:5000";

export async function apiFetch(endpoint: string, options: RequestInit = {}, retry = true) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if ((res.status === 401 || res.status === 403) && retry) {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      localStorage.removeItem("accessToken");
      throw new Error("Session Expired");
    }

    const refreshData = await refreshRes.json();

    localStorage.setItem("accessToken", refreshData.accessToken);

    return apiFetch(endpoint, options);
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}
