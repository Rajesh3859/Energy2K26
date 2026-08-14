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
    if (err instanceof TypeError && err.message === "Failed to fetch" && baseUrl.includes("localhost")) {
      const fallbackBaseUrl = baseUrl.replace("localhost", "127.0.0.1");
      try {
        response = await makeFetch(fallbackBaseUrl);
      } catch (fallbackErr) {
        throw new Error("Backend server connection offline. Please verify the Express backend is running at http://127.0.0.1:5000.");
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
    throw new Error(data?.message || "API request failed");
  }

  return data;
}