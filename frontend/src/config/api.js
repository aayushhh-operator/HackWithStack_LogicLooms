// Backend API configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/api/signup`,
  LOGIN: `${API_BASE_URL}/api/login`,
  USER: `${API_BASE_URL}/api/user`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("logiclooms:token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API call failed");
  }

  return data;
};
