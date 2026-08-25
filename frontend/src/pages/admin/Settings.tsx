import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks";
import {
  Settings as SettingsIcon,
  Shield,
  User,
  Server,
  Database,
  Bell,
} from "lucide-react";

interface SystemSetting {
  label: string;
  value: string;
  icon: React.ElementType;
}

const SYSTEM_INFO: SystemSetting[] = [
  { label: "App Name", value: "NRB Vidyalaya LMS", icon: Server },
  { label: "Version", value: "1.0.0", icon: Server },
  { label: "Database", value: "Supabase (PostgreSQL)", icon: Database },
  { label: "Auth Provider", value: "Supabase Auth", icon: Shield },
  { label: "Frontend", value: "React 19 + TypeScript", icon: SettingsIcon },
  { label: "Storage", value: "Supabase Storage", icon: Database },
];

export function AdminSettingsPage() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          System settings and configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">
                {user?.fullName || profile?.full_name || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge>{user?.role || "N/A"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-mono text-muted-foreground">
                {user?.id || "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SYSTEM_INFO.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <Badge variant="default">Supabase Auth</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Row Level Security</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Rate Limiting</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">JWT Validation</span>
              <Badge variant="default">On All Routes</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">In-App Notifications</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifications</span>
              <Badge variant="outline">Configure in Supabase</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Email notifications can be configured through Supabase Edge
              Functions and your SMTP provider.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">avatars</span>
              <Badge variant="outline">User profile images</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">study-materials</span>
              <Badge variant="outline">Course files and documents</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">blog-covers</span>
              <Badge variant="outline">Blog post cover images</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ensure these buckets exist in your Supabase project with
              appropriate RLS policies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
