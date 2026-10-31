import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthProvider";
import { usuarioService } from "@/services/api/usuarioService";

export function useCurrentUser() {
    const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => usuarioService.getCurrentUser(),
    enabled: isAuthenticated,
  });
}