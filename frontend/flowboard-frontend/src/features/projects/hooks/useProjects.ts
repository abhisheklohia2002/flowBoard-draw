import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProject, listProjects } from "../api/projects.api";

export const projectKeys = {
  all: ["projects"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project created");
    },
    onError: (error) => toast.error(error.message),
  });
}
