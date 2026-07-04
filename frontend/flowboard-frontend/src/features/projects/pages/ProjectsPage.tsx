import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject, useProjects } from "../hooks/useProjects";
import { SharedWithMeSection } from "@/components/SharedWithMeSection/SharedWithMeSection";

export function ProjectsPage() {
  const projects = useProjects();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    createProject.mutate(
      { name, description },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Folders for diagrams. Keep it boring and clean.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Create project</CardTitle>
          <CardDescription>Create a workspace before adding diagrams.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="System Design" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Backend architecture diagrams" />
            </div>
            <Button type="submit" disabled={createProject.isPending}>Create</Button>
          </form>
        </CardContent>
      </Card>

      {projects.isLoading && <p className="text-muted-foreground">Loading projects...</p>}
      {projects.isError && <p className="text-destructive">Failed to load projects.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.data?.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <Card className="h-full transition hover:border-primary/50 hover:bg-card/80">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description || "No description"}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <SharedWithMeSection />
    </div>
  );
} 
