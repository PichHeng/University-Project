import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, FileSpreadsheet, FileText, RefreshCcw, Search } from "lucide-react";

import { getMyEnrolledCourses } from "@/services/enrollmentService";
import { exportToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function badgeClass(status) {
    if (status === "Active") return "sms-badge-active";
    if (status === "Completed") return "sms-badge-info";
    return "sms-badge-inactive";
}

function StudentCourses() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMyEnrolledCourses();
            setCourses(response.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load your enrolled courses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCourses();
    }, [loadCourses]);

    const visibleCourses = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return courses.filter((course) => !keyword ||
            [course.courseCode, course.courseName, course.teacher, course.department, course.semester, course.enrollmentStatus]
                .some((value) => value?.toLowerCase().includes(keyword)));
    }, [courses, search]);

    function exportCourses() {
        exportToCsv("my-courses.csv", visibleCourses, [
            { header: "Course Code", key: "courseCode" },
            { header: "Course Name", key: "courseName" },
            { header: "Department", key: "department" },
            { header: "Teacher", key: "teacher" },
            { header: "Credit", key: "credit" },
            { header: "Semester", key: "semester" },
            { header: "Enrolled", key: "enrollmentDate" },
            { header: "Status", key: "enrollmentStatus" },
        ]);
    }

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Student</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">My Courses</h1><p className="mt-2 text-[var(--sms-muted)]">Your current course enrollments from the academic database.</p></div>
            <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={loadCourses} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button><Button variant="outline" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />PDF</Button><Button variant="outline" onClick={exportCourses}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button></div>
        </div>
        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}
        <section className="sms-card overflow-hidden">
            <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center"><div><h2 className="font-semibold text-[var(--sms-ink)]">Enrolled Courses</h2><p className="text-sm text-[var(--sms-muted)]">{visibleCourses.length} course(s)</p></div><div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your courses..." /></div></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Department</TableHead><TableHead>Teacher</TableHead><TableHead>Credit</TableHead><TableHead>Semester</TableHead><TableHead>Enrolled</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
                {loading ? <TableRow><TableCell colSpan={8} className="py-12 text-center text-[var(--sms-muted)]">Loading enrolled courses…</TableCell></TableRow> : visibleCourses.length ? visibleCourses.map((course) => <TableRow key={course.enrollmentId}><TableCell><p className="font-medium text-[var(--sms-ink)]">{course.courseName}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{course.courseCode}</p></TableCell><TableCell>{course.department}</TableCell><TableCell>{course.teacher}</TableCell><TableCell>{course.credit}</TableCell><TableCell>{course.semester || "—"}</TableCell><TableCell>{course.enrollmentDate || "—"}</TableCell><TableCell><Badge variant="outline" className={badgeClass(course.enrollmentStatus)}>{course.enrollmentStatus}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="icon" aria-label={`View ${course.courseName}`} onClick={() => setSelectedCourse(course)}><Eye className="h-4 w-4" /></Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={8} className="py-12 text-center text-[var(--sms-muted)]"><BookOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />You are not enrolled in any courses yet.</TableCell></TableRow>}
            </TableBody></Table></div>
        </section>
        <Dialog open={Boolean(selectedCourse)} onOpenChange={(open) => !open && setSelectedCourse(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Course Details</DialogTitle></DialogHeader>{selectedCourse && <div className="grid gap-4 sm:grid-cols-2"><Info label="Course" value={`${selectedCourse.courseCode} — ${selectedCourse.courseName}`} /><Info label="Department" value={selectedCourse.department} /><Info label="Teacher" value={selectedCourse.teacher} /><Info label="Credit / Semester" value={`${selectedCourse.credit} credits · ${selectedCourse.semester || "Not specified"}`} /><Info label="Enrollment Date" value={selectedCourse.enrollmentDate || "—"} /><Info label="Enrollment Status" value={selectedCourse.enrollmentStatus} /></div>}</DialogContent></Dialog>
    </>;
}

function Info({ label, value }) {
    return <div className="min-w-0 rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">{label}</p><p className="mt-1 break-words font-medium text-[var(--sms-ink)]">{value}</p></div>;
}

export default StudentCourses;
