import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function getAuthenticatedUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;

  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
    if (auth.currentUser) return auth.currentUser;
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const user = await getAuthenticatedUser();
  const token = user ? await user.getIdToken().catch(() => null) : null;

  let formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = API_URL.replace(/\/$/, "");

  if ((baseUrl.endsWith("/api/v1") || baseUrl.endsWith("/api")) && formattedEndpoint.startsWith("/api/")) {
    formattedEndpoint = formattedEndpoint.substring(4); // Remove leading '/api'
  }

  const makeFetch = async (targetBaseUrl: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${targetBaseUrl}${formattedEndpoint}`, {
      ...options,
      headers,
    });
  };

  let response: Response;

  try {
    response = await makeFetch(baseUrl);
  } catch (err: any) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      const isLocalhost = typeof window !== "undefined" && (window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1"));

      // Automatic fallback to local backend when developing locally
      if (isLocalhost && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")) {
        try {
          response = await makeFetch("http://localhost:5000/api/v1");
        } catch (localErr) {
          throw new Error(`Failed to connect to deployed backend (${baseUrl}) and local dev backend (http://localhost:5000/api/v1).`);
        }
      } else if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
        const isProductionHost = typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");
        if (isProductionHost) {
          throw new Error("Backend server connection offline. On Netlify, please add environment variable NEXT_PUBLIC_API_URL pointing to your deployed Vercel backend API URL (e.g. https://your-app.vercel.app/api/v1).");
        }

        const fallbackBaseUrl = baseUrl.replace("localhost", "127.0.0.1");
        try {
          response = await makeFetch(fallbackBaseUrl);
        } catch (fallbackErr) {
          throw new Error("Backend server connection offline. Please verify the Express backend is running at http://127.0.0.1:5000.");
        }
      } else {
        throw new Error(`Failed to connect to backend server at ${baseUrl}. Please check your deployed Vercel backend service.`);
      }
    } else {
      throw err;
    }
  }

  const contentType = response.headers.get("content-type");
  let data: any;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }
    data = text;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Server returned ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new Error(`404 Not Found: ${errorMsg}`);
    }
    throw new Error(errorMsg);
  }

  return data;
}

export async function updateSportState(matchId: string, action: Record<string, any>) {
  return apiRequest(`/live-matches/${matchId}/state`, {
    method: "POST",
    body: JSON.stringify(action),
  });
}

export async function finalizeMatch(matchId: string) {
  return apiRequest(`/live-matches/${matchId}/complete`, {
    method: "POST",
  });
}