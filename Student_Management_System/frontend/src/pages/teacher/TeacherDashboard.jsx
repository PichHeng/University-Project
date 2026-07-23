import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCcw } from "lucide-react";

import { getTeacherDashboard } from "@/services/dashboardService";
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
    { label: "My Students", key: "totalStudents" },
    { label: "Assignments", key: "totalAssignments" },
    { label: "Grades Recorded", key: "totalGrades" },
];

function statusClass(status) {
    return String(status).toLowerCase() === "active"
        ? "sms-badge-active"
        : "sms-badge-inactive";
}

function TeacherDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getTeacherDashboard();
            setDashboard(response.data || null);
        } catch (requestError) {
            setDashboard(null);
            setError(requestError.response?.data?.message || "Failed to load teacher dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [loadDashboard]);

    const teacher = dashboard?.teacher;
    const courses = dashboard?.courses || [];
    const assignments = dashboard?.recentAssignments || [];

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Teacher</p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">{teacher?.full_name || "Teacher Dashboard"}</h1>
                <p className="mt-2 text-[var(--sms-muted)]">{teacher ? `${teacher.teacher_code} · ${teacher.department_name || "No Department"}` : "Your live teaching summary."}</p>
            </div>
            <Button type="button" variant="outline" onClick={loadDashboard} disabled={loading}>
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
            </Button>
        </div>

        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statDefinitions.map((stat) => <div key={stat.key} className="sms-card p-5"><p className="text-3xl font-bold text-[var(--sms-ink)]">{loading ? "…" : dashboard?.[stat.key] ?? 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">{stat.label}</p></div>)}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">My Courses</h2><p className="text-sm text-[var(--sms-muted)]">Courses assigned to your teacher profile</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Semester</TableHead><TableHead>Credit</TableHead><TableHead>Students</TableHead></TableRow></TableHeader><TableBody>
                    {loading ? <TableRow><TableCell colSpan={4} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading courses…</TableCell></TableRow>
                        : courses.length ? courses.map((course) => <TableRow key={course.course_code}><TableCell><p className="font-medium">{course.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{course.course_code}</p></TableCell><TableCell>{course.semester || "N/A"}</TableCell><TableCell>{course.credit ?? "N/A"}</TableCell><TableCell>{course.student_count ?? 0}</TableCell></TableRow>)
                            : <TableRow><TableCell colSpan={4} className="py-12 text-center text-[var(--sms-muted)]">No courses assigned to you.</TableCell></TableRow>}
                </TableBody></Table></div>
            </section>

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">Recent Assignments</h2><p className="text-sm text-[var(--sms-muted)]">Assignments created for your courses</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Course</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                    {loading ? <TableRow><TableCell colSpan={4} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading assignments…</TableCell></TableRow>
                        : assignments.length ? assignments.map((assignment, index) => <TableRow key={`${assignment.course_code}-${assignment.title}-${index}`}><TableCell className="min-w-44 font-medium">{assignment.title}</TableCell><TableCell><p className="font-mono text-xs">{assignment.course_code}</p><p className="min-w-40 text-xs text-[var(--sms-muted)]">{assignment.course_name}</p></TableCell><TableCell>{assignment.due_date || "N/A"}</TableCell><TableCell><Badge variant="outline" className={statusClass(assignment.status)}>{assignment.status || "N/A"}</Badge></TableCell></TableRow>)
                            : <TableRow><TableCell colSpan={4} className="py-12 text-center text-[var(--sms-muted)]">No assignments found.</TableCell></TableRow>}
                </TableBody></Table></div>
            </section>
        </div>

        <section className="sms-card mt-6 p-5"><h2 className="font-semibold text-[var(--sms-ink)]">Schedule</h2><p className="mt-3 text-sm text-[var(--sms-muted)]">No schedule configured.</p></section>
    </>;
}

export default TeacherDashboard;
