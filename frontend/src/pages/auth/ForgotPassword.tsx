import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

export function ForgotPasswordPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="mt-4 text-muted-foreground">
          Enter your email to reset your password.
        </p>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
