import { http } from "@/lib/http";
import type { APIResponse } from "@/types/api";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

export async function register(payload: RegisterRequest): Promise<User> {
  const res = await http.post<APIResponse<User>>("/api/user/register", payload);
  return res.data.data;
}

export async function login(payload: LoginRequest): Promise<User> {
  const res = await http.post<APIResponse<User>>("/api/user/login", payload);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await http.post("/api/user/logout");
}

export async function getMe(): Promise<User> {
  const res = await http.get<APIResponse<User>>("/api/user/self");
  return res.data.data;
}


export async function refreshToken():Promise<void>{
  await http.post("/api/user/refresh");

}