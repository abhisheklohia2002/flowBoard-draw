

export interface RealtimeMessage<TPayload = unknown> {
  type: RealtimeEventType;
  diagram_id: number;
  user_id: number;
  user_name?: string;
  payload?: TPayload;
}

export interface NodeUpdatedPayload {
  node_id: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
  width?: number;
  height?: number;
  measured?: {
    width?: number;
    height?: number;
  };
}

export interface NodeAddedPayload {
  node: any;
}

export interface NodeDeletedPayload {
  node_id: string;
}

export interface EdgeAddedPayload {
  edge: any;
}

export interface EdgeDeletedPayload {
  edge_id: string;
}

export interface CursorMovedPayload {
  x: number;
  y: number;
}


  export interface ElementActivityPayload {
  element_id: string;
  element_type: "node" | "edge";
  action: "selected" | "moving" | "editing" | "color_changed" | "deleted";
}





export type RealtimeEventType =
  | "user_joined"
  | "user_left"
  | "cursor_moved"
  | "node_added"
  | "node_updated"
  | "node_deleted"
  | "edge_added"
  | "edge_updated"
  | "edge_deleted"
  | "canvas_saved"
  | "element_activity";

export interface NodeUpdatedPayload {
  node_id: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
  width?: number;
  height?: number;
  measured?: {
    width?: number;
    height?: number;
  };
}

export interface EdgeUpdatedPayload {
  edge_id: string;
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
  animated?: boolean;
}