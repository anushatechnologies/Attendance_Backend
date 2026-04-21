import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Role, setAuth } from "../auth/auth";

type LoginResponse = { token: string; role: Role; employeeId?: number | null; name?: string | null };

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length > 0 && !loading, [loading, password, username]);

  function getErrorMessage(err: unknown) {
    const anyErr = err as any;
    return anyErr?.response?.data?.error ?? anyErr?.message ?? "Login failed";
  }

  function nextPathForRole(role: Role) {
    if (role === "ROLE_ADMIN") return "/admin";
    if (role === "ROLE_HR") return "/hr";
    return "/employee";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/api/auth/login", { username: trimmedUsername, password });
      setAuth({ token: res.data.token, role: res.data.role, name: res.data.name ?? undefined });
      nav(nextPathForRole(res.data.role), { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-[22rem] w-[22rem] rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <div className="grid min-h-[calc(100vh-4rem)] gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[36px] border border-white/70 bg-white/65 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-[22px] bg-slate-950 text-xl font-black text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
                A
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">Attendance</div>
                <div className="text-sm text-slate-500">Admin / HR / Employee portal</div>
              </div>
            </div>

            <div className="mt-8">
              <div className="inline-flex rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                Single sign-in
              </div>
              <h1 className="mt-4 text-4xl font-black leading-[1] tracking-[-0.04em] text-slate-950 md:text-6xl">
                Access the full attendance workspace in one place.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Use your role-based credentials to manage holidays, mark attendance, upload the daily group photo, or review your monthly report.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Admin</div>
                <div className="mt-2 text-lg font-black text-slate-900">Controls</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">Roles, defaults, holidays, company photo.</div>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">HR</div>
                <div className="mt-2 text-lg font-black text-slate-900">Updates</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">Attendance status, bulk date updates, photo uploads.</div>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Employee</div>
                <div className="mt-2 text-lg font-black text-slate-900">Reports</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">Calendar, totals, selected-day status, and photos.</div>
              </div>
            </div>
          </div>

          <Card
            elevation={0}
            sx={{
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.82)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(247,249,255,0.84) 100%), radial-gradient(circle at top right, rgba(216,155,43,0.12), transparent 34%)",
              boxShadow: "0 28px 70px rgba(17,24,39,0.10)",
              backdropFilter: "blur(14px)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Typography variant="h4">Sign in</Typography>
                  <Typography sx={{ mt: 1, color: "text.secondary" }}>
                    Use your assigned username and password to enter the dashboard.
                  </Typography>
                </div>
                <div className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Secure access
                </div>
              </div>

              <Box component="form" onSubmit={onSubmit} sx={{ mt: 4, display: "grid", gap: 2 }}>
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  required
                  disabled={loading}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          edge="end"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
                  <Button type="submit" variant="contained" size="large" disabled={!canSubmit}>
                    {loading ? "Signing in..." : "Enter dashboard"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => nav("/")}
                    disabled={loading}
                    sx={{ borderColor: "rgba(23,32,51,0.18)", color: "#172033" }}
                  >
                    Back home
                  </Button>
                </div>
              </Box>

              <div className="mt-6 rounded-[26px] border border-slate-200/70 bg-slate-50/85 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">First run</div>
                <Typography sx={{ mt: 1, fontWeight: 900 }}>Default Admin</Typography>
                <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                  Demo credentials are configured by your admin.
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
