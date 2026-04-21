import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";

// P = Present, HD = Half day, L = Leave/Absent, H = Holiday
export type DayStatus = "P" | "HD" | "L" | "H" | "";

export default function MonthCalendar(props: {
  month: string; // YYYY-MM
  statusByDate: Record<string, DayStatus>; // YYYY-MM-DD => P/HD/L/H
  selectedDate?: string; // YYYY-MM-DD
  onDayClick?: (date: string) => void;
}) {
  const first = dayjs(`${props.month}-01`);
  const daysInMonth = first.daysInMonth();
  const startDow = first.day(); // 0=Sun

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells: Array<{ date: string | null; status: DayStatus }> = [];
  for (let i = 0; i < startDow; i++) cells.push({ date: null, status: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = first.date(d).format("YYYY-MM-DD");
    const status = props.statusByDate[date] ?? "";
    cells.push({ date, status });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, status: "" });

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 1, mb: 1.2 }}>
        {labels.map((l) => (
          <Typography
            key={l}
            sx={{
              fontSize: 12,
              opacity: 0.72,
              textAlign: "center",
              fontWeight: 800,
              letterSpacing: 0.25,
              textTransform: "uppercase",
            }}
          >
            {l}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 1 }}>
        {cells.map((c, idx) => {
          const day = c.date ? dayjs(c.date).date() : "";
          const bg =
            c.status === "P"
              ? "linear-gradient(180deg, rgba(22,163,74,0.18), rgba(22,163,74,0.08))"
              : c.status === "HD"
                ? "linear-gradient(180deg, rgba(245,158,11,0.18), rgba(245,158,11,0.08))"
              : c.status === "H"
                ? "linear-gradient(180deg, rgba(124,58,237,0.18), rgba(124,58,237,0.08))"
              : c.status === "L"
                ? "linear-gradient(180deg, rgba(220,38,38,0.16), rgba(220,38,38,0.07))"
                : "rgba(255,255,255,0.5)";
          const border =
            c.status === "P"
              ? "1px solid rgba(22,163,74,0.28)"
              : c.status === "HD"
                ? "1px solid rgba(245,158,11,0.28)"
              : c.status === "H"
                ? "1px solid rgba(124,58,237,0.28)"
              : c.status === "L"
                ? "1px solid rgba(220,38,38,0.28)"
                : "1px solid rgba(15,23,42,0.08)";
          const letterColor =
            c.status === "P"
              ? "success.main"
              : c.status === "HD"
                ? "warning.main"
              : c.status === "H"
                ? "secondary.main"
              : c.status === "L"
                  ? "error.main"
                  : "text.secondary";
          const selected = !!(c.date && props.selectedDate && c.date === props.selectedDate);
          return (
            <Box
              key={idx}
              role={c.date && props.onDayClick ? "button" : undefined}
              tabIndex={c.date && props.onDayClick ? 0 : undefined}
              onClick={() => {
                if (c.date && props.onDayClick) props.onDayClick(c.date);
              }}
              onKeyDown={(event) => {
                if (!c.date || !props.onDayClick) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  props.onDayClick(c.date);
                }
              }}
              sx={{
                height: { xs: 72, md: 86 },
                borderRadius: 4,
                border,
                background: bg,
                p: 1.2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                outline: selected ? "2px solid rgba(22,93,255,0.48)" : "none",
                cursor: c.date && props.onDayClick ? "pointer" : "default",
                userSelect: "none",
                boxShadow: c.date ? "0 10px 24px rgba(15, 23, 42, 0.05)" : "none",
                transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
                "&:hover":
                  c.date && props.onDayClick
                    ? { transform: "translateY(-2px)", boxShadow: "0 14px 28px rgba(2,6,23,0.08)" }
                    : undefined,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 900, opacity: 0.86 }}>{day}</Typography>
              <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 950, textAlign: "right", color: letterColor }}>
                {c.date ? c.status : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
