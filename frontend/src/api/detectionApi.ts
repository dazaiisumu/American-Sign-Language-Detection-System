export interface DetectionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/** --------- Session APIs --------- */
export interface SessionHistoryItem {
  id: number;
  startTime: string;
  duration: number;
  totalPredictions: number;
  averageConfidence: number;
  letters?: string[];
}

export interface SessionHistoryResponse {
  sessions: SessionHistoryItem[];
  totalPages: number;
  currentPage: number;
  totalSessions: number;
}

/** --------- Dashboard APIs --------- */
export interface TotalUsersResponse {
  totalUsers: number;
}

export interface ActiveUsersResponse {
  activeUsers: number;
}

/** --------- Detection Session APIs --------- */
export interface StartSessionResponse {
  sessionId: number;
  status: "active";
  startTime: string;
}

export interface LatestPredictionResponse {
  prediction: string | null;
  confidence?: number;
}

export interface EndSessionResponse {
  sessionId: number;
  status: string;
  duration?: number;
  totalPredictions?: number;
  averageConfidence?: number;
  uniqueSigns?: number;
}

/** --------- API Base URL --------- */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/** --------- Generic API request handler --------- */
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<DetectionApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Unexpected non-JSON response" };
    }

    if (!response.ok) {
      throw new Error(data?.error || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
};

/** --------- Exported API functions --------- */

// Detection session APIs
export const startDetectionSession = () =>
  apiRequest<StartSessionResponse>(`/detection/start`, { method: "POST" });

export const endDetectionSession = () =>
  apiRequest<EndSessionResponse>(`/detection/stop`, { method: "POST" });

export const getLatestPrediction = () =>
  apiRequest<LatestPredictionResponse>(`/detection/result`);

export const getSessionHistory = (page: number, limit: number) =>
  apiRequest<SessionHistoryResponse>(
    `/detection/sessions?page=${page}&limit=${limit}`
  );

// Dashboard / Stats APIs
export const getTotalUsers = () =>
  apiRequest<TotalUsersResponse>(`/dashboard/users/total`);

export const getActiveUsers = () =>
  apiRequest<ActiveUsersResponse>(`/dashboard/users/active`);
