import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const footerLinks = {
  learn: [
    { label: "Courses", to: ROUTES.COURSES },
    { label: "Hindi Alphabet", to: ROUTES.COURSES },
    { label: "Vocabulary", to: ROUTES.COURSES },
    { label: "Quiz System", to: ROUTES.COURSES },
  ],
  company: [
    { label: "About Us", to: ROUTES.ABOUT },
    { label: "Blog", to: ROUTES.BLOG },
    { label: "Contact", to: ROUTES.CONTACT },
    { label: "FAQ", to: ROUTES.FAQ },
  ],
  support: [
    { label: "Help Center", to: ROUTES.FAQ },
    { label: "Terms of Service", to: ROUTES.HOME },
    { label: "Privacy Policy", to: ROUTES.HOME },
    { label: "Refund Policy", to: ROUTES.HOME },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4">
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
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Professional Hindi language learning platform with AI-powered tutoring, structured courses, and comprehensive learning tools.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@nrbvidyalaya.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>India</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Learn</h3>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NRB Vidyalaya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
