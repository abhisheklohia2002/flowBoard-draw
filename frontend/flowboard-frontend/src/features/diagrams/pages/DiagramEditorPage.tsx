import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Background,
  ConnectionMode,
  Controls,
  Handle,
  NodeResizer,
  Position,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { OnNodeDrag } from "@xyflow/react";
import { Clock, Palette, Save, Share2, Trash2, Workflow } from "lucide-react";
  import type {
  RealtimeMessage,
  NodeAddedPayload,
  NodeUpdatedPayload,
  NodeDeletedPayload,
  EdgeAddedPayload,
  EdgeDeletedPayload,
} from "@/features/realtime/types";
import { DiagramVersionsPanel } from "../components/DiagramVersionsPanel";
import { useCanvas, useSaveCanvas } from "../hooks/useDiagrams";
import { useCanvasStore } from "@/features/canvas/store/canvasStore";
import { Button } from "@/components/ui/button";

import type { ShapeDefinition } from "@/features/canvas/config/shapes";
import { ShapePalette } from "@/features/canvas/components/ShapePalette";
import { NODE_COLORS, NodeColor } from "@/features/canvas/config/colors";
import { CollaborateDialog } from "@/features/collaboration/components/CollaborateDialog";
import { useDiagramRealtime } from "@/features/realtime/hook/useDiagramRealtime";

type ShapeNodeData = {
  label: string;
  shapeType: string;
  bg: string;
  border: string;
  text: string;
};

function getHandleLayout(shapeType: string) {
  const base = { transform: "translate(-50%, -50%)" };

  if (shapeType === "triangle") {
    return [
      {
        id: "top",
        position: Position.Top,
        style: { ...base, left: "50%", top: "6%" },
      },
      {
        id: "right",
        position: Position.Right,
        style: { ...base, left: "78%", top: "68%" },
      },
      {
        id: "bottom",
        position: Position.Bottom,
        style: { ...base, left: "50%", top: "96%" },
      },
      {
        id: "left",
        position: Position.Left,
        style: { ...base, left: "22%", top: "68%" },
      },
    ];
  }

  if (shapeType === "diamond") {
    return [
      {
        id: "top",
        position: Position.Top,
        style: { ...base, left: "50%", top: "8%" },
      },
      {
        id: "right",
        position: Position.Right,
        style: { ...base, left: "92%", top: "50%" },
      },
      {
        id: "bottom",
        position: Position.Bottom,
        style: { ...base, left: "50%", top: "92%" },
      },
      {
        id: "left",
        position: Position.Left,
        style: { ...base, left: "8%", top: "50%" },
      },
    ];
  }

  return [
    {
      id: "top",
      position: Position.Top,
      style: { ...base, left: "50%", top: "0%" },
    },
    {
      id: "right",
      position: Position.Right,
      style: { ...base, left: "100%", top: "50%" },
    },
    {
      id: "bottom",
      position: Position.Bottom,
      style: { ...base, left: "50%", top: "100%" },
    },
    {
      id: "left",
      position: Position.Left,
      style: { ...base, left: "0%", top: "50%" },
    },
  ];
}

function ShapeNode({ data, selected }: NodeProps<Node<ShapeNodeData>>) {
  const shapeType = data.shapeType;

  const nodeBorderColor = data.border || "#22d3ee";

  const handleClassName = "!h-1 !w-1  !bg-slate-950 !opacity-80";
  const isDiamond = shapeType === "diamond";

  const isCircle = shapeType === "circle";

  const isDatabase = shapeType === "database";

  const isRounded = shapeType === "rounded" || shapeType === "service";

  const isTriangle = shapeType === "triangle";

  const isApi = shapeType === "api";

  const isQueue = shapeType === "queue";

  const isProcess = shapeType === "process";
  const handles = getHandleLayout(shapeType);
  const showBoxResizer = ![""].includes(shapeType);

  return (
    <div className="relative h-full w-full">
      <NodeResizer
        isVisible={selected && showBoxResizer}
        minWidth={80}
        minHeight={50}
        handleClassName={handleClassName}
        lineClassName="!border"
        handleStyle={{ borderColor: nodeBorderColor }}
        lineStyle={{ borderColor: nodeBorderColor }}
      />

      {handles.map((handle) => (
        <Handle
          key={`target-${handle.id}`}
          id={`target-${handle.id}`}
          type="target"
          position={handle.position}
          className={handleClassName}
          style={{
            borderColor: nodeBorderColor,
          }}
        />
      ))}

      {handles.map((handle) => (
        <Handle
          key={`source-${handle.id}`}
          id={`source-${handle.id}`}
          type="source"
          position={handle.position}
          className="!h-2 !w-2 !border-1 !border-[#fff]-200 !bg-slate-350"
        />
      ))}

      {isDiamond ? (
        <div className="flex h-full w-full items-center justify-center p-4">
          <div
            className={[
              "flex h-full w-full rotate-45 items-center justify-center border shadow-lg transition",
              selected
                ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950"
                : "",
            ].join(" ")}
            style={{
              backgroundColor: data.bg,
              borderColor: data.border,
              color: data.text,
            }}
          >
            <div className="-rotate-45 px-2 text-center text-sm font-medium">
              {data.label}
            </div>
          </div>
        </div>
      ) : isTriangle ? (
        <div className="flex h-full w-full items-center justify-center">
          <svg
            viewBox="0 0 120 100"
            className={[
              "h-full w-full drop-shadow-lg transition",
              selected
                ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950"
                : "",
            ].join(" ")}
          >
            <polygon
              points="60,5 115,95 5,95"
              fill={data.bg}
              stroke={data.border}
              strokeWidth="3"
            />

            <foreignObject x="20" y="45" width="80" height="35">
              <div
                className="flex h-full w-full items-center justify-center text-center text-sm font-medium"
                style={{ color: data.text }}
              >
                {data.label}
              </div>
            </foreignObject>
          </svg>
        </div>
      ) : isQueue ? (
        <div
          className={[
            "flex h-full w-full items-center justify-center gap-0 px-4 shadow-lg transition",
            selected
              ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950"
              : "",
          ].join(" ")}
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className={[
                "flex h-[70%] flex-1 items-center justify-center border",
                item === 0 ? "rounded-l-xl" : "",
                item === 2 ? "rounded-r-xl" : "",
                item !== 0 ? "-ml-px" : "",
              ].join(" ")}
              style={{
                backgroundColor: data.bg,
                borderColor: data.border,
                color: data.text,
              }}
            >
              {item === 1 ? (
                <span className="text-center text-sm font-medium">
                  {data.label}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : isApi ? (
        <div
          className={[
            "flex h-full w-full items-center justify-center rounded-xl border px-3 text-center text-sm font-medium shadow-lg transition",
            selected
              ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950"
              : "",
          ].join(" ")}
          style={{
            backgroundColor: data.bg,
            borderColor: data.border,
            color: data.text,
          }}
        >
          {data.label}
        </div>
      ) : isProcess ? (
        <div
          className={[
            "flex h-full w-full items-center justify-center rounded-md border px-3 text-center text-sm font-medium shadow-lg transition",
            selected
              ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950"
              : "",
          ].join(" ")}
          style={{
            backgroundColor: data.bg,
            borderColor: data.border,
            color: data.text,
          }}
        >
          {data.label}
        </div>
      ) : (
        <div
          className={[
            "flex h-full w-full items-center justify-center border px-3 text-center text-sm font-medium shadow-lg transition",
            selected
              ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950"
              : "",
            isCircle ? "rounded-full" : "",
            isDatabase ? "rounded-[28px]" : "",
            isRounded ? "rounded-2xl" : "",
            !isCircle && !isDatabase && !isRounded ? "rounded-md" : "",
          ].join(" ")}
          style={{
            backgroundColor: data.bg,
            borderColor: data.border,
            color: data.text,
          }}
        >
          {data.label}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  shape: ShapeNode,
};

export function DiagramEditorPage() {
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [shapeBorderColor, setShapeBorderColor] = useState("#22d3ee");
  const [lineColor, setLineColor] = useState("#67e8f9");

  const diagramID = Number(useParams().diagramID);

  const canvasQuery = useCanvas(diagramID);
  const saveCanvas = useSaveCanvas(diagramID);

  const { isDirty, setDirty, setCurrentDiagramID, setSelectedElementID } =
    useCanvasStore();

  const [selectedColor, setSelectedColor] = useState<NodeColor>(NODE_COLORS[0]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);

  const [showVersions, setShowVersions] = useState(false);

  const [showBgPanel, setShowBgPanel] = useState(false);
  const [canvasBgColor, setCanvasBgColor] = useState("#020617");
  const [gridColor, setGridColor] = useState("#8b98a9");

  const title = useMemo(
    () => canvasQuery.data?.diagram.name ?? `Diagram #${diagramID}`,
    [canvasQuery.data, diagramID],
  );

   const handleRealtimeMessage = useCallback(
  (message: RealtimeMessage) => {
    switch (message.type) {
      case "node_added": {
        const payload = message.payload as NodeAddedPayload | undefined;
        if (!payload?.node) return;

        setNodes((current) => {
          const exists = current.some((node) => node.id === payload.node.id);
          if (exists) return current;
          return [...current, payload.node];
        });

        break;
      }

      case "node_updated": {
        const payload = message.payload as NodeUpdatedPayload | undefined;
        if (!payload?.node_id) return;

        setNodes((current) =>
          current.map((node) => {
            if (node.id !== payload.node_id) {
              return node;
            }

            return {
              ...node,
              position: payload.position ?? node.position,
              data: payload.data ? { ...node.data, ...payload.data } : node.data,
              style: payload.style ? { ...node.style, ...payload.style } : node.style,
            };
          })
        );

        break;
      }

      case "node_deleted": {
        const payload = message.payload as NodeDeletedPayload | undefined;
        if (!payload?.node_id) return;

        setNodes((current) =>
          current.filter((node) => node.id !== payload.node_id)
        );

        setEdges((current) =>
          current.filter(
            (edge) =>
              edge.source !== payload.node_id &&
              edge.target !== payload.node_id
          )
        );

        break;
      }

      case "edge_added": {
        const payload = message.payload as EdgeAddedPayload | undefined;
        if (!payload?.edge) return;

        setEdges((current) => {
          const exists = current.some((edge) => edge.id === payload.edge.id);
          if (exists) return current;
          return [...current, payload.edge];
        });

        break;
      }

      case "edge_deleted": {
        const payload = message.payload as EdgeDeletedPayload | undefined;
        if (!payload?.edge_id) return;

        setEdges((current) =>
          current.filter((edge) => edge.id !== payload.edge_id)
        );

        break;
      }

      case "user_joined": {
        console.log(`${message.user_name || "User"} joined`);
        break;
      }

      case "user_left": {
        console.log(`${message.user_name || "User"} left`);
        break;
      }

      default:
        break;
    }
  },
  []
);
  const { isConnected, sendMessage } = useDiagramRealtime({
  diagramID,
  enabled: Boolean(diagramID),
  onMessage: handleRealtimeMessage,
});

  const createShapeNode = useCallback(
    (shape: ShapeDefinition, index: number): Node => {
      let width = 150;
      let height = 70;

      if (shape.type === "circle") {
        width = 110;
        height = 110;
      }

      if (shape.type === "diamond") {
        width = 130;
        height = 130;
      }

      if (shape.type === "database") {
        width = 160;
        height = 75;
      }
      if (shape.type === "triangle") {
        width = 130;
        height = 110;
      }

      if (shape.type === "queue") {
        width = 180;
        height = 80;
      }

      if (shape.type === "api") {
        width = 160;
        height = 75;
      }

      if (shape.type === "process") {
        width = 160;
        height = 75;
      }

      return {
        id: `${shape.type}_${Date.now()}`,
        type: "shape",
        position: {
          x: 220 + index * 40,
          y: 160 + index * 30,
        },
        style: {
          width,
          height,
        },
        data: {
          label: shape.label,
          shapeType: shape.type,
          bg: selectedColor.bg,
          border: shapeBorderColor,
          text: selectedColor.text,
        },
      };
    },
    [selectedColor, shapeBorderColor],
  );
 const onNodeDragStop: OnNodeDrag = useCallback(
  (_, node) => {
    sendMessage({
      type: "node_updated",
      user_id: 0,
      payload: {
        node_id: node.id,
        position: node.position,
      },
    });
  },
  [sendMessage]
);
  const addShape = useCallback(
  (shape: ShapeDefinition) => {
    setNodes((current) => {
      const newNode = createShapeNode(shape, current.length);

      sendMessage({
        type: "node_added",
        user_id: 0,
        payload: {
          node: newNode,
        },
      });

      return [...current, newNode];
    });

    setDirty(true);
  },
  [createShapeNode, sendMessage, setDirty]
);

 

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((current) => applyNodeChanges(changes, current));
      setDirty(true);
    },
    [setDirty],
  );

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      setEdges((current) => {
        const updatedEdges = applyEdgeChanges(changes, current);

        return updatedEdges.map((edge) => {
          const stroke =
            typeof edge.style?.stroke === "string"
              ? edge.style.stroke
              : lineColor;

          return {
            ...edge,
            animated: edge.selected,
            style: {
              ...edge.style,
              stroke,
              strokeWidth: edge.selected ? 4 : 2,
              filter: edge.selected
                ? `drop-shadow(0 0 6px ${stroke})`
                : undefined,
            },
          };
        });
      });

      setDirty(true);
    },
    [setDirty, lineColor],
  );

 const onConnect = useCallback(
  (connection: Connection) => {
    const newEdge: Edge = {
      ...connection,
      id: `edge_${Date.now()}`,
      type: "smoothstep",
      animated: false,
      source: connection.source!,
      target: connection.target!,
    };

    setEdges((current) => addEdge(newEdge, current));

    sendMessage({
      type: "edge_added",
      user_id: 0,
      payload: {
        edge: newEdge,
      },
    });

    setDirty(true);
  },
  [sendMessage, setDirty]
);


  const handleColorChange = useCallback(
  (color: NodeColor) => {
    setSelectedColor(color);

    const selectedNodeIDs = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    if (selectedNodeIDs.length === 0) {
      return;
    }

    const style = {
      background: color.bg,
      backgroundColor: color.bg,
      border: `1px solid ${color.border}`,
      color: color.text,
    };

    setNodes((current) =>
      current.map((node) => {
        if (!selectedNodeIDs.includes(node.id)) {
          return node;
        }

        return {
          ...node,
          style: {
            ...node.style,
            ...style,
          },
        };
      })
    );

    selectedNodeIDs.forEach((nodeID) => {
      sendMessage({
        type: "node_updated",
        user_id: 0,
        payload: {
          node_id: nodeID,
          style,
        },
      });
    });

    setDirty(true);
  },
  [nodes, sendMessage, setDirty]
);

  const handleLineColorChange = useCallback(
    (color: string) => {
      setLineColor(color);

      const selectedEdgeIDs = edges
        .filter((edge) => edge.selected)
        .map((edge) => edge.id);

      if (selectedEdgeIDs.length === 0) {
        return;
      }

      setEdges((current) =>
        current.map((edge) => {
          if (!selectedEdgeIDs.includes(edge.id)) {
            return edge;
          }

          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: color,
              strokeWidth: 2,
            },
          };
        }),
      );

      setDirty(true);
    },
    [edges, setDirty],
  );

  const handleShapeBorderColorChange = useCallback(
    (color: string) => {
      setShapeBorderColor(color);

      const selectedNodeIDs = nodes
        .filter((node) => node.selected)
        .map((node) => node.id);

      if (selectedNodeIDs.length === 0) {
        return;
      }

      setNodes((current) =>
        current.map((node) => {
          if (!selectedNodeIDs.includes(node.id)) {
            return node;
          }

          return {
            ...node,
            data: {
              ...node.data,
              border: color,
            },
          };
        }),
      );

      setDirty(true);
    },
    [nodes, setDirty],
  );
  const handleSave = useCallback(() => {
    const viewport = flow?.getViewport() ??
      canvasQuery.data?.viewport ?? {
        x: 0,
        y: 0,
        zoom: 1,
      };

    saveCanvas.mutate(
      {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type ?? "shape",
          position: node.position,
          width: node.width,
          height: node.height,
          data: node.data as Record<string, unknown>,
          style: node.style as Record<string, unknown>,
        })),

        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? undefined,
          targetHandle: edge.targetHandle ?? undefined,
          type: edge.type ?? "smoothstep",
          label: typeof edge.label === "string" ? edge.label : undefined,
          data: edge.data as Record<string, unknown>,
          style: edge.style as Record<string, unknown>,
        })),

        viewport,
        change_note: "Saved from editor",
      },
      {
        onSuccess: () => setDirty(false),
      },
    );
  }, [canvasQuery.data?.viewport, edges, flow, nodes, saveCanvas, setDirty]);
 

  const deleteSelected = useCallback(() => {
  const selectedNodeIDs = nodes
    .filter((node) => node.selected)
    .map((node) => node.id);

  const selectedEdgeIDs = edges
    .filter((edge) => edge.selected)
    .map((edge) => edge.id);

  setNodes((current) =>
    current.filter((node) => !selectedNodeIDs.includes(node.id))
  );

  setEdges((current) =>
    current.filter(
      (edge) =>
        !selectedEdgeIDs.includes(edge.id) &&
        !selectedNodeIDs.includes(edge.source) &&
        !selectedNodeIDs.includes(edge.target)
    )
  );

  selectedNodeIDs.forEach((nodeID) => {
    sendMessage({
      type: "node_deleted",
      user_id: 0,
      payload: {
        node_id: nodeID,
      },
    });
  });

  selectedEdgeIDs.forEach((edgeID) => {
    sendMessage({
      type: "edge_deleted",
      user_id: 0,
      payload: {
        edge_id: edgeID,
      },
    });
  });

  setDirty(true);
}, [edges, nodes, sendMessage, setDirty]);


  useEffect(() => {
    setCurrentDiagramID(diagramID);
  }, [diagramID, setCurrentDiagramID]);

  useEffect(() => {
    if (!canvasQuery.data) return;

    setNodes(
      canvasQuery.data.nodes.map((node) => {
        const nodeData = node.data as Record<string, unknown> | undefined;
        const nodeStyle = node.style as React.CSSProperties | undefined;

        return {
          id: node.id,
          type: "shape",
          position: node.position,
          width: node.width,
          height: node.height,
          style: node.style,
          data: {
            label: String(nodeData?.label ?? node.id),
            shapeType: String(nodeData?.shapeType ?? "rectangle"),

            bg: String(
              nodeData?.bg ??
                nodeStyle?.backgroundColor ??
                nodeStyle?.background ??
                "#0f172a",
            ),
            border: String(
              nodeData?.border ??
                String(nodeStyle?.border ?? "#22d3ee").replace(
                  "1px solid ",
                  "",
                ),
            ),
            text: String(nodeData?.text ?? nodeStyle?.color ?? "#ffffff"),
          },
        };
      }),
    );

    setEdges(
      canvasQuery.data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type ?? "smoothstep",
        label: edge.label,
        data: edge.data,
        style: edge.style ?? {
          stroke: "#67e8f9",
          strokeWidth: 2,
        },
      })),
    );

    setDirty(false);
  }, [canvasQuery.data, setDirty]);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;

      return (
        element?.tagName === "INPUT" ||
        element?.tagName === "TEXTAREA" ||
        element?.isContentEditable
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (event.ctrlKey || event.metaKey) {
        if (key === "+" || key === "=") {
          event.preventDefault();
          flow?.zoomIn({ duration: 150 });
          return;
        }

        if (key === "-") {
          event.preventDefault();
          flow?.zoomOut({ duration: 150 });
          return;
        }
      }

      if (key === "delete" || key === "backspace") {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flow, deleteSelected]);

  if (canvasQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading canvas...
      </div>
    );
  }

  if (canvasQuery.isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-destructive">
        Failed to load canvas. Check backend and cookie auth.
      </div>
    );
  }
  

  return (
    <>
      <div className="-m-4 h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 md:-m-6">
        <div className="relative h-full w-full">
          <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                <Workflow className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white">
                  {title}
                </h1>

                <p className="text-xs text-slate-400">
                  {nodes.length} nodes · {edges.length} edges
                  {isDirty ? " · Unsaved changes" : " · Saved"}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs text-slate-300">
  <span
    className={[
      "h-2 w-2 rounded-full",
      isConnected ? "bg-emerald-400" : "bg-red-400",
    ].join(" ")}
  />
  {isConnected ? "Live" : "Offline"}
</div>
            </div>

            <div className="relative flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                onClick={() => setShowVersions(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Versions
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowBgPanel((current) => !current);
                }}
              >
                <Palette className="mr-2 h-4 w-4" />
                Background
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                onClick={() => setShowCollaborators(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Collaborate
              </Button>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2">
                <span className="text-xs text-slate-300">Border</span>

                <input
                  type="color"
                  value={shapeBorderColor}
                  onChange={(event) =>
                    handleShapeBorderColorChange(event.target.value)
                  }
                  className="h-6 w-7 cursor-pointer rounded border border-white/10 bg-transparent"
                  title="Shape border color"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2">
                <span className="text-xs text-slate-300">Line</span>

                <input
                  type="color"
                  value={lineColor}
                  onChange={(event) =>
                    handleLineColorChange(event.target.value)
                  }
                  className="h-6 w-7 cursor-pointer rounded border border-white/10 bg-transparent"
                  title="Connection line color"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                onClick={deleteSelected}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || saveCanvas.isPending}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveCanvas.isPending ? "Saving..." : "Save"}
              </Button>

              {showBgPanel && (
                <div
                  className="absolute right-0 top-14 z-40 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-white">
                      Canvas Background
                    </h2>
                    <p className="text-xs text-slate-400">
                      Change canvas and grid color.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-300">
                        Canvas color
                      </label>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={canvasBgColor}
                          onChange={(event) => {
                            setCanvasBgColor(event.target.value);
                            setDirty(true);
                          }}
                          className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                        />

                        <input
                          value={canvasBgColor}
                          onChange={(event) => {
                            setCanvasBgColor(event.target.value);
                            setDirty(true);
                          }}
                          className="h-10 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
                          placeholder="#020617"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-300">
                        Grid color
                      </label>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={gridColor}
                          onChange={(event) => {
                            setGridColor(event.target.value);
                            setDirty(true);
                          }}
                          className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                        />

                        <input
                          value={gridColor}
                          onChange={(event) => {
                            setGridColor(event.target.value);
                            setDirty(true);
                          }}
                          className="h-10 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
                          placeholder="#8b98a9"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                        onClick={() => {
                          setCanvasBgColor("#020617");
                          setGridColor("#8b98a9");
                          setDirty(true);
                        }}
                      >
                        Reset
                      </Button>

                      <Button
                        size="sm"
                        className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        onClick={() => setShowBgPanel(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ShapePalette
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
            onAddShape={addShape}
          />

          <ReactFlow
            onNodeDragStop={onNodeDragStop}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setFlow}
            onPaneClick={() => {
              setSelectedElementID(null);
              setShowBgPanel(false);

              setEdges((current) =>
                current.map((edge) => {
                  const stroke =
                    typeof edge.style?.stroke === "string"
                      ? edge.style.stroke
                      : lineColor;

                  return {
                    ...edge,
                    selected: false,
                    animated: false,
                    style: {
                      ...edge.style,
                      stroke,
                      strokeWidth: 2,
                      filter: undefined,
                    },
                  };
                }),
              );
            }}
            onNodeClick={(_, node) => {
              setSelectedElementID(node.id);
              setShowBgPanel(false);

              const data = node.data as Record<string, string>;

              if (data.bg && data.border && data.text) {
                setSelectedColor({
                  name: "Custom",
                  bg: data.bg,
                  border: data.border,
                  text: data.text,
                });

                setShapeBorderColor(data.border);
              }
            }}
            onEdgeClick={(_, edge) => {
              setSelectedElementID(edge.id);
              setShowBgPanel(false);

              const stroke = edge.style?.stroke;

              if (typeof stroke === "string") {
                setLineColor(stroke);
              }
            }}
            fitView
            className="h-full w-full"
            style={{
              backgroundColor: canvasBgColor,
            }}
            
          >
            <Background color={gridColor} gap={24} />

            <Controls
              position="top-right"
              className="!border-white/10 !bg-slate-900/90 !shadow-xl"
              style={{
                top: 96,
                right: 16,
                color: "slategrey",
                backgroundColor: "ButtonShadow",
              }}
            />
          </ReactFlow>

          {showVersions && (
            <div className="absolute bottom-4 right-4 top-24 z-30 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Version History
                  </h2>

                  <p className="text-xs text-slate-400">
                    Restore previous canvas state
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setShowVersions(false)}
                >
                  Hide
                </Button>
              </div>

              <div className="h-[calc(100%-65px)] overflow-y-auto p-3">
                <DiagramVersionsPanel diagramID={diagramID} />
              </div>
            </div>
          )}
        </div>
      </div>
      <CollaborateDialog
        open={showCollaborators}
        onOpenChange={setShowCollaborators}
        diagramID={diagramID}
      />
    </>
  );
}
