import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  Clock,
  Palette,
  Save,
  Trash2,
  Workflow,
} from "lucide-react";

import { DiagramVersionsPanel } from "../components/DiagramVersionsPanel";
import { useCanvas, useSaveCanvas } from "../hooks/useDiagrams";
import { useCanvasStore } from "@/features/canvas/store/canvasStore";
import { Button } from "@/components/ui/button";

import type { ShapeDefinition } from "@/features/canvas/config/shapes";
import { ShapePalette } from "@/features/canvas/components/ShapePalette";
import { NODE_COLORS, NodeColor } from "@/features/canvas/config/colors";

export function DiagramEditorPage() {
  const diagramID = Number(useParams().diagramID);

  const canvasQuery = useCanvas(diagramID);
  const saveCanvas = useSaveCanvas(diagramID);

  const { isDirty, setDirty, setCurrentDiagramID, setSelectedElementID } =
    useCanvasStore();

  const [selectedColor, setSelectedColor] = useState<NodeColor>(
    NODE_COLORS[0],
  );

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

  const createShapeNode = useCallback(
    (shape: ShapeDefinition, index: number): Node => {
      const baseStyle: React.CSSProperties = {
        padding: 12,
        border: `1px solid ${selectedColor.border}`,
        background: selectedColor.bg,
        backgroundColor: selectedColor.bg,
        color: selectedColor.text,
        minWidth: 140,
        minHeight: 60,
      };

      if (shape.type === "circle") {
        baseStyle.borderRadius = "9999px";
        baseStyle.width = 110;
        baseStyle.height = 110;
        baseStyle.display = "flex";
        baseStyle.alignItems = "center";
        baseStyle.justifyContent = "center";
      }

      if (shape.type === "database") {
        baseStyle.borderRadius = 28;
      }

      if (shape.type === "rounded" || shape.type === "service") {
        baseStyle.borderRadius = 14;
      }

      if (shape.type === "diamond") {
        baseStyle.transform = "rotate(45deg)";
        baseStyle.width = 120;
        baseStyle.height = 120;
        baseStyle.display = "flex";
        baseStyle.alignItems = "center";
        baseStyle.justifyContent = "center";
      }

      return {
        id: `${shape.type}_${Date.now()}`,
        type: "default",
        position: {
          x: 220 + index * 40,
          y: 160 + index * 30,
        },
        data: {
          label: shape.label,
          shapeType: shape.type,
        },
        style: baseStyle,
      };
    },
    [selectedColor],
  );

  const addShape = useCallback(
    (shape: ShapeDefinition) => {
      setNodes((current) => [
        ...current,
        createShapeNode(shape, current.length),
      ]);

      setDirty(true);
    },
    [createShapeNode, setDirty],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((current) => applyNodeChanges(changes, current));
      setDirty(true);
    },
    [setDirty],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((current) => applyEdgeChanges(changes, current));
      setDirty(true);
    },
    [setDirty],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `edge_${Date.now()}`,
            type: "smoothstep",
            animated: false,
          },
          current,
        ),
      );

      setDirty(true);
    },
    [setDirty],
  );

  const deleteSelected = useCallback(() => {
    const selectedNodeIDs = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    const selectedEdgeIDs = edges
      .filter((edge) => edge.selected)
      .map((edge) => edge.id);

    if (selectedNodeIDs.length === 0 && selectedEdgeIDs.length === 0) {
      return;
    }

    setNodes((current) =>
      current.filter((node) => !selectedNodeIDs.includes(node.id)),
    );

    setEdges((current) =>
      current.filter(
        (edge) =>
          !selectedEdgeIDs.includes(edge.id) &&
          !selectedNodeIDs.includes(edge.source) &&
          !selectedNodeIDs.includes(edge.target),
      ),
    );

    setSelectedElementID(null);
    setDirty(true);
  }, [nodes, edges, setDirty, setSelectedElementID]);

  const handleColorChange = useCallback(
    (color: NodeColor) => {
      setSelectedColor(color);

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
            style: {
              ...node.style,
              background: color.bg,
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
              color: color.text,
            },
          };
        }),
      );

      setDirty(true);
    },
    [nodes, setDirty],
  );

  const handleSave = useCallback(() => {
    const viewport =
      flow?.getViewport() ??
      canvasQuery.data?.viewport ?? {
        x: 0,
        y: 0,
        zoom: 1,
      };

    saveCanvas.mutate(
      {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type ?? "default",
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

  useEffect(() => {
    setCurrentDiagramID(diagramID);
  }, [diagramID, setCurrentDiagramID]);

  useEffect(() => {
    if (!canvasQuery.data) return;

    setNodes(
      canvasQuery.data.nodes.map((node) => ({
        id: node.id,
        type: "default",
        position: node.position,
        width: node.width,
        height: node.height,
        data: node.data ?? { label: node.id },
        style: node.style,
      })),
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
        style: edge.style,
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
    <div className="-m-4 h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 md:-m-6">
      <div className="relative h-full w-full">
        {/* Top editor bar */}
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

        {/* Left floating tools */}
        <ShapePalette
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
          onAddShape={addShape}
        />

        {/* Full canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setFlow}
          onPaneClick={() => {
            setSelectedElementID(null);
            setShowBgPanel(false);
          }}
          onNodeClick={(_, node) => {
            setSelectedElementID(node.id);
            setShowBgPanel(false);

            const style = node.style as React.CSSProperties | undefined;

            if (style?.background && style?.border && style?.color) {
              setSelectedColor({
                name: "Custom",
                bg: String(style.background),
                border: String(style.border).replace("1px solid ", ""),
                text: String(style.color),
              });
            }
          }}
          onEdgeClick={(_, edge) => {
            setSelectedElementID(edge.id);
            setShowBgPanel(false);
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
              color:"slategrey",
              backgroundColor:"ButtonShadow"
            }}
          />
        </ReactFlow>

        {/* Version drawer */}
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
  );
}