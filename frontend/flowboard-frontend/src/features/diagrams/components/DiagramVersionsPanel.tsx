import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDiagramVersions, useRestoreVersion } from "../hooks/useDiagrams";

interface DiagramVersionsPanelProps {
  diagramID: number;
}

export function DiagramVersionsPanel({ diagramID }: DiagramVersionsPanelProps) {
  const versions = useDiagramVersions(diagramID);
  const restore = useRestoreVersion(diagramID);

  return (
    <Card className="h-full rounded-none border-y-0 border-r-0">
      <CardHeader>
        <CardTitle className="text-base">Versions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {versions.isLoading && <p className="text-sm text-muted-foreground">Loading versions...</p>}
        {versions.data?.length === 0 && <p className="text-sm text-muted-foreground">No versions yet.</p>}
        {versions.data?.map((version) => (
          <div key={version.id} className="rounded-xl border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Version {version.version_number}</p>
                <p className="text-xs text-muted-foreground">{version.change_note || "No note"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(version.created_at).toLocaleString()}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => restore.mutate(version.id)} disabled={restore.isPending}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
