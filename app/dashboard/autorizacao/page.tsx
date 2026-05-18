"use client";

import { UpdateEmployee } from "@/api/dashboard/funcionarios/route";
import { GetAllUsers, GetAllUsersType } from "@/api/route";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type UserItem = GetAllUsersType["users"][number];

export default function AuthorizationPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const data = await GetAllUsers();
        if (!isMounted) return;
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Não foi possível carregar os usuários.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const orderedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      String(a?.name ?? "").localeCompare(String(b?.name ?? "")),
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return orderedUsers
      .filter((u) => {
        const name = String(u?.name ?? "").toLowerCase();
        const email = String(u?.email ?? "").toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .slice(0, 20);
  }, [orderedUsers, searchQuery]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u._id === selectedUserId) ?? null;
  }, [users, selectedUserId]);

  async function handleAssignRoleRh() {
    if (!user?._id) {
      toast.error("Usuário não autenticado.");
      return;
    }
    if (!selectedUserId) {
      toast.error("Selecione um usuário.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { success, message } = await UpdateEmployee(
        user._id,
        { role: "rh" },
        selectedUserId,
      );

      if (!success) {
        toast.error(message || "Não foi possível atualizar a autorização.");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUserId ? { ...u, role: "rh" } : u)),
      );
      toast.success(message || "Permissão atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar autorização:", error);
      toast.error("Não foi possível atualizar a autorização.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return <Loading />;
  }

  if (!isAdmin) {
    return (
      <div className="space-y-2 p-6">
        <h1 className="text-xl font-semibold">Atribuir autorização</h1>
        <p className="text-muted-foreground text-sm">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Atribuir autorização</h1>
        <p className="text-muted-foreground text-sm">
          Selecione um usuário e atribua a função RH.
        </p>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 md:max-w-xl md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="relative">
              <Input
                placeholder="Digite nome ou email"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchOpen(false), 150);
                }}
              />
              {isSearchOpen && filteredUsers.length > 0 && (
                <div className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
                  <div className="max-h-72 overflow-auto">
                    {filteredUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedUserId(u._id);
                          setSearchQuery(`${u.name} (${u.email})`);
                          setIsSearchOpen(false);
                        }}
                      >
                        <div className="font-medium">{u.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {u.email}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Função atual:</span>{" "}
              <span className="font-medium">
                {selectedUser?.role ? selectedUser.role : "-"}
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <Button
              type="button"
              onClick={handleAssignRoleRh}
              disabled={isSubmitting || !selectedUserId}
            >
              {isSubmitting ? "Salvando..." : "Atribuir função RH"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
