import { apiRequest } from "./api";

export async function getCurrentUserProfile() {
  return apiRequest("/api/auth/me");
}
