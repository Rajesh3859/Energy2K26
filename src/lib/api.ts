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

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const token = await user.getIdToken();

  let formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const baseUrl = API_URL.replace(/\/$/, "");
  if ((baseUrl.endsWith("/api/v1") || baseUrl.endsWith("/api")) && formattedEndpoint.startsWith("/api/")) {
    formattedEndpoint = formattedEndpoint.substring(4); // Remove leading '/api'
  }

  const response = await fetch(`${baseUrl}${formattedEndpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

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