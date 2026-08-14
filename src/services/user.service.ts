import { apiRequest } from "@/lib/api";
import { User } from "@/types/auth";

export interface CreateUserData {
  email: string;
  password?: string;
  role: "admin" | "scorer" | "viewer";
  displayName?: string;
  name?: string;
}

export async function getUsers(): Promise<{ success?: boolean; data: User[] }> {
  return apiRequest("/users");
}

export async function getUser(uid: string): Promise<{ success?: boolean; data: User }> {
  return apiRequest(`/users/${uid}`);
}

export async function createUser(data: CreateUserData): Promise<{ success?: boolean; data: User }> {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify({
      name: data.displayName || data.name || "User",
      displayName: data.displayName || data.name || "User",
      email: data.email,
      password: data.password || "Password123!",
      role: data.role === "viewer" ? "scorer" : data.role,
    }),
  });
}

export async function updateUser(
  uid: string,
  data: Partial<CreateUserData>
): Promise<{ success?: boolean; data: User }> {
  return apiRequest(`/users/${uid}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(uid: string): Promise<{ success?: boolean; message?: string }> {
  return apiRequest(`/users/${uid}`, {
    method: "DELETE",
  });
}
