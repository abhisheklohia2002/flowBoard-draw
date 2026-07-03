export interface Diagram {
  id: number;
  project_id: number;
  name: string;
  canvas_background?: string;
  zoom_level?: number;
  pan_x?: number;
  pan_y?: number;
}

export interface CreateDiagramRequest {
  name: string;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasNode {
  id: string;
  type: string;
  position: CanvasPosition;
  width?: number;
  height?: number;
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  label?: string;
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export interface CanvasResponse {
  diagram: {
    id: number;
    project_id: number;
    name: string;
  };
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: CanvasViewport;
}

export interface SaveCanvasRequest {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: CanvasViewport;
  change_note?: string;
}

export interface SaveCanvasResponse {
  diagram_id: number;
  node_count: number;
  edge_count: number;
  version_number: number;
}

export interface DiagramVersion {
  id: number;
  diagram_id: number;
  version_number: number;
  change_note: string;
  created_at: string;
}
