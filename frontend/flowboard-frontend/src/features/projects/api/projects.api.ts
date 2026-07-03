import { http } from "@/lib/http";
import type { APIResponse } from "@/types/api";
import type { CreateProjectRequest, Project } from "@/types/project";

export async function listProjects(): Promise<Project[]> {
  const res = await http.get<APIResponse<Project[]>>("/api/projects");
  return res.data.data;
}

export async function createProject(payload: CreateProjectRequest): Promise<Project> {
  const res = await http.post<APIResponse<Project>>("/api/projects", payload);
  return res.data.data;
}
