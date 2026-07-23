import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText, RefreshCcw, Save, Search } from "lucide-react";

import { getAttendance, saveAttendance } from "@/services/attendanceService";
import { getCourseStudents, getMyTeacherCourses } from "@/services/courseService";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function TeacherAttendance() {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(today);
    const [drafts, setDrafts] = useState({});
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadBaseData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [courseResponse, attendanceResponse] = await Promise.all([getMyTeacherCourses(), getAttendance()]);
            const courseRows = courseResponse.data || [];
            setCourses(courseRows);
            setAttendanceRecords(attendanceResponse.data || []);
            setSelectedCourse((current) => current || String(courseRows[0]?.course_id ?? ""));
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load attendance data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading API data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBaseData();
    }, [loadBaseData]);

    useEffect(() => {
        if (!selectedCourse) {
            return;
        }
        let cancelled = false;
        getCourseStudents(selectedCourse)
            .then((response) => {
                if (!cancelled) setStudents((response.data?.students || []).filter((student) => String(student.enrollmentStatus).toLowerCase() === "active"));
            })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message || "Failed to load enrolled students.");
            });
        return () => { cancelled = true; };
    }, [selectedCourse]);

    useEffect(() => {
        const nextDrafts = {};
        students.forEach((student) => {
            const existing = attendanceRecords.find((record) => Number(record.enrollmentId) === Number(student.enrollmentId) && String(record.attendanceDate).slice(0, 10) === attendanceDate);
            nextDrafts[student.enrollmentId] = { status: existing?.status || "", remark: existing?.remark || "" };
        });
        // Synchronizing form drafts to selected API records is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDrafts(nextDrafts);
    }, [attendanceDate, attendanceRecords, students]);

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return students.filter((student) => !keyword || [student.studentCode, student.studentName].some((value) => String(value).toLowerCase().includes(keyword)));
    }, [search, students]);

    async function handleSave() {
        const marked = students.filter((student) => drafts[student.enrollmentId]?.status);
        if (!marked.length) {
            setError("Mark at least one student before saving attendance.");
            return;
        }
        try {
            setSaving(true);
            setError("");
            setMessage("");
            await Promise.all(marked.map((student) => saveAttendance({ enrollmentId: student.enrollmentId, attendanceDate, status: drafts[student.enrollmentId].status, remark: drafts[student.enrollmentId].remark || null })));
            setMessage(`Saved attendance for ${marked.length} student(s).`);
            await loadBaseData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to save attendance.");
        } finally {
            setSaving(false);
        }
    }

    const updateDraft = (enrollmentId, field, value) => setDrafts((current) => ({ ...current, [enrollmentId]: { ...current[enrollmentId], [field]: value } }));

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Teacher</p><h1 className="mt-2 text-3xl font-bold">Attendance</h1><p className="mt-2 text-[var(--sms-muted)]">Record attendance for students actively enrolled in your real courses.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={loadBaseData} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button><Button type="button" variant="outline" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />PDF</Button><Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("teacher-attendance.csv")}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button></div></div>
        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}{message && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
        <section className="sms-input-panel mb-6 grid gap-4 p-5 md:grid-cols-3"><div className="space-y-2"><Label>Course</Label><Select value={selectedCourse || undefined} onValueChange={setSelectedCourse}><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courses.map((course) => <SelectItem key={course.course_id} value={String(course.course_id)}>{course.course_code} - {course.course_name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></div><div className="space-y-2"><Label>Search</Label><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Student code or name" /></div></div></section>
        <section className="sms-card overflow-hidden"><div className="sms-section-header flex items-center justify-between px-5 py-4"><div><h2 className="font-semibold">Enrolled Students</h2><p className="text-sm text-[var(--sms-muted)]">{filteredStudents.length} student(s)</p></div><Button type="button" onClick={handleSave} disabled={saving || !students.length}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save Attendance"}</Button></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>Remark</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={3} className="py-12 text-center text-[var(--sms-muted)]">Loading attendance…</TableCell></TableRow> : filteredStudents.length ? filteredStudents.map((student) => { const draft = drafts[student.enrollmentId] || { status: "", remark: "" }; return <TableRow key={student.enrollmentId}><TableCell><p className="font-mono text-xs">{student.studentCode}</p><p>{student.studentName}</p></TableCell><TableCell><Select value={draft.status || "unmarked"} onValueChange={(value) => updateDraft(student.enrollmentId, "status", value === "unmarked" ? "" : value)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unmarked">Not marked</SelectItem><SelectItem value="present">Present</SelectItem><SelectItem value="late">Late</SelectItem><SelectItem value="absent">Absent</SelectItem></SelectContent></Select>{draft.status && <Badge variant="outline" className="mt-2">{draft.status}</Badge>}</TableCell><TableCell><Input value={draft.remark} onChange={(event) => updateDraft(student.enrollmentId, "remark", event.target.value)} placeholder="Optional remark" /></TableCell></TableRow>; }) : <TableRow><TableCell colSpan={3} className="py-12 text-center text-[var(--sms-muted)]">No active enrolled students found for this course.</TableCell></TableRow>}</TableBody></Table></div></section>
    </>;
}

export default TeacherAttendance;
