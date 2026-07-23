import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCcw } from "lucide-react";

import { getStudentDashboard } from "@/services/dashboardService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const statDefinitions = [
    { label: "My Courses", key: "totalCourses" },
    { label: "Assignments", key: "totalAssignments" },
    { label: "Grades Recorded", key: "totalGrades" },
];

function statusClass(status) {
    return String(status).toLowerCase() === "active"
        ? "sms-badge-active"
        : "sms-badge-inactive";
}

function gradeClass(letter) {
    if (letter === "A") return "sms-badge-active";
    if (letter === "B" || letter === "C") return "sms-badge-info";
    if (letter === "D") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function formatScore(value) {
    const score = Number(value);
    return Number.isFinite(score)
        ? score.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "N/A";
}

function StudentDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getStudentDashboard();
            setDashboard(response.data || null);
        } catch (requestError) {
            setDashboard(null);
            setError(requestError.response?.data?.message || "Failed to load student dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [loadDashboard]);

    const student = dashboard?.student;
    const courses = dashboard?.enrolledCourses || [];
    const assignments = dashboard?.recentAssignments || [];
    const grades = dashboard?.grades || [];

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Student</p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">{student?.full_name || "Student Dashboard"}</h1>
                <p className="mt-2 text-[var(--sms-muted)]">{student ? `${student.student_code} · Year ${student.year_level || "N/A"} · ${student.department_name || "No Department"}` : "Your live academic summary."}</p>
            </div>
            <Button type="button" variant="outline" onClick={loadDashboard} disabled={loading}>
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
            </Button>
        </div>

        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-3">
            {statDefinitions.map((stat) => <div key={stat.key} className="sms-card p-5"><p className="text-3xl font-bold text-[var(--sms-ink)]">{loading ? "…" : dashboard?.[stat.key] ?? 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">{stat.label}</p></div>)}
        </section>

        {student && <section className="sms-card mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 p-5 text-sm text-[var(--sms-muted)]"><p><span className="font-semibold text-[var(--sms-ink)]">Code:</span> {student.student_code}</p><p><span className="font-semibold text-[var(--sms-ink)]">Gender:</span> <span className="capitalize">{student.gender || "N/A"}</span></p><p><span className="font-semibold text-[var(--sms-ink)]">Status:</span> <Badge variant="outline" className={statusClass(student.status)}>{student.status || "N/A"}</Badge></p></section>}

        <section className="sms-card mt-6 overflow-hidden">
            <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">My Courses</h2><p className="text-sm text-[var(--sms-muted)]">Active course enrollments</p></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Course Code</TableHead><TableHead>Course Name</TableHead><TableHead>Teacher</TableHead><TableHead>Semester</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                {loading ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading courses…</TableCell></TableRow>
                    : courses.length ? courses.map((course) => <TableRow key={course.course_code}><TableCell className="font-mono text-xs">{course.course_code}</TableCell><TableCell className="font-medium">{course.course_name}</TableCell><TableCell>{course.teacher_name || "Unassigned"}</TableCell><TableCell>{course.semester || "N/A"}</TableCell><TableCell><Badge variant="outline" className={statusClass(course.status)}>{course.status || "N/A"}</Badge></TableCell></TableRow>)
                        : <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]">No enrolled courses found.</TableCell></TableRow>}
            </TableBody></Table></div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">Recent Assignments</h2><p className="text-sm text-[var(--sms-muted)]">Active assignments from your courses</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Course</TableHead><TableHead>Due Date</TableHead></TableRow></TableHeader><TableBody>
                    {loading ? <TableRow><TableCell colSpan={3} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading assignments…</TableCell></TableRow>
                        : assignments.length ? assignments.map((assignment, index) => <TableRow key={`${assignment.course_code}-${assignment.title}-${index}`}><TableCell className="min-w-44 font-medium">{assignment.title}</TableCell><TableCell><p className="font-mono text-xs">{assignment.course_code}</p><p className="min-w-40 text-xs text-[var(--sms-muted)]">{assignment.course_name}</p></TableCell><TableCell>{assignment.due_date || "N/A"}</TableCell></TableRow>)
                            : <TableRow><TableCell colSpan={3} className="py-12 text-center text-[var(--sms-muted)]">No assignments found.</TableCell></TableRow>}
                </TableBody></Table></div>
            </section>

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">Latest Grades</h2><p className="text-sm text-[var(--sms-muted)]">Recorded grades from your courses</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Total</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader><TableBody>
                    {loading ? <TableRow><TableCell colSpan={3} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading grades…</TableCell></TableRow>
                        : grades.length ? grades.map((grade) => <TableRow key={grade.course_code}><TableCell><p className="font-medium">{grade.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{grade.course_code}</p></TableCell><TableCell className="font-semibold">{formatScore(grade.total_score)}</TableCell><TableCell><Badge variant="outline" className={gradeClass(grade.grade_letter)}>{grade.grade_letter || "N/A"}</Badge></TableCell></TableRow>)
                            : <TableRow><TableCell colSpan={3} className="py-12 text-center text-[var(--sms-muted)]">No grades recorded yet.</TableCell></TableRow>}
                </TableBody></Table></div>
            </section>
        </div>
    </>;
}

export default StudentDashboard;
