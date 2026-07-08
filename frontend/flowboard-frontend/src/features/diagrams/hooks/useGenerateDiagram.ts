import { useMutation } from "@tanstack/react-query";
import { llm } from "../api/diagrams.api";
import { queryClient } from "@/lib/queryClient";
import { diagramKeys } from "./useDiagrams";
import { toast } from "sonner";


export const useGenerateDiagram = (diagramID:number) => {
  return useMutation({
    mutationFn: ({
      userMessage,
      diagram,
    }: {
      userMessage: string;
      diagram: number;
    }) => llm(userMessage, diagram),
     onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: diagramKeys.canvas(diagramID) }),
        queryClient.invalidateQueries({ queryKey: diagramKeys.versions(diagramID) }),
      ]);
      toast.success("Canvas saved");
    },
    onError: (error) => toast.error(error.message),
  });
};