import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, FileSpreadsheet, FileText, RefreshCcw, Search, Users } from "lucide-react";

import { getMyTeacherCourses } from "@/services/courseService";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function normalizeCourse(course) {
    return {
        ...course,
        id: course.course_id ?? course.id,
        courseCode: course.course_code ?? course.courseCode ?? "",
        courseName: course.course_name ?? course.courseName ?? "",
        department: course.department_name ?? course.department ?? "No Department",
        departmentCode: course.department_code ?? course.departmentCode ?? "",
        enrolledStudents: Number(course.enrolled_student_count ?? course.enrolledStudentCount ?? 0),
        credit: Number(course.credit || 0),
        semester: course.semester || "N/A",
        description: course.description || "",
        status: String(course.status || "active").toLowerCase(),
    };
}

function TeacherCourses() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMyTeacherCourses();
            setCourses((response.data || []).map(normalizeCourse));
        } catch (requestError) {
            setCourses([]);
            setError(requestError.response?.data?.message || "Failed to load your courses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading API data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCourses();
    }, [loadCourses]);

    const filteredCourses = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return courses.filter((course) => !keyword || [course.courseCode, course.courseName, course.department, course.semester, course.status].some((value) => String(value).toLowerCase().includes(keyword)));
    }, [courses, search]);

    const enrollmentCount = courses.reduce((sum, course) => sum + course.enrolledStudents, 0);
    const credits = courses.reduce((sum, course) => sum + course.credit, 0);

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Teacher</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">My Courses</h1><p className="mt-2 text-[var(--sms-muted)]">Courses currently assigned to your teacher account.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={loadCourses} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button><Button type="button" variant="outline" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />PDF</Button><Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("teacher-courses.csv")}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button></div></div>
        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}
        <section className="mb-8 grid gap-4 md:grid-cols-3"><div className="sms-card p-5"><BookOpen className="mb-3 h-5 w-5 text-[var(--sms-gold)]" /><p className="text-3xl font-bold">{courses.length}</p><p className="text-xs uppercase text-[var(--sms-muted)]">Assigned Courses</p></div><div className="sms-card p-5"><Users className="mb-3 h-5 w-5 text-[var(--sms-gold)]" /><p className="text-3xl font-bold">{enrollmentCount}</p><p className="text-xs uppercase text-[var(--sms-muted)]">Active Enrollments</p></div><div className="sms-card p-5"><BookOpen className="mb-3 h-5 w-5 text-[var(--sms-gold)]" /><p className="text-3xl font-bold">{credits}</p><p className="text-xs uppercase text-[var(--sms-muted)]">Total Credits</p></div></section>
        <section className="sms-card overflow-hidden"><div className="sms-section-header flex items-center justify-between gap-4 px-5 py-4"><div><h2 className="font-semibold">Course Records</h2><p className="text-sm text-[var(--sms-muted)]">{filteredCourses.length} course(s)</p></div><div className="relative w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses..." /></div></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Course</TableHead><TableHead>Department</TableHead><TableHead>Semester</TableHead><TableHead>Credits</TableHead><TableHead>Students</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Details</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={8} className="py-12 text-center text-[var(--sms-muted)]">Loading courses…</TableCell></TableRow> : filteredCourses.length ? filteredCourses.map((course) => <TableRow key={course.id}><TableCell className="font-mono text-xs">{course.courseCode}</TableCell><TableCell className="font-medium">{course.courseName}</TableCell><TableCell>{course.departmentCode ? `${course.departmentCode} - ` : ""}{course.department}</TableCell><TableCell>{course.semester}</TableCell><TableCell>{course.credit}</TableCell><TableCell>{course.enrolledStudents}</TableCell><TableCell><Badge variant="outline" className={course.status === "active" ? "sms-badge-active" : "sms-badge-inactive"}>{course.status}</Badge></TableCell><TableCell className="text-right"><Button type="button" variant="outline" size="icon" onClick={() => setSelectedCourse(course)} aria-label={`View ${course.courseName}`}><Eye className="h-4 w-4" /></Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={8} className="py-12 text-center text-[var(--sms-muted)]">No assigned courses found.</TableCell></TableRow>}</TableBody></Table></div></section>
        <Dialog open={Boolean(selectedCourse)} onOpenChange={(open) => !open && setSelectedCourse(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Course Details</DialogTitle></DialogHeader>{selectedCourse && <div className="space-y-3"><p className="font-mono text-sm">{selectedCourse.courseCode}</p><h2 className="text-2xl font-bold">{selectedCourse.courseName}</h2><p>Department: {selectedCourse.department}</p><p>Semester: {selectedCourse.semester}</p><p>Credits: {selectedCourse.credit}</p><p>Active enrollments: {selectedCourse.enrolledStudents}</p><p className="text-[var(--sms-muted)]">{selectedCourse.description || "No description provided."}</p><p>Schedule: N/A</p><p>Room: N/A</p></div>}</DialogContent></Dialog>
    </>;
}

export default TeacherCourses;
