import { http } from "@/lib/http";


export type CollaboratorRole = "editor" | "viewer";

export interface SearchUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface DiagramCollaborator {
  id: number;
  diagram_id: number;
  user_id: number;
  role: CollaboratorRole;
  user: SearchUser;
}

export async function searchUsersApi(query: string): Promise<SearchUser[]> {
  const res = await http.get("/api/users/search", {
    params: { query },
  });

  return res.data.data;
}

export async function getCollaboratorsApi(
  diagramID: number
): Promise<DiagramCollaborator[]> {
  const res = await http.get(`/api/diagrams/${diagramID}/collaborators`);
  return res.data.data;
}

export async function addCollaboratorApi(payload: {
  diagramID: number;
  userID: number;
  role: CollaboratorRole;
}) {
  const res = await http.post(
    `/api/diagrams/${payload.diagramID}/collaborators`,
    {
      user_id: payload.userID,
      role: payload.role,
    }
  );

  return res.data;
}

export async function removeCollaboratorApi(payload: {
  diagramID: number;
  userID: number;
}) {
  const res = await http.delete(
    `/api/diagrams/${payload.diagramID}/collaborators/${payload.userID}`
  );

  return res.data;
}

export async function updateCollaboratorRoleApi(payload: {
  diagramID: number;
  userID: number;
  role: CollaboratorRole;
}) {
  const res = await http.patch(
    `/api/diagrams/${payload.diagramID}/collaborators/${payload.userID}/role`,
    {
      role: payload.role,
    }
  );

  return res.data;
}