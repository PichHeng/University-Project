import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText, RefreshCcw, Search } from "lucide-react";

import { getAttendance } from "@/services/attendanceService";
import { getMyEnrolledCourses } from "@/services/enrollmentService";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function StudentAttendance() {
    const [records, setRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseFilter, setCourseFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [attendanceResponse, courseResponse] = await Promise.all([getAttendance(), getMyEnrolledCourses()]);
            setRecords(attendanceResponse.data || []);
            setCourses(courseResponse.data || []);
        } catch (requestError) {
            setRecords([]);
            setCourses([]);
            setError(requestError.response?.data?.message || "Failed to load attendance.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading API data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return records.filter((record) => (courseFilter === "all" || String(record.courseId) === courseFilter) && (!keyword || [record.courseCode, record.courseName, record.status, record.remark].some((value) => String(value || "").toLowerCase().includes(keyword))));
    }, [courseFilter, records, search]);
    const present = filtered.filter((row) => String(row.status).toLowerCase() === "present").length;
    const late = filtered.filter((row) => String(row.status).toLowerCase() === "late").length;
    const rate = filtered.length ? Math.round(((present + late) / filtered.length) * 100) : 0;

    return <>
        <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Student</p><h1 className="mt-2 text-3xl font-bold">My Attendance</h1><p className="mt-2 text-[var(--sms-muted)]">Attendance recorded for your enrolled courses.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={loadData} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button><Button type="button" variant="outline" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />PDF</Button><Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("student-attendance.csv")}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button></div></div>
        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}
        <section className="mb-6 grid gap-4 md:grid-cols-3"><div className="sms-card p-5"><p className="text-3xl font-bold">{filtered.length}</p><p className="text-xs uppercase text-[var(--sms-muted)]">Records</p></div><div className="sms-card p-5"><p className="text-3xl font-bold">{present + late}</p><p className="text-xs uppercase text-[var(--sms-muted)]">Attended</p></div><div className="sms-card p-5"><p className="text-3xl font-bold">{rate}%</p><p className="text-xs uppercase text-[var(--sms-muted)]">Attendance Rate</p></div></section>
        <section className="sms-input-panel mb-6 flex flex-col gap-3 p-5 md:flex-row"><Select value={courseFilter} onValueChange={setCourseFilter}><SelectTrigger className="md:w-72"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All courses</SelectItem>{courses.map((course) => <SelectItem key={course.id} value={String(course.id)}>{course.courseCode} - {course.courseName}</SelectItem>)}</SelectContent></Select><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attendance..." /></div></section>
        <section className="sms-card overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Course Code</TableHead><TableHead>Course Name</TableHead><TableHead>Status</TableHead><TableHead>Remark</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]">Loading attendance…</TableCell></TableRow> : filtered.length ? filtered.map((record) => { const status = String(record.status).toLowerCase(); return <TableRow key={record.attendanceId}><TableCell>{String(record.attendanceDate).slice(0, 10)}</TableCell><TableCell className="font-mono text-xs">{record.courseCode}</TableCell><TableCell>{record.courseName}</TableCell><TableCell><Badge variant="outline" className={status === "present" ? "sms-badge-active" : status === "late" ? "sms-badge-warning" : "sms-badge-inactive"}>{record.status}</Badge></TableCell><TableCell>{record.remark || "—"}</TableCell></TableRow>; }) : <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]">No attendance records found.</TableCell></TableRow>}</TableBody></Table></div></section>
    </>;
}

export default StudentAttendance;
