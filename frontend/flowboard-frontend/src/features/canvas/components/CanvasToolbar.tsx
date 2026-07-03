import { Database, Save, Server, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  onAddNode: (type: "rectangle" | "service" | "database") => void;
  onSave: () => void;
  onDelete: () => void;
}

export function CanvasToolbar({ isDirty, isSaving, onAddNode, onSave, onDelete }: CanvasToolbarProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 rounded-xl border bg-card/90 p-2 shadow-xl backdrop-blur">
      <Button size="sm" variant="secondary" onClick={() => onAddNode("rectangle")}><Square className="h-4 w-4" /> Rectangle</Button>
      <Button size="sm" variant="secondary" onClick={() => onAddNode("service")}><Server className="h-4 w-4" /> Service</Button>
      <Button size="sm" variant="secondary" onClick={() => onAddNode("database")}><Database className="h-4 w-4" /> Database</Button>
      <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
      <Button size="sm" onClick={onSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}<Save className="h-4 w-4" /></Button>
      {isDirty && <span className="px-2 py-1 text-xs text-amber-300">Unsaved changes</span>}
    </div>
  );
}
