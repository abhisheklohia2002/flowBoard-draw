export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}
