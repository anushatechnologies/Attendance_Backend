import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-10 h-[26rem] w-[26rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/40 bg-white/55 backdrop-blur-xl">
        <Container maxWidth="xl">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-slate-950 text-lg font-black text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
                A
              </div>
              <div className="leading-tight">
                <div className="text-lg font-black text-slate-900">Attendance</div>
                <div className="text-sm text-slate-500">Management System</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="text" onClick={() => nav("/login")} sx={{ color: "#172033" }}>
                Login
              </Button>
              <Button variant="contained" onClick={() => nav("/login")}>
                Open portal
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main>
        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Daily attendance for Admin, HR, and Employees
              </div>

              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 md:text-7xl">
                A cleaner way to manage presence, leave, holidays, and daily team photos.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                HR marks attendance in seconds, Admin controls settings and holidays, and each employee gets a clear monthly view with the exact photo captured for that day.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="large" variant="contained" onClick={() => nav("/login")}>
                  Login to dashboard
                </Button>
                <Button size="large" variant="outlined" onClick={() => nav("/login")} sx={{ borderColor: "rgba(23,32,51,0.18)", color: "#172033" }}>
                  Explore workflow
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Admin</div>
                  <div className="mt-3 text-lg font-black text-slate-900">Roles and holidays</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">Create roles, upload the company photo, and set default office timing.</div>
                </div>
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">HR</div>
                  <div className="mt-3 text-lg font-black text-slate-900">Fast P, L, H updates</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">Mark present or leave, bulk apply dates, and upload one daily group photo.</div>
                </div>
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Employee</div>
                  <div className="mt-3 text-lg font-black text-slate-900">Monthly clarity</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">See totals till date, calendar colors, and the exact photo linked to a selected day.</div>
                </div>
              </div>
            </div>

            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.75)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(247,249,255,0.80) 100%), radial-gradient(circle at top right, rgba(216,155,43,0.16), transparent 30%)",
                boxShadow: "0 28px 70px rgba(17,24,39,0.10)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <Typography sx={{ fontWeight: 950, fontSize: 20 }}>Platform snapshot</Typography>
                <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
                  Live
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
                  <div className="text-sm text-slate-500">Calendar states</div>
                  <div className="mt-2 text-3xl font-black text-slate-950">P / L / H</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">Present, Leave, Holiday</div>
                </div>
                <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
                  <div className="text-sm text-slate-500">Minimum work rule</div>
                  <div className="mt-2 text-3xl font-black text-slate-950">8h</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">Auto mark present by hours</div>
                </div>
                <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
                  <div className="text-sm text-slate-500">Daily media</div>
                  <div className="mt-2 text-3xl font-black text-slate-950">1 photo</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">Shared for all employees</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Workflow</div>
                      <div className="mt-2 text-xl font-black text-slate-950">One system, three roles, zero confusion.</div>
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Structured</div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-black text-slate-900">1. Admin controls the rules</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">Set in-time, out-time, weekends, festival holidays, roles, and the main company image.</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-black text-slate-900">2. HR updates attendance every day</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">Use quick save, leave marking, bulk update, and a single daily group photo upload.</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-black text-slate-900">3. Employees get a clean report view</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">Pick a date and instantly see status, working time, and the linked group photo.</div>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </div>
        </Container>
      </main>

      <footer className="border-t border-white/40 bg-white/55 backdrop-blur-xl">
        <Container maxWidth="xl">
          <div className="flex flex-col gap-2 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <span>Copyright {new Date().getFullYear()} Attendance</span>
            <span>React + MUI + Tailwind frontend with Spring Boot backend</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}

