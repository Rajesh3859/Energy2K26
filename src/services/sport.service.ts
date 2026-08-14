import { apiRequest } from "@/lib/api";

export interface Sport {
  id: string;
  name: string;
  code?: string;
  category?: string;
  rules?: string;
  createdAt?: string;
}

export interface CreateSportData {
  name: string;
  code?: string;
  category?: string;
  rules?: string;
}

export async function getSports(): Promise<{ success?: boolean; data: Sport[] }> {
  return apiRequest("/sports");
}

export async function getSport(id: string): Promise<{ success?: boolean; data: Sport }> {
  return apiRequest(`/sports/${id}`);
}

export async function createSport(data: CreateSportData): Promise<{ success?: boolean; data: Sport }> {
  return apiRequest("/sports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSport(
  id: string,
  data: Partial<CreateSportData>
): Promise<{ success?: boolean; data: Sport }> {
  return apiRequest(`/sports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSport(id: string): Promise<{ success?: boolean; message?: string }> {
  return apiRequest(`/sports/${id}`, {
    method: "DELETE",
  });
}
