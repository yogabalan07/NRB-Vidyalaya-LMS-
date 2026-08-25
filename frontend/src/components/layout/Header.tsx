import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: ROUTES.HOME },
  { label: "About", to: ROUTES.ABOUT },
  { label: "Courses", to: ROUTES.COURSES },
  { label: "Blog", to: ROUTES.BLOG },
  { label: "Contact", to: ROUTES.CONTACT },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, signOut, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.LOGIN, { replace: true });
    setMobileOpen(false);
  };

  const handleDashboard = () => {
    navigate(getRedirectPath());
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">NRB Vidyalaya</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Hindi Learning
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={handleDashboard}>
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to={ROUTES.LOGIN}>Login</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.REGISTER}>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden animate-fade-in">
          <nav className="container mx-auto flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={handleDashboard}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
