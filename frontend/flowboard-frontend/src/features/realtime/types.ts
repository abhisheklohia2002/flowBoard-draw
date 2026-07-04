export type RealtimeEventType =
  | "user_joined"
  | "user_left"
  | "cursor_moved"
  | "node_added"
  | "node_updated"
  | "node_deleted"
  | "edge_added"
  | "edge_deleted"
  | "canvas_saved";

export interface RealtimeMessage<TPayload = unknown> {
  type: RealtimeEventType;
  diagram_id: number;
  user_id: number;
  user_name?: string;
  payload?: TPayload;
}

export interface NodeUpdatedPayload {
  node_id: string;
  position?: {
    x: number;
    y: number;
  };
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
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