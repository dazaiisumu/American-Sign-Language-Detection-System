// src/api/authApi.ts

export interface LoginRequest { email: string; password: string; }
export interface SignupRequest { email: string; password: string; name: string; }
export interface AuthResponse {
  success: boolean;
  data?: { id: number; email: string; name: string };
  error?: string;
}

const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const authRequest = async (endpoint: string, options: RequestInit = {}): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include", // important for session cookies
      headers: { "Content-Type": "application/json", ...options.headers },
    });

    const text = await response.text();
    let data: any = undefined;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!response.ok) {
      return { success: false, error: data?.message || `HTTP error! status: ${response.status}` };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

/** -------- API functions aligned with backend -------- */
export const loginUser = (request: LoginRequest) =>
  authRequest("/users/login", { method: "POST", body: JSON.stringify(request) });

export const signupUser = (request: SignupRequest) =>
  authRequest("/users/signup", { method: "POST", body: JSON.stringify({ ...request, confirmPassword: request.password }) });

export const logoutUser = () =>
  authRequest("/users/logout", { method: "POST" });

export const getCurrentUser = () =>
  authRequest("/users/me");

// Optional endpoints (if you implement them in backend)
export const updateUserProfile = (request: Partial<{ name: string; email: string }>) =>
  authRequest("/auth/profile", { method: "PATCH", body: JSON.stringify(request) });

export const changePassword = (request: { currentPassword: string; newPassword: string }) =>
  authRequest("/auth/change-password", { method: "POST", body: JSON.stringify(request) });

export const requestPasswordReset = (request: { email: string }) =>
  authRequest("/auth/reset-password", { method: "POST", body: JSON.stringify(request) });

export const verifyEmail = (tokenParam: string) =>
  authRequest("/auth/verify-email", { method: "POST", body: JSON.stringify({ token: tokenParam }) });
