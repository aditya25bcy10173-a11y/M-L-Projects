import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ParticlesBackground from "@/components/ParticlesBackground";

const ADMIN_ID = "ADITYA78";
const ADMIN_PASSWORD = "2175";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (adminId !== ADMIN_ID || password !== ADMIN_PASSWORD) {
      toast.error("Invalid admin credentials");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("admin_auth", JSON.stringify({ id: adminId, password }));

    // Best-effort log to login_history (anon insert allowed when user_id is null)
    await supabase.from("login_history").insert({
      identifier: adminId,
      method: "admin_password",
      user_agent: navigator.userAgent,
    });

    toast.success("Welcome, Admin");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      <ParticlesBackground />
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-hero-gradient shadow-md">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Admin <span className="text-gradient">Portal</span></h1>
            <p className="text-xs text-muted-foreground">Restricted access</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl bg-card card-glow p-8 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Admin sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your admin ID and password.</p>
          </div>

          <div>
            <Label htmlFor="adminId" className="text-sm font-medium">Admin ID</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="adminId"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="ADITYA78"
                className="pl-10 h-11"
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="pl-10 h-11"
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-hero-gradient text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-xs text-muted-foreground hover:text-primary"
          >
            ← Back to user login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
