import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCollaboratorApi,
  getCollaboratorsApi,
  removeCollaboratorApi,
  searchUsersApi,
  updateCollaboratorRoleApi,
} from "../api/collaboration.api";

export const collaborationKeys = {
  collaborators: (diagramID: number) =>
    ["collaboration", "collaborators", diagramID] as const,
  users: (query: string) => ["collaboration", "users", query] as const,
};

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: collaborationKeys.users(query),
    queryFn: () => searchUsersApi(query),
    enabled: query.trim().length >= 2,
  });
}

export function useCollaborators(diagramID: number) {
  return useQuery({
    queryKey: collaborationKeys.collaborators(diagramID),
    queryFn: () => getCollaboratorsApi(diagramID),
    enabled: Number.isFinite(diagramID),
  });
}

export function useAddCollaborator(diagramID: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCollaboratorApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collaborationKeys.collaborators(diagramID),
      });
    },
  });
}

export function useRemoveCollaborator(diagramID: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCollaboratorApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collaborationKeys.collaborators(diagramID),
      });
    },
  });
}

export function useUpdateCollaboratorRole(diagramID: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCollaboratorRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collaborationKeys.collaborators(diagramID),
      });
    },
  });
}