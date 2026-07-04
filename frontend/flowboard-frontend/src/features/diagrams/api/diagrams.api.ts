import { http } from "@/lib/http";
import type { APIResponse } from "@/types/api";
import type { CanvasResponse, CreateDiagramRequest, Diagram, DiagramVersion, SaveCanvasRequest, SaveCanvasResponse } from "@/types/diagram";
import { SharedDiagram } from "../types/diagram.types";

export async function createDiagram(projectID: number, payload: CreateDiagramRequest): Promise<Diagram> {
  const res = await http.post<APIResponse<Diagram>>(`/api/projects/${projectID}/diagrams`, payload);
  return res.data.data;
}

export async function listProjectDiagrams(projectID: number): Promise<Diagram[]> {
  const res = await http.get<APIResponse<Diagram[]>>(`/api/projects/${projectID}/diagrams`);
  return res.data.data;
}

export async function getCanvas(diagramID: number): Promise<CanvasResponse> {
  const res = await http.get<APIResponse<CanvasResponse>>(`/api/diagrams/${diagramID}/canvas`);
  return res.data.data;
}

export async function saveCanvas(diagramID: number, payload: SaveCanvasRequest): Promise<SaveCanvasResponse> {
  const res = await http.put<APIResponse<SaveCanvasResponse>>(`/api/diagrams/${diagramID}/save`, payload);
  return res.data.data;
}

export async function listVersions(diagramID: number): Promise<DiagramVersion[]> {
  const res = await http.get<APIResponse<DiagramVersion[]>>(`/api/diagrams/${diagramID}/versions`);
  return res.data.data;
}

export async function restoreVersion(diagramID: number, versionID: number): Promise<SaveCanvasResponse> {
  const res = await http.post<APIResponse<SaveCanvasResponse>>(`/api/diagrams/${diagramID}/versions/${versionID}/restore`);
  return res.data.data;
}



export async function getSharedWithMeApi(): Promise<SharedDiagram[]> {
  const res = await http.get("/api/diagrams/shared-with-me");
  return res.data.data;
}