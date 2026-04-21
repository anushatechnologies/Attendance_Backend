import { AppBar, Avatar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { clearAuth, getAuth } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useEffect, useState } from "react";

type CompanyProfile = { groupPhotoUrl?: string | null };

export default function Layout(props: { title: string; children: React.ReactNode }) {
  const nav = useNavigate();
  const auth = getAuth();
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    api
      .get<CompanyProfile>("/api/company")
      .then((r) => setCompany(r.data))
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-40 h-[520px] w-[520px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute top-12 right-0 h-[420px] w-[420px] rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(10, 24, 48, 0.78)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Toolbar sx={{ minHeight: 76, flexWrap: { xs: "wrap", md: "nowrap" }, gap: 1.5, py: { xs: 1, md: 0 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1, minWidth: 0 }}>
            <Avatar
              src={company?.groupPhotoUrl ?? undefined}
              sx={{
                width: 40,
                height: 40,
                border: "1px solid rgba(255,255,255,0.35)",
                bgcolor: "rgba(255,255,255,0.08)",
              }}
            >
              A
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, color: "white" }}>
                {props.title}
              </Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.78, lineHeight: 1.1, color: "rgba(255,255,255,0.9)" }}>
                {auth?.name ? auth.name : "Attendance Management"}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              mr: { xs: 0, md: 2 },
              px: 1.4,
              py: 0.6,
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.10)",
              color: "white",
            }}
          >
            {auth?.role}
          </Box>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.22)", color: "white" }}
            onClick={() => {
              clearAuth();
              nav("/login");
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        {props.children}
      </Container>
    </div>
  );
}
