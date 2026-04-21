import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import AppCard from "../components/AppCard";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

type CompanyRole = { id: number; name: string; photoUrl?: string | null };
type Employee = {
  id: number;
  employeeNumber: string;
  name: string;
  loginRole: string;
  companyRole?: CompanyRole | null;
};

type AttendanceSettings = {
  defaultInTime: string;
  defaultOutTime: string;
  weekendDays: string;
  fullDayMinutes: number;
  halfDayMinutes: number;
};
type Holiday = { id: number; date: string; name: string };
type CompanyProfile = { groupPhotoUrl?: string | null };

export default function AdminPage() {
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings | null>(null);
  const [defaultIn, setDefaultIn] = useState("09:00");
  const [defaultOut, setDefaultOut] = useState("18:00");
  const [fullDayMinutes, setFullDayMinutes] = useState(480);
  const [halfDayMinutes, setHalfDayMinutes] = useState(240);
  const [weekendDays, setWeekendDays] = useState<string[]>(["SUNDAY"]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [roleName, setRoleName] = useState("");

  const [hrUsername, setHrUsername] = useState("");
  const [hrPassword, setHrPassword] = useState("");

  const [empNo, setEmpNo] = useState("");
  const [empName, setEmpName] = useState("");
  const [empUsername, setEmpUsername] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empRoleId, setEmpRoleId] = useState<number | "">("");

  const [holidayMonth, setHolidayMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayDate, setHolidayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [holidayName, setHolidayName] = useState("Festival");
  const [companyPhotoUrl, setCompanyPhotoUrl] = useState<string | null>(null);

  const roleById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);
  const weekendCount = weekendDays.length;

  async function refresh() {
    const [r, e] = await Promise.all([
      api.get<CompanyRole[]>("/api/admin/company-roles"),
      api.get<Employee[]>("/api/admin/employees"),
    ]);
    setRoles(r.data);
    setEmployees(e.data);
  }

  async function loadSettings() {
    const res = await api.get<AttendanceSettings>("/api/admin/settings/attendance");
    setAttendanceSettings(res.data);
    setDefaultIn(res.data.defaultInTime?.slice(0, 5) || "09:00");
    setDefaultOut(res.data.defaultOutTime?.slice(0, 5) || "18:00");
    setFullDayMinutes(res.data.fullDayMinutes ?? 480);
    setHalfDayMinutes(res.data.halfDayMinutes ?? 240);
    const wd = (res.data.weekendDays ?? "SUNDAY")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    setWeekendDays(wd.length ? wd : ["SUNDAY"]);
  }

  useEffect(() => {
    Promise.all([refresh(), loadSettings()]).catch((e) => setErr(e?.response?.data?.error ?? "Failed to load"));
  }, []);

  useEffect(() => {
    api
      .get<CompanyProfile>("/api/company")
      .then((r) => setCompanyPhotoUrl(r.data.groupPhotoUrl ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get<Holiday[]>("/api/admin/holidays", { params: { month: holidayMonth } })
      .then((r) => setHolidays(r.data))
      .catch(() => {});
  }, [holidayMonth]);

  async function createCompanyRole() {
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/admin/company-roles", { name: roleName });
      setRoleName("");
      setOk("Company role created");
      await refresh();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Create role failed");
    }
  }

  async function uploadRolePhoto(roleId: number, file: File) {
    setErr(null);
    setOk(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/api/admin/company-roles/${roleId}/photo`, fd);
      setOk("Role photo uploaded");
      await refresh();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Upload failed");
    }
  }

  async function createHr() {
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/admin/hr", { username: hrUsername, password: hrPassword });
      setHrUsername("");
      setHrPassword("");
      setOk("HR created");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Create HR failed");
    }
  }

  async function createEmployee() {
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/admin/employees", {
        employeeNumber: empNo,
        name: empName,
        username: empUsername,
        password: empPassword,
        companyRoleId: empRoleId,
      });
      setEmpNo("");
      setEmpName("");
      setEmpUsername("");
      setEmpPassword("");
      setEmpRoleId("");
      setOk("Employee created");
      await refresh();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Create employee failed");
    }
  }

  async function saveSettings() {
    setErr(null);
    setOk(null);
    try {
      const res = await api.post<AttendanceSettings>("/api/admin/settings/attendance", {
        defaultInTime: `${defaultIn}:00`.slice(0, 8),
        defaultOutTime: `${defaultOut}:00`.slice(0, 8),
        weekendDays: weekendDays.join(","),
        fullDayMinutes,
        halfDayMinutes,
      });
      setAttendanceSettings(res.data);
      setOk("Attendance defaults saved");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Save settings failed");
    }
  }

  async function addHoliday() {
    setErr(null);
    setOk(null);
    try {
      await api.post("/api/admin/holidays", { date: holidayDate, name: holidayName });
      setOk("Holiday saved");
      const r = await api.get<Holiday[]>("/api/admin/holidays", { params: { month: holidayMonth } });
      setHolidays(r.data);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Save holiday failed");
    }
  }

  async function deleteHoliday(id: number) {
    setErr(null);
    setOk(null);
    try {
      await api.delete(`/api/admin/holidays/${id}`);
      setOk("Holiday deleted");
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Delete holiday failed");
    }
  }

  async function uploadCompanyPhoto(file: File) {
    setErr(null);
    setOk(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ groupPhotoUrl: string }>("/api/admin/company/photo", fd);
      setCompanyPhotoUrl(res.data.groupPhotoUrl);
      setOk("Company group photo uploaded");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Upload company photo failed");
    }
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="grid gap-6">
        {err ? <Alert severity="error">{err}</Alert> : null}
        {ok ? <Alert severity="success">{ok}</Alert> : null}

        <PageHeader
          eyebrow="Admin workspace"
          title="Company setup"
          subtitle="Create roles and logins, configure default time and weekends, manage holidays (H), and upload the group photo shown to everyone."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Company roles
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950 }}>{roles.length}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Defined company role profiles</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Employees
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950 }}>{employees.length}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Accounts created in the system</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Holidays
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950, color: "secondary.main" }}>{holidays.length}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Saved for {holidayMonth}</Typography>
          </AppCard>
          <AppCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.1, color: "text.secondary" }}>
              Weekend days
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 950 }}>{weekendCount}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{weekendDays.join(", ") || "None selected"}</Typography>
          </AppCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Company roles
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Create roles like Developer / Manager and optionally upload a role photo.
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                <TextField
                  label="Role name"
                  fullWidth
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
                <Button variant="contained" onClick={createCompanyRole} disabled={!roleName.trim()}>
                  Create
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {roles.map((r) => (
                  <AppCard key={r.id} contentSx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={r.photoUrl ?? undefined} sx={{ width: 52, height: 52 }}>
                        {r.name[0]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 950,
                            lineHeight: 1.1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.name}
                        </Typography>
                        <Typography sx={{ opacity: 0.7, fontSize: 12 }}>ID: {r.id}</Typography>
                      </Box>
                      <Button variant="outlined" component="label">
                        Upload
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadRolePhoto(r.id, f);
                          }}
                        />
                      </Button>
                    </Box>
                  </AppCard>
                ))}
                {!roles.length ? (
                  <Typography sx={{ opacity: 0.7, fontSize: 13 }}>No roles yet.</Typography>
                ) : null}
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-6 grid gap-6">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Company group photo
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                One photo for all members. Employees will see this when a date has no daily photo.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                <Avatar src={companyPhotoUrl ?? undefined} sx={{ width: 64, height: 64 }}>
                  C
                </Avatar>
                <Button variant="outlined" component="label">
                  Upload group photo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadCompanyPhoto(f);
                    }}
                  />
                </Button>
              </Box>
            </AppCard>

            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Holidays (H)
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Add festival holidays. Holidays are purple (H) and excluded from working-day counts.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }}>
                <TextField
                  label="Month"
                  type="month"
                  value={holidayMonth}
                  onChange={(e) => setHolidayMonth(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 220 }}
                />
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
                  <TextField
                    label="Date"
                    type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField label="Name" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} />
                </Box>
                <Button variant="outlined" onClick={addHoliday} disabled={!holidayDate || !holidayName.trim()}>
                  Save holiday
                </Button>
                <Divider />
                <Box sx={{ display: "grid", gap: 1 }}>
                  {holidays
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((h) => (
                      <Box
                        key={h.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.2,
                          borderRadius: 3,
                          border: "1px solid rgba(15,23,42,0.08)",
                          background: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <Typography sx={{ fontWeight: 950, color: "secondary.main", width: 18 }}>
                          H
                        </Typography>
                        <Typography sx={{ fontWeight: 900, width: 110 }}>{h.date}</Typography>
                        <Typography sx={{ flexGrow: 1, opacity: 0.9 }}>{h.name}</Typography>
                        <Button color="error" variant="text" onClick={() => deleteHoliday(h.id)}>
                          Delete
                        </Button>
                      </Box>
                    ))}
                  {!holidays.length ? (
                    <Typography sx={{ opacity: 0.7, fontSize: 13 }}>No holidays for this month.</Typography>
                  ) : null}
                </Box>
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-4">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Create HR login
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                HR marks attendance and uploads daily group photos.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }}>
                <TextField label="HR username" value={hrUsername} onChange={(e) => setHrUsername(e.target.value)} />
                <TextField
                  label="HR password"
                  type="password"
                  value={hrPassword}
                  onChange={(e) => setHrPassword(e.target.value)}
                />
                <Button variant="contained" onClick={createHr} disabled={!hrUsername.trim() || !hrPassword.trim()}>
                  Create HR
                </Button>
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-8">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Attendance defaults
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Admin sets default in/out time and weekly holidays (weekends). HR uses these defaults.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }}>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
                  <TextField
                    label="Default in time"
                    type="time"
                    value={defaultIn}
                    onChange={(e) => setDefaultIn(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Default out time"
                    type="time"
                    value={defaultOut}
                    onChange={(e) => setDefaultOut(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
                  <TextField
                    label="Full day minutes"
                    type="number"
                    value={fullDayMinutes}
                    onChange={(e) => setFullDayMinutes(Math.max(1, Number(e.target.value || 0)))}
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Half day minutes"
                    type="number"
                    value={halfDayMinutes}
                    onChange={(e) => setHalfDayMinutes(Math.max(1, Number(e.target.value || 0)))}
                    inputProps={{ min: 1 }}
                  />
                </Box>
                <Typography sx={{ opacity: 0.72, fontSize: 12 }}>
                  Example: Full day <b>480</b> = 8h, Half day <b>240</b> = 4h.
                </Typography>
                <Autocomplete
                  multiple
                  options={["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]}
                  value={weekendDays}
                  onChange={(_, v) => setWeekendDays(v)}
                  renderInput={(params) => <TextField {...params} label="Weekly holidays (weekend days)" />}
                />
                <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", alignItems: "center" }}>
                  <Button variant="contained" onClick={saveSettings}>
                    Save defaults
                  </Button>
                  {attendanceSettings ? (
                    <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
                      Current: {attendanceSettings.defaultInTime?.slice(0, 5)} {"->"}{" "}
                      {attendanceSettings.defaultOutTime?.slice(0, 5)} (Weekend: {attendanceSettings.weekendDays}) |{" "}
                      Full: {attendanceSettings.fullDayMinutes}m, Half: {attendanceSettings.halfDayMinutes}m
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-6">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Create employee
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Create employee login and assign a company role.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }} className="sm:grid-cols-2">
                <TextField label="Employee number" value={empNo} onChange={(e) => setEmpNo(e.target.value)} />
                <TextField label="Employee name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                <TextField label="Login username" value={empUsername} onChange={(e) => setEmpUsername(e.target.value)} />
                <TextField
                  label="Login password"
                  type="password"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                />
                <TextField
                  select
                  label="Company role"
                  value={empRoleId}
                  onChange={(e) => setEmpRoleId(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={{ gridColumn: "1 / -1" }}
                >
                  <MenuItem value="">Select role</MenuItem>
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  onClick={createEmployee}
                  sx={{ gridColumn: "1 / -1" }}
                  disabled={
                    !empNo.trim() || !empName.trim() || !empUsername.trim() || !empPassword.trim() || empRoleId === ""
                  }
                >
                  Create employee
                </Button>
              </Box>
            </AppCard>
          </div>

          <div className="lg:col-span-12">
            <AppCard>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Employees ({employees.length})
              </Typography>
              <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
                Quick list of all employees and their assigned company roles.
              </Typography>
              <Box sx={{ display: "grid", gap: 1, mt: 2 }}>
                {employees.map((e) => {
                  const r = e.companyRole?.id ? roleById.get(e.companyRole.id) : e.companyRole;
                  return (
                    <Box
                      key={e.id}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 3,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Avatar src={r?.photoUrl ?? undefined}>{e.name[0]}</Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                          {e.name} <span style={{ opacity: 0.6, fontWeight: 700 }}>({e.employeeNumber})</span>
                        </Typography>
                        <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
                          {r?.name ?? "No role"} | {e.loginRole}
                        </Typography>
                      </Box>
                      <Typography sx={{ opacity: 0.7, fontSize: 12 }}>ID: {e.id}</Typography>
                    </Box>
                  );
                })}
                {!employees.length ? (
                  <Typography sx={{ opacity: 0.7, fontSize: 13 }}>No employees yet.</Typography>
                ) : null}
              </Box>
            </AppCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
