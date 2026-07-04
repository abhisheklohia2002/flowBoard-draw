import { useState } from "react";
import { Search, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  useAddCollaborator,
  useCollaborators,
  useRemoveCollaborator,
  useSearchUsers,
  useUpdateCollaboratorRole,
} from "../hooks/useCollaboration";
import type { CollaboratorRole, SearchUser } from "../api/collaboration.api";
import { Button } from "@/components/ui/button";

interface CollaborateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagramID: number;
}

export function CollaborateDialog({
  open,
  onOpenChange,
  diagramID,
}: CollaborateDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>("editor");

  const usersQuery = useSearchUsers(query);
  const collaboratorsQuery = useCollaborators(diagramID);
  const addCollaborator = useAddCollaborator(diagramID);
  const removeCollaborator = useRemoveCollaborator(diagramID);
  const updateRole = useUpdateCollaboratorRole(diagramID);

  if (!open) return null;

  const handleAdd = (user: SearchUser) => {
    addCollaborator.mutate(
      {
        diagramID,
        userID: user.id,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          toast.success("Collaborator added");
          setQuery("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to add collaborator");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">Collaborate</h2>
              <p className="text-xs text-slate-400">
                Invite users to work on this diagram
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="text-slate-300 hover:bg-slate-900 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Add people
            </p>

            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as CollaboratorRole)}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {usersQuery.isLoading && query.length >= 2 && (
                <p className="text-sm text-slate-400">Searching...</p>
              )}

              {usersQuery.data?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {user.full_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    onClick={() => handleAdd(user)}
                    disabled={addCollaborator.isPending}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              ))}

              {query.length >= 2 && usersQuery.data?.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
                  No users found
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Current collaborators
            </p>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {collaboratorsQuery.isLoading && (
                <p className="text-sm text-slate-400">Loading collaborators...</p>
              )}

              {collaboratorsQuery.data?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-slate-900 p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {item.user.full_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {item.user.email}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                      onClick={() =>
                        removeCollaborator.mutate(
                          {
                            diagramID,
                            userID: item.user_id,
                          },
                          {
                            onSuccess: () => toast.success("Collaborator removed"),
                          }
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <select
                    value={item.role}
                    onChange={(e) =>
                      updateRole.mutate(
                        {
                          diagramID,
                          userID: item.user_id,
                          role: e.target.value as CollaboratorRole,
                        },
                        {
                          onSuccess: () => toast.success("Role updated"),
                        }
                      )
                    }
                    className="h-9 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              ))}

              {collaboratorsQuery.data?.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
                  No collaborators yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}