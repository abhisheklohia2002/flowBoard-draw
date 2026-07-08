import dagre from "@dagrejs/dagre";
import { Edge, Node } from "@xyflow/react";

const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 240;
const NODE_HEIGHT = 180;

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) {
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 120,
    nodesep: 80,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width ?? Number(node.style?.width) ?? NODE_WIDTH,
height: node.height ?? Number(node.style?.height) ?? NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width ?? Number(node.style?.width) ?? NODE_WIDTH;
const height = node.height ?? Number(node.style?.height) ?? NODE_HEIGHT;
    return {
      ...node,
      sourcePosition: direction === "LR" ? "right" : "bottom",
      targetPosition: direction === "LR" ? "left" : "top",
      position: {
       x: nodeWithPosition.x - width / 2,
  y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}