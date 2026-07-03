export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}
