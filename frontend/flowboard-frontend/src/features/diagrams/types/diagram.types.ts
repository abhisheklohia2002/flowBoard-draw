export interface SharedDiagram {
  id: number;
  project_id: number;
  project_name: string;
  name: string;

  owner_id: number;
  owner_name: string;
  owner_email: string;

  collaborator_role: "editor" | "viewer";

  created_at: string;
  updated_at: string;
}