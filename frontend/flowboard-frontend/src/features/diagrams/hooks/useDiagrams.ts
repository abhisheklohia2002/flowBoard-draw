import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDiagram, getCanvas, listProjectDiagrams, listVersions, restoreVersion, saveCanvas } from "../api/diagrams.api";
import type { SaveCanvasRequest } from "@/types/diagram";

export const diagramKeys = {
  byProject: (projectID: number) => ["projects", projectID, "diagrams"] as const,
  canvas: (diagramID: number) => ["diagrams", diagramID, "canvas"] as const,
  versions: (diagramID: number) => ["diagrams", diagramID, "versions"] as const,
};

export function useProjectDiagrams(projectID: number) {
  return useQuery({
    queryKey: diagramKeys.byProject(projectID),
    queryFn: () => listProjectDiagrams(projectID),
    enabled: Number.isFinite(projectID),
  });
}

export function useCreateDiagram(projectID: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string }) => createDiagram(projectID, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: diagramKeys.byProject(projectID) });
      toast.success("Diagram created");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCanvas(diagramID: number) {
  return useQuery({
    queryKey: diagramKeys.canvas(diagramID),
    queryFn: () => getCanvas(diagramID),
    enabled: Number.isFinite(diagramID),
  });
}

export function useSaveCanvas(diagramID: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveCanvasRequest) => saveCanvas(diagramID, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: diagramKeys.canvas(diagramID) }),
        queryClient.invalidateQueries({ queryKey: diagramKeys.versions(diagramID) }),
      ]);
      toast.success("Canvas saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDiagramVersions(diagramID: number) {
  return useQuery({
    queryKey: diagramKeys.versions(diagramID),
    queryFn: () => listVersions(diagramID),
    enabled: Number.isFinite(diagramID),
  });
}

export function useRestoreVersion(diagramID: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionID: number) => restoreVersion(diagramID, versionID),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: diagramKeys.canvas(diagramID) }),
        queryClient.invalidateQueries({ queryKey: diagramKeys.versions(diagramID) }),
      ]);
      toast.success("Version restored");
    },
    onError: (error) => toast.error(error.message),
  });
}
