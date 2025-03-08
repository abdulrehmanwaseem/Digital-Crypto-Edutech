import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { LoginInput, RegisterInput } from "@/schemas/auth";
import { Role } from "@prisma/client";

export const useAuth = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const hasRole = (roles: Role | Role[]) => {
    if (!session?.user?.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(session.user.role);
    }
    return session.user.role === roles;
  };

  const login = async (values: LoginInput) => {
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
        return false;
      }

      router.push("/dashboard");
      router.refresh();
      return true;
    } catch (error) {
      toast.error("Something went wrong");
      return false;
    }
  };

  const register = async (values: RegisterInput) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return false;
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to login after registration");
        return false;
      }

      router.push("/dashboard");
      router.refresh();
      return true;
    } catch (error) {
      toast.error("Something went wrong");
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: hasRole(Role.ADMIN),
    isUser: hasRole(Role.USER),
    hasRole,
    login,
    register,
    logout,
  };
};
