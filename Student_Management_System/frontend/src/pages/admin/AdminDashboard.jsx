import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCcw } from "lucide-react";

import { getAdminDashboard } from "@/services/dashboardService";
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
    { label: "Students", key: "totalStudents" },
    { label: "Teachers", key: "totalTeachers" },
    { label: "Departments", key: "totalDepartments" },
    { label: "Courses", key: "totalCourses" },
    { label: "Enrollments", key: "totalEnrollments" },
    { label: "Grades", key: "totalGrades" },
];

function statusClass(status) {
    return String(status).toLowerCase() === "active"
        ? "sms-badge-active"
        : "sms-badge-inactive";
}

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getAdminDashboard();
            setDashboard(response.data || null);
        } catch (requestError) {
            setDashboard(null);
            setError(requestError.response?.data?.message || "Failed to load admin dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [loadDashboard]);

    const students = dashboard?.recentStudents || [];
    const assignments = dashboard?.recentAssignments || [];

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Administrator</p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Admin Dashboard</h1>
                <p className="mt-2 text-[var(--sms-muted)]">Current totals and activity from the academic database.</p>
            </div>
            <Button type="button" variant="outline" onClick={loadDashboard} disabled={loading}>
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
            </Button>
        </div>

        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {statDefinitions.map((stat) => <div key={stat.key} className="sms-card p-5">
                <p className="text-3xl font-bold text-[var(--sms-ink)]">{loading ? "…" : dashboard?.[stat.key] ?? 0}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">{stat.label}</p>
            </div>)}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">Students</h2><p className="text-sm text-[var(--sms-muted)]">First five students by code</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Gender</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                    {loading ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading students…</TableCell></TableRow>
                        : students.length ? students.map((student) => <TableRow key={student.student_code}><TableCell className="font-mono text-xs">{student.student_code}</TableCell><TableCell className="min-w-40 font-medium">{student.full_name}</TableCell><TableCell className="capitalize">{student.gender || "N/A"}</TableCell><TableCell>{student.department_name || "No Department"}</TableCell><TableCell><Badge variant="outline" className={statusClass(student.status)}>{student.status || "N/A"}</Badge></TableCell></TableRow>)
                            : <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]">No student records found.</TableCell></TableRow>}
                </TableBody></Table></div>
            </section>

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">Recent Assignments</h2><p className="text-sm text-[var(--sms-muted)]">Up to five database records</p></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Course</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                    {loading ? <TableRow><TableCell colSpan={4} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading assignments…</TableCell></TableRow>
                        : assignments.length ? assignments.map((assignment, index) => <TableRow key={`${assignment.course_code}-${assignment.title}-${index}`}><TableCell className="min-w-44 font-medium">{assignment.title}</TableCell><TableCell><p className="font-mono text-xs">{assignment.course_code}</p><p className="min-w-40 text-xs text-[var(--sms-muted)]">{assignment.course_name}</p></TableCell><TableCell>{assignment.due_date || "N/A"}</TableCell><TableCell><Badge variant="outline" className={statusClass(assignment.status)}>{assignment.status || "N/A"}</Badge></TableCell></TableRow>)
                            : <TableRow><TableCell colSpan={4} className="py-12 text-center text-[var(--sms-muted)]">No assignments found.</TableCell></TableRow>}
                </TableBody></Table></div>
            </section>
        </div>
    </>;
}

export default AdminDashboard;
