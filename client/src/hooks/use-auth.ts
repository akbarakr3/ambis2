import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface User {
  id: number;
  mobile: string;
  email?: string | null;
  name?: string | null;
  role: 'student' | 'admin';
}

const jsonHeaders = { "Content-Type": "application/json" };

async function fetchUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
  return null;
}

async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (mobile: string) => {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Failed to send OTP");
      }
      return await res.json();
    },
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mobile, otp }: { mobile: string; otp: string }) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify({ mobile, otp }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Invalid OTP");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mobile, password, otp }: { mobile: string; password: string; otp?: string }) => {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify({ mobile, password, otp }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Invalid credentials");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email?: string; name?: string }) => {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Failed to update profile");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Failed to change password");
      }
      return await res.json();
    },
  });
}

