import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CanvasSidebar() {
  return (
    <Card className="h-full rounded-none border-y-0 border-l-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4" /> Inspector</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Select a node or edge. Label editing is handled directly on selected elements for this MVP.
      </CardContent>
    </Card>
  );
}
