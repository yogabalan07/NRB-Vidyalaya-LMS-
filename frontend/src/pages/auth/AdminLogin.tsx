import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginInput } from "@/utils/validators";
import { ROUTES } from "@/constants/routes";
import { LoginBackground } from "@/components/animations";

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    signIn,
    loading: authLoading,
    isAuthenticated,
    user,
    getRedirectPath,
  } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading && user?.profileLoaded) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  if (isAuthenticated && !authLoading && user) {
    if (!user.profileLoaded) {
      return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-4 rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">
                Your user profile could not be loaded.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please contact an administrator to set up your account properly.
              </p>
            </div>
            <Button asChild variant="ghost" className="mt-2">
              <Link to={ROUTES.HOME}>Back to Home</Link>
            </Button>
          </div>
        </div>
      );
    }
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-4 rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">
                You do not have permission to access the admin portal.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This login is for administrators only.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link to={getRedirectPath()}>Go to Your Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2">
              <Link to={ROUTES.HOME}>Back to Home</Link>
            </Button>
          </div>
        </div>
      );
    }
    return null;
  }

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      if (message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (message.includes("Email not confirmed")) {
        setError("Please verify your email before logging in.");
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <LoginBackground variant="admin" />
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
          <div className="mb-2 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to the NRB Vidyalaya administration portal
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@nrbvidyalaya.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                to={ROUTES.ADMIN_FORGOT_PASSWORD}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In as Admin"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
          <Link to={ROUTES.STUDENT_LOGIN} className="hover:text-foreground hover:underline">
            Student Login
          </Link>
          <span>·</span>
          <Link to={ROUTES.TEACHER_LOGIN} className="hover:text-foreground hover:underline">
            Teacher Login
          </Link>
        </div>
      </div>
    </div>
  );
}
