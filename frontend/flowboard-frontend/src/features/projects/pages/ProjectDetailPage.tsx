import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus2, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDiagram, useProjectDiagrams } from "@/features/diagrams/hooks/useDiagrams";

export function ProjectDetailPage() {
  const projectID = Number(useParams().projectID);
  const diagrams = useProjectDiagrams(projectID);
  const createDiagram = useCreateDiagram(projectID);
  const [name, setName] = useState("");

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    createDiagram.mutate(
      { name },
      {
        onSuccess: () => setName(""),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project #{projectID}</h1>
        <p className="text-muted-foreground">Create and open diagrams inside this project.</p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label>Diagram name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Auth architecture" required />
        </div>
        <Button type="submit" disabled={createDiagram.isPending}><FilePlus2 className="h-4 w-4" /> Create diagram</Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {diagrams.data?.map((diagram) => (
          <Link key={diagram.id} to={`/diagrams/${diagram.id}`}>
            <Card className="h-full transition hover:border-primary/50 hover:bg-card/80">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Network className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{diagram.name}</CardTitle>
                <CardDescription>Open canvas editor</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
