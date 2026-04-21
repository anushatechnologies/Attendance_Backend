import { Alert, Avatar, Box, Button, Divider, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import AppCard from "../components/AppCard";
import Layout from "../components/Layout";
import MonthCalendar, { DayStatus } from "../components/MonthCalendar";
import PageHeader from "../components/PageHeader";

type CompanyRole = { id: number; name: string; photoUrl?: string | null };
type Employee = {
  id: number;
  employeeNumber: string;
  name: string;
  loginRole: string;
  companyRole?: CompanyRole | null;
};
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

export default function HrPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [entries, setEntries] = useState<Attendance[]>([]);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [inTime, setInTime] = useState("09:00");
  const [outTime, setOutTime] = useState("18:00");
  const [leaveReason, setLeaveReason] = useState("");
  const [fromDate, setFromDate] = useState("2026-01-19");
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [monthSummary, setMonthSummary] = useState<MonthSummary | null>(null);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [dailyPhotos, setDailyPhotos] = useState<DailyGroupPhoto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function loadEmployees() {
    const res = await api.get<Employee[]>("/api/hr/employees");
    setEmployees(res.data);
    if (res.data.length && employeeId === "") setEmployeeId(res.data[0].id);
  }

  async function loadSettings() {
    const res = await api.get<AttendanceSettings>("/api/settings/attendance");
    setSettings(res.data);
    setInTime(res.data.defaultInTime?.slice(0, 5) || "09:00");
    setOutTime(res.data.defaultOutTime?.slice(0, 5) || "18:00");
  }

  async function loadHolidays(m: string) {
    const res = await api.get<Holiday[]>("/api/holidays", { params: { month: m } });
    setHolidays(res.data);
  }

  async function loadDailyPhotos(m: string) {
    const res = await api.get<DailyGroupPhoto[]>("/api/daily-group-photos", { params: { month: m } });
    setDailyPhotos(res.data);
  }

  async function loadAttendance(empId: number, m: string) {
    const res = await api.get<Attendance[]>("/api/hr/attendance", { params: { employeeId: empId, month: m } });
    setEntries(res.data);
  }

  async function loadSummary(empId: number, m: string) {
    const res = await api.get<MonthSummary>("/api/hr/attendance/summary", { params: { employeeId: empId, month: m } });
    setMonthSummary(res.data);
  }

  useEffect(() => {
    Promise.all([loadEmployees(), loadSettings()]).catch((e) => setErr(e?.response?.data?.error ?? "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (employeeId === "") return;
    Promise.all([loadAttendance(employeeId, month), loadSummary(employeeId, month)]).catch((e) =>
      setErr(e?.response?.data?.error ?? "Failed to load attendance"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, month]);

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
    let nextDate = date;

    if (!date.startsWith(`${month}-`)) {
      nextDate = monthSummary ? monthSummary.fromDate : monthStart;
    }

    if (monthSummary) {
      if (nextDate < monthSummary.fromDate) nextDate = monthSummary.fromDate;
      if (nextDate > monthEnd) nextDate = monthEnd;
    } else {
      if (nextDate < monthStart) nextDate = monthStart;
      if (nextDate > monthEnd) nextDate = monthEnd;
    }

    if (nextDate !== date) {
      setDate(nextDate);
    }
  }, [date, month, monthSummary]);

  async function mark() {
    if (employeeId === "") return;
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/hr/attendance", {
        employeeId,
        date,
        inTime: inTime || null,
        outTime: outTime || null,
        leaveReason: leaveReason.trim() || null,
      });
      setOk("Attendance saved");
      await Promise.all([loadAttendance(employeeId, month), loadSummary(employeeId, month)]);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Save failed");
    }
  }

  async function markLeave() {
    if (employeeId === "") return;
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/hr/attendance", {
        employeeId,
        date,
        inTime: null,
        outTime: null,
        leaveReason: leaveReason.trim(),
      });
      setOk("Marked Leave (L)");
      await Promise.all([loadAttendance(employeeId, month), loadSummary(employeeId, month)]);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Mark leave failed");
    }
  }

  async function bulkUpdate() {
    if (employeeId === "") return;
    setErr(null);
    setOk(null);
    try {
      const res = await api.post<{ updatedDays: number }>("/api/hr/attendance/range", {
        employeeId,
        fromDate,
        toDate,
        inTime: inTime || null,
        outTime: outTime || null,
      });
      setOk(`Bulk updated ${res.data.updatedDays} working days`);
      await Promise.all([loadAttendance(employeeId, month), loadSummary(employeeId, month)]);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Bulk update failed");
    }
  }

  async function uploadCompanyRolePhoto(companyRoleId: number, file: File) {
    setErr(null);
    setOk(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/api/hr/company-roles/${companyRoleId}/photo`, fd);
      setOk("Company role photo uploaded");
      await loadEmployees();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Upload failed");
    }
  }

  async function uploadDailyGroupPhoto(file: File) {
    setErr(null);
    setOk(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post<DailyGroupPhoto>(`/api/hr/daily-group-photos?date=${date}`, fd);
      setOk("Daily group photo uploaded");
      await loadDailyPhotos(month);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Upload daily photo failed");
    }
  }

  const selected = employees.find((e) => e.id === employeeId);
  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.employeeNumber.toLowerCase().includes(q));
  }, [employees, search]);

  const selectedEntry = entries.find((e) => e.date === date);
  const selectedDaily = dailyPhotos.find((p) => p.date === date);
  const mins = monthSummary?.totalWorkedMinutes ?? 0;
  const wh = Math.floor(mins / 60);
  const wm = mins % 60;

  useEffect(() => {
    if (!settings) return;
    if (selectedEntry?.inTime) setInTime(selectedEntry.inTime.slice(0, 5));
    else setInTime(settings.defaultInTime?.slice(0, 5) || "09:00");

    if (selectedEntry?.outTime) setOutTime(selectedEntry.outTime.slice(0, 5));
    else setOutTime(settings.defaultOutTime?.slice(0, 5) || "18:00");
  }, [selectedEntry, settings]);

  useEffect(() => {
    if (!selectedEntry || selectedEntry.status === "PRESENT" || selectedEntry.status === "HALF_DAY") {
      setLeaveReason("");
      return;
    }
    setLeaveReason(selectedEntry.leaveReason?.trim() ?? "");
  }, [selectedEntry]);

  return (
    <Layout title="HR Dashboard">
      <div className="grid gap-6">
        {err ? <Alert severity="error">{err}</Alert> : null}
        {ok ? <Alert severity="success">{ok}</Alert> : null}

        <PageHeader
          eyebrow="HR workspace"
          title="Mark attendance"
          subtitle="Search an employee, pick a date, then Save (P/HD/L by hours) or mark Leave (L). Upload one daily group photo for all members."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Team members
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950 }}>{employees.length}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Employees available for marking</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Working days
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950 }}>{monthSummary?.workingDays ?? "-"}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>For {month}</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Present days
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950, color: "success.main" }}>{monthSummary?.presentDays ?? "-"}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Selected employee monthly total</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Daily photo
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950, color: selectedDaily ? "warning.main" : "text.primary" }}>
              {selectedDaily ? "Yes" : "No"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Uploaded for {date}</Typography>
          </AppCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 grid gap-6">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Mark / Update Attendance
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Status becomes <b>P</b> if worked time is <b>{Math.round((settings?.fullDayMinutes ?? 480) / 60)}h</b> or more,
                <b> HD</b> if worked time is <b>{Math.round((settings?.halfDayMinutes ?? 240) / 60)}h</b> or more, else <b>L</b>.
              </Typography>

              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }}>
                <TextField
                  label="Search employee"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type name or employee number"
                />
                <Autocomplete
                  options={options}
                  value={selected ?? null}
                  getOptionLabel={(opt) => `${opt.name} (${opt.employeeNumber})`}
                  onChange={(_, v) => setEmployeeId(v ? v.id : "")}
                  renderOption={(props, opt) => (
                    <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                      <Avatar src={opt.companyRole?.photoUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                        {opt.name[0]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {opt.name}
                        </Typography>
                        <Typography sx={{ opacity: 0.7, fontSize: 12, lineHeight: 1.1 }}>
                          {opt.employeeNumber} | {opt.companyRole?.name ?? "No company role"} | {opt.loginRole}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => <TextField {...params} label="Employee" />}
                />

                {selected ? (
                  <AppCard contentSx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={selected.companyRole?.photoUrl ?? undefined} sx={{ width: 52, height: 52 }}>
                        {selected.name[0]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 950 }}>{selected.name}</Typography>
                        <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
                          ID: <b>{selected.id}</b> | Emp#: <b>{selected.employeeNumber}</b>
                        </Typography>
                        <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
                          Company role: <b>{selected.companyRole?.name ?? "--"}</b>
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={!selected.companyRole?.id}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Upload role photo
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            const rid = selected.companyRole?.id;
                            if (f && rid) uploadCompanyRolePhoto(rid, f);
                          }}
                        />
                      </Button>
                    </Box>
                  </AppCard>
                ) : null}

                <Divider />

                <TextField
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: monthSummary?.fromDate,
                    max: dayjs(`${month}-01`).endOf("month").format("YYYY-MM-DD"),
                  }}
                />
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
                  <TextField
                    label="In time"
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Out time"
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <TextField
                  label="Leave reason (required for L)"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Sick leave, personal work, emergency..."
                  multiline
                  minRows={2}
                />

                <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
                  Defaults set by Admin: <b>{settings?.defaultInTime?.slice(0, 5) ?? "09:00"}</b> {"->"}{" "}
                  <b>{settings?.defaultOutTime?.slice(0, 5) ?? "18:00"}</b>
                </Typography>

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Button variant="contained" onClick={mark} disabled={employeeId === "" || !date}>
                    Save (P/HD/L by hours)
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={markLeave}
                    disabled={employeeId === "" || !date || !leaveReason.trim()}
                  >
                    Mark Leave (L)
                  </Button>
                </Box>

                <Divider />

                <Button
                  variant="outlined"
                  component="label"
                  disabled={!date}
                  sx={{ justifyContent: "space-between" }}
                >
                  <span>Upload daily group photo (for {date})</span>
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadDailyGroupPhoto(f);
                    }}
                  />
                </Button>

                {selectedDaily?.photoUrl ? (
                  <Box
                    component="img"
                    alt="Daily group"
                    src={selectedDaily.photoUrl}
                    sx={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 3,
                      border: "1px solid rgba(15,23,42,0.08)",
                    }}
                  />
                ) : (
                  <Typography sx={{ opacity: 0.65, fontSize: 12 }}>
                    No daily photo uploaded for this date.
                  </Typography>
                )}
              </Box>
            </AppCard>

            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Bulk update (Jan 19 to till date)
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Applies the same in/out time to a range. Skips weekends + holidays.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }}>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
                  <TextField
                    label="From date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="To date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Button variant="contained" onClick={bulkUpdate} disabled={employeeId === "" || !fromDate || !toDate}>
                  Apply range
                </Button>
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-7 grid gap-6">
            <AppCard>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Monthly view
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

              {monthSummary ? (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "rgba(255,255,255,0.6)",
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ opacity: 0.7, fontSize: 12 }}>Working days</Typography>
                    <Typography sx={{ fontWeight: 950, fontSize: 18 }}>{monthSummary.workingDays}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ opacity: 0.7, fontSize: 12 }}>Present</Typography>
                    <Typography sx={{ fontWeight: 950, fontSize: 18, color: "success.main" }}>
                      {monthSummary.presentDays}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ opacity: 0.7, fontSize: 12 }}>Absent/Leave</Typography>
                    <Typography sx={{ fontWeight: 950, fontSize: 18, color: "error.main" }}>
                      {monthSummary.leaveDays}
                    </Typography>
                  </Box>
                  <Typography sx={{ gridColumn: "1 / -1", opacity: 0.75, fontSize: 12 }}>
                    {monthSummary.fromDate <= monthSummary.toDate
                      ? `Range: ${monthSummary.fromDate} -> ${monthSummary.toDate}`
                      : `Attendance starts on ${monthSummary.fromDate}`}{" "}
                    | Worked: <b>{wh}h {wm}m</b>
                  </Typography>
                </Box>
              ) : null}

              <MonthCalendar month={month} statusByDate={statusByDate} selectedDate={date} onDayClick={(d) => setDate(d)} />

              <Typography sx={{ mt: 2, opacity: 0.72, fontSize: 12 }}>
                Tip: click a date in the calendar to fill the form. Purple = Holiday (H).
              </Typography>
            </AppCard>

            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Entries ({entries.length})
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Saved attendance for the selected employee in <b>{month}</b>.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "grid", gap: 1 }}>
                {entries
                  .slice()
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((e) => {
                    const letter = e.status === "PRESENT" ? "P" : e.status === "HALF_DAY" ? "HD" : "L";
                    const m = e.workedMinutes ?? 0;
                    const hh = Math.floor(m / 60);
                    const mm = m % 60;
                    return (
                      <Box
                        key={e.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.2,
                          borderRadius: 3,
                          border: "1px solid rgba(15,23,42,0.08)",
                          background: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 950,
                            width: 34,
                            textAlign: "center",
                            color: letter === "P" ? "success.main" : letter === "HD" ? "warning.main" : "error.main",
                          }}
                        >
                          {letter}
                        </Typography>
                        <Typography sx={{ fontWeight: 900, width: 110 }}>{e.date}</Typography>
                        <Typography sx={{ opacity: 0.85, width: 170 }}>
                          {e.inTime ?? "--"} {"->"} {e.outTime ?? "--"}
                        </Typography>
                        <Typography sx={{ opacity: 0.85 }}>
                          {hh}h {mm}m
                        </Typography>
                        {e.status === "LEAVE" ? (
                          <Typography sx={{ opacity: 0.75, fontSize: 12, marginLeft: "auto" }}>
                            Reason: <b>{e.leaveReason?.trim() || "--"}</b>
                          </Typography>
                        ) : null}
                      </Box>
                    );
                  })}
                {!entries.length ? <Typography sx={{ opacity: 0.7, fontSize: 13 }}>No entries.</Typography> : null}
              </Box>
            </AppCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
