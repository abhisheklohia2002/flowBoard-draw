import { Link } from "react-router-dom";
import { Share2, UserCircle, Eye, Pencil, Workflow } from "lucide-react";
import { useSharedWithMe } from "@/features/diagrams/hooks/useDiagrams";

export function SharedWithMeSection() {
  const sharedQuery = useSharedWithMe();

  if (sharedQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-400">
        Loading shared diagrams...
      </div>
    );
  }

  if (sharedQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
        Failed to load shared diagrams.
      </div>
    );
  }

  const diagrams = sharedQuery.data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
          <Share2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">Shared with me</h2>
          <p className="text-sm text-slate-500">
            Diagrams where you are invited as collaborator
          </p>
        </div>
      </div>

      {diagrams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <Share2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-white">
            No shared diagrams yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            When someone invites you, diagrams will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {diagrams.map((diagram) => (
            <Link
              key={diagram.id}
              to={`/diagrams/${diagram.id}`}
              className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                  <Workflow className="h-5 w-5" />
                </div>

                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                    diagram.collaborator_role === "editor"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-amber-500/10 text-amber-300",
                  ].join(" ")}
                >
                  {diagram.collaborator_role === "editor" ? (
                    <Pencil className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  {diagram.collaborator_role}
                </span>
              </div>

              <h3 className="truncate text-sm font-semibold text-white group-hover:text-cyan-300">
                {diagram.name}
              </h3>

              <p className="mt-1 truncate text-xs text-slate-500">
                Project: {diagram.project_name}
              </p>

              <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                <UserCircle className="h-5 w-5 text-slate-500" />

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-300">
                    {diagram.owner_name}
                  </p>
                  <p className="truncate text-[11px] text-slate-600">
                    {diagram.owner_email}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-600">
                Updated {new Date(diagram.updated_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}