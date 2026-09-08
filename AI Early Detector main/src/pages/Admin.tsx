import { useEffect, useState } from "react";
import { ArrowLeft, Users, Activity, FileText, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

interface LoginRecord {
  id: string;
  user_id: string | null;
  identifier: string;
  method: string;
  user_agent: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) { navigate("/admin-login"); return; }
    const { id, password } = JSON.parse(auth);

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    fetch(`https://${projectId}.supabase.co/functions/v1/admin-data`, {
      headers: {
        "x-admin-id": id,
        "x-admin-password": password,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        setLogins(d.logins ?? []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const signOut = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin-login");
  };

  const stats = [
    { label: "Total Logins", value: String(logins.length), icon: Activity },
    { label: "Unique Users", value: String(new Set(logins.map(l => l.user_id ?? l.identifier)).size), icon: Users },
    { label: "Today", value: String(logins.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length), icon: FileText },
    { label: "Admin Sessions", value: String(logins.filter(l => l.method === "admin_password").length), icon: LogOut },
  ];

  const methodBadge = (m: string) => {
    if (m === "admin_password") return "bg-destructive/20 text-destructive";
    if (m === "phone_otp") return "bg-primary/20 text-primary";
    return "bg-accent/40 text-accent-foreground";
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticlesBackground />

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Live login activity from the backend.</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-card card-glow p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-hero-gradient flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card card-glow overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Login History</h2>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-medium">Identifier</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Method</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">When</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No logins yet.</td></tr>
                  )}
                  {logins.map((l) => (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/50 transition">
                      <td className="p-4 text-foreground font-medium">{l.identifier}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${methodBadge(l.method)}`}>
                          {l.method}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground truncate max-w-xs">{l.user_agent ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
