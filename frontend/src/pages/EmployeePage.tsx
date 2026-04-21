import { Alert, Avatar, Box, Divider, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import AppCard from "../components/AppCard";
import Layout from "../components/Layout";
import MonthCalendar, { DayStatus } from "../components/MonthCalendar";
import PageHeader from "../components/PageHeader";

type CompanyRole = { id: number; name: string; photoUrl?: string | null };
type Profile = { employeeId: number; employeeNumber: string; name: string; companyRole?: CompanyRole | null };
type Attendance = {
  id: number;
  employeeId: number;
  date: string;
  inTime?: string | null;
  outTime?: string | null;
  workedMinutes?: number | null;
  leaveReason?: string | null;
  status: "PRESENT" | "HALF_DAY" | "LEAVE";
};

type MonthSummary = {
  month: string;
  fromDate: string;
  toDate: string;
  workingDays: number;
  presentDays: number;
  halfDayDays: number;
  leaveDays: number;
  totalWorkedMinutes: number;
};

type AttendanceSettings = {
  defaultInTime: string;
  defaultOutTime: string;
  weekendDays: string;
  fullDayMinutes: number;
  halfDayMinutes: number;
};
type Holiday = { id: number; date: string; name: string };
type DailyGroupPhoto = { id: number; date: string; photoUrl: string };

export default function EmployeePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [entries, setEntries] = useState<Attendance[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [monthSummary, setMonthSummary] = useState<MonthSummary | null>(null);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [dailyPhotos, setDailyPhotos] = useState<DailyGroupPhoto[]>([]);

  async function loadProfile() {
    const res = await api.get<Profile>("/api/employee/profile");
    setProfile(res.data);
  }

  async function loadAttendance(m: string) {
    const res = await api.get<Attendance[]>("/api/employee/attendance", { params: { month: m } });
    setEntries(res.data);
  }

  async function loadSummary(m: string) {
    const res = await api.get<MonthSummary>("/api/employee/attendance/summary", { params: { month: m } });
    setMonthSummary(res.data);
  }

  async function loadSettings() {
    const res = await api.get<AttendanceSettings>("/api/settings/attendance");
    setSettings(res.data);
  }

  async function loadHolidays(m: string) {
    const res = await api.get<Holiday[]>("/api/holidays", { params: { month: m } });
    setHolidays(res.data);
  }

  async function loadDailyPhotos(m: string) {
    const res = await api.get<DailyGroupPhoto[]>("/api/daily-group-photos", { params: { month: m } });
    setDailyPhotos(res.data);
  }

  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadAttendance(month),
      loadSummary(month),
      loadSettings(),
      loadHolidays(month),
      loadDailyPhotos(month),
    ]).catch((e) => setErr(e?.response?.data?.error ?? "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Promise.all([loadAttendance(month), loadSummary(month)]).catch((e) =>
      setErr(e?.response?.data?.error ?? "Failed to load attendance"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    loadHolidays(month).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    loadDailyPhotos(month).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const statusByDate: Record<string, DayStatus> = useMemo(() => {
    if (!settings || !monthSummary) return {};

    const entryMap: Record<string, DayStatus> = {};
    for (const e of entries) {
      entryMap[e.date] = e.status === "PRESENT" ? "P" : e.status === "HALF_DAY" ? "HD" : "L";
    }

    const holidaySet = new Set(holidays.map((h) => h.date));
    const weekendSet = new Set(
      (settings?.weekendDays ?? "SUNDAY")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    );

    const first = dayjs(`${month}-01`);
    const days = first.daysInMonth();
    const today = dayjs().format("YYYY-MM-DD");
    const out: Record<string, DayStatus> = {};
    for (let d = 1; d <= days; d++) {
      const dt = first.date(d).format("YYYY-MM-DD");
      if (dt < monthSummary.fromDate) {
        out[dt] = "";
        continue;
      }
      const dowName = first.date(d).format("dddd").toUpperCase();
      if (holidaySet.has(dt) || weekendSet.has(dowName)) {
        out[dt] = "H";
      } else {
        out[dt] = dt <= today ? (entryMap[dt] ?? "L") : (entryMap[dt] ?? "");
      }
    }
    return out;
  }, [entries, holidays, month, monthSummary, settings]);

  useEffect(() => {
    const monthStart = `${month}-01`;
    const monthEnd = dayjs(monthStart).endOf("month").format("YYYY-MM-DD");
    let nextDate = selectedDate;

    if (!selectedDate.startsWith(`${month}-`)) {
      nextDate = monthSummary ? monthSummary.fromDate : monthStart;
    }

    if (monthSummary) {
      if (nextDate < monthSummary.fromDate) nextDate = monthSummary.fromDate;
      if (nextDate > monthEnd) nextDate = monthEnd;
    } else {
      if (nextDate < monthStart) nextDate = monthStart;
      if (nextDate > monthEnd) nextDate = monthEnd;
    }

    if (nextDate !== selectedDate) {
      setSelectedDate(nextDate);
    }
  }, [month, monthSummary, selectedDate]);

  const selectedEntry = useMemo(() => entries.find((e) => e.date === selectedDate), [entries, selectedDate]);
  const selectedHoliday = useMemo(() => holidays.find((h) => h.date === selectedDate), [holidays, selectedDate]);
  const selectedDailyPhoto = useMemo(() => dailyPhotos.find((p) => p.date === selectedDate), [dailyPhotos, selectedDate]);

  const presentCount = useMemo(() => entries.filter((e) => e.status === "PRESENT").length, [entries]);
  const halfDayCount = useMemo(() => entries.filter((e) => e.status === "HALF_DAY").length, [entries]);
  const leaveCount = useMemo(() => entries.filter((e) => e.status === "LEAVE").length, [entries]);
  const workedMinutes = monthSummary?.totalWorkedMinutes ?? entries.reduce((acc, e) => acc + (e.workedMinutes ?? 0), 0);
  const hh = Math.floor(workedMinutes / 60);
  const mm = workedMinutes % 60;

  const selectedStatus = statusByDate[selectedDate] ?? "";
  const selectedStatusColor =
    selectedStatus === "P"
      ? "#16a34a"
      : selectedStatus === "H"
        ? "#7c3aed"
        : selectedStatus === "HD"
          ? "#f59e0b"
        : selectedStatus === "L"
          ? "#dc2626"
          : "#64748b";
  const selectedStatusLabel = selectedStatus || "--";

  return (
    <Layout title="Employee Dashboard">
      <div className="grid gap-6">
        {err ? <Alert severity="error">{err}</Alert> : null}

        <PageHeader
          eyebrow="Employee workspace"
          title="My attendance"
          subtitle="View your monthly calendar, totals (till date), and the group photo for the selected day."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Working days
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950 }}>{monthSummary?.workingDays ?? "-"}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Counted till today in {month}</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Present
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950, color: "success.main" }}>{monthSummary?.presentDays ?? presentCount}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Approved present days this month</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Leave / absent
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950, color: "error.main" }}>{monthSummary?.leaveDays ?? leaveCount}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Non-working marked days</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Photo linked
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950, color: selectedDailyPhoto ? "warning.main" : "text.primary" }}>
              {selectedDailyPhoto ? "Daily" : "None"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Source for {selectedDate}</Typography>
          </AppCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 grid gap-6">
            <AppCard>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar src={profile?.companyRole?.photoUrl ?? undefined} sx={{ width: 62, height: 62 }}>
                  {profile?.name?.[0] ?? "E"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950, fontSize: 18, lineHeight: 1.1 }}>
                    {profile?.name ?? "..."}
                  </Typography>
                  <Typography sx={{ opacity: 0.75, fontSize: 13 }}>{profile?.employeeNumber ?? ""}</Typography>
                  <Typography sx={{ opacity: 0.85, fontSize: 13 }}>
                    Company role: <b>{profile?.companyRole?.name ?? "--"}</b>
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: 900 }}>This month (till date)</Typography>
              <Box sx={{ display: "grid", gap: 0.6, mt: 1 }}>
                <Typography>
                  Working days: <b>{monthSummary?.workingDays ?? "-"}</b>
                </Typography>
                <Typography>
                  Present: <b style={{ color: "#16a34a" }}>{monthSummary?.presentDays ?? presentCount}</b>
                </Typography>
                <Typography>
                  Half day: <b style={{ color: "#f59e0b" }}>{monthSummary?.halfDayDays ?? halfDayCount}</b>
                </Typography>
                <Typography>
                  Absent/Leave: <b style={{ color: "#dc2626" }}>{monthSummary?.leaveDays ?? leaveCount}</b>
                </Typography>
                <Typography>
                  Worked: <b>{hh}h {mm}m</b>
                </Typography>
                {monthSummary ? (
                  <Typography sx={{ opacity: 0.7, fontSize: 12 }}>
                    {monthSummary.fromDate <= monthSummary.toDate
                      ? `Range: ${monthSummary.fromDate} -> ${monthSummary.toDate}`
                      : `Attendance starts on ${monthSummary.fromDate}`}
                  </Typography>
                ) : null}
              </Box>
            </AppCard>

            <AppCard>
              <Typography sx={{ fontWeight: 950, mb: 1 }}>Selected day</Typography>
              <Typography sx={{ opacity: 0.7, fontSize: 12, mb: 1.5 }}>
                Click a date on the calendar to view status and photo.
              </Typography>
              <Divider />

              <Box sx={{ mt: 2, display: "grid", gap: 0.6 }}>
                <Typography sx={{ fontWeight: 950 }}>{selectedDate}</Typography>
                <Typography sx={{ opacity: 0.9 }}>
                  Status:{" "}
                  <b style={{ color: selectedStatusColor }}>{selectedStatusLabel}</b>
                  {selectedHoliday ? <span style={{ opacity: 0.75 }}> | {selectedHoliday.name}</span> : null}
                </Typography>
                <Typography sx={{ opacity: 0.9 }}>
                  Time:{" "}
                  <b>
                    {selectedEntry?.inTime ?? "--"} {"->"} {selectedEntry?.outTime ?? "--"}
                  </b>
                </Typography>
                {selectedStatus === "L" ? (
                  <Typography sx={{ opacity: 0.9 }}>
                    Leave reason: <b>{selectedEntry?.leaveReason?.trim() || "--"}</b>
                  </Typography>
                ) : null}
                <Typography sx={{ opacity: 0.7, fontSize: 12 }}>
                  Photo source:{" "}
                  <b>{selectedDailyPhoto?.photoUrl ? "Daily group photo" : "No photo for this date"}</b>
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "linear-gradient(135deg, rgba(30,64,175,0.06), rgba(124,58,237,0.06))",
                }}
              >
                {selectedDailyPhoto?.photoUrl ? (
                  <Box component="img" alt="Daily group" src={selectedDailyPhoto.photoUrl} sx={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                ) : (
                  <Box sx={{ height: 200, display: "grid", placeItems: "center" }}>
                    <Typography sx={{ opacity: 0.75 }}>No daily group photo uploaded for this date</Typography>
                  </Box>
                )}
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-8">
            <AppCard>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Attendance calendar
                </Typography>
                <TextField
                  label="Month"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 170 }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />

              <MonthCalendar month={month} statusByDate={statusByDate} selectedDate={selectedDate} onDayClick={(d) => setSelectedDate(d)} />

                <Typography sx={{ mt: 2, opacity: 0.75, fontSize: 12 }}>
                <b style={{ color: "#16a34a" }}>P</b> = Present,{" "}
                <b style={{ color: "#f59e0b" }}>HD</b> = Half day,{" "}
                <b style={{ color: "#dc2626" }}>L</b> = Leave/Absent,{" "}
                <b style={{ color: "#7c3aed" }}>H</b> = Holiday.
              </Typography>
            </AppCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
