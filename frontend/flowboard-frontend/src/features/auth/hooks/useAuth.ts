import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMe, login, logout, register } from "../api/auth.api";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      toast.success("Logged in successfully");
      navigate("/projects");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      toast.success("Account created successfully");
      navigate("/projects");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear();
      toast.success("Logged out");
      navigate("/auth");
    },
    onError: (error) => toast.error(error.message),
  });
}
