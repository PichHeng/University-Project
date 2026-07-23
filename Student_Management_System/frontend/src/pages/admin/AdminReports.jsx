import { useCallback, useEffect, useState } from "react";
import { FileSpreadsheet, FileText, LoaderCircle, RefreshCcw } from "lucide-react";

import { getAdminReports } from "@/services/reportService";
import { exportToCsv } from "@/lib/exportCsv";
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

const summaryDefinitions = [
    { label: "Students", key: "totalStudents" },
    { label: "Teachers", key: "totalTeachers" },
    { label: "Departments", key: "totalDepartments" },
    { label: "Courses", key: "totalCourses" },
    { label: "Enrollments", key: "totalEnrollments" },
    { label: "Grades", key: "totalGrades" },
];

const studentsByDepartmentColumns = [
    { header: "Department Code", key: "department_code" },
    { header: "Department Name", key: "department_name" },
    { header: "Students", key: "student_count" },
];

const teachersByDepartmentColumns = [
    { header: "Department Code", key: "department_code" },
    { header: "Department Name", key: "department_name" },
    { header: "Teachers", key: "teacher_count" },
];

const coursesByDepartmentColumns = [
    { header: "Department Code", key: "department_code" },
    { header: "Department Name", key: "department_name" },
    { header: "Courses", key: "course_count" },
];

const enrollmentsByCourseColumns = [
    { header: "Course Code", key: "course_code" },
    { header: "Course Name", key: "course_name" },
    { header: "Teacher", key: "teacher_name", render: (row) => row.teacher_name || "Unassigned" },
    { header: "Enrollments", key: "enrollment_count" },
];

function formatScore(value) {
    if (value === null || value === undefined) return "N/A";
    const score = Number(value);
    return Number.isFinite(score)
        ? score.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "N/A";
}

const gradesSummaryColumns = [
    { header: "Course Code", key: "course_code" },
    { header: "Course Name", key: "course_name" },
    { header: "Graded Students", key: "graded_students" },
    { header: "Average Score", key: "average_score", render: (row) => formatScore(row.average_score) },
    { header: "Highest Score", key: "highest_score", render: (row) => formatScore(row.highest_score) },
    { header: "Lowest Score", key: "lowest_score", render: (row) => formatScore(row.lowest_score) },
];

function gradeClass(letter) {
    if (letter === "A") return "sms-badge-active";
    if (letter === "B" || letter === "C") return "sms-badge-info";
    if (letter === "D") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function statusClass(status) {
    return String(status).toLowerCase() === "active"
        ? "sms-badge-active"
        : "sms-badge-inactive";
}

const recentGradesColumns = [
    {
        header: "Student",
        key: "student_code",
        render: (row) => <><p className="font-medium">{row.student_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.student_code}</p></>,
        exportValue: (row) => `${row.student_code} - ${row.student_name}`,
    },
    {
        header: "Course",
        key: "course_code",
        render: (row) => <><p className="font-medium">{row.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.course_code}</p></>,
        exportValue: (row) => `${row.course_code} - ${row.course_name}`,
    },
    { header: "Total Score", key: "total_score", render: (row) => formatScore(row.total_score) },
    { header: "Grade", key: "grade_letter", render: (row) => <Badge variant="outline" className={gradeClass(row.grade_letter)}>{row.grade_letter || "N/A"}</Badge> },
    { header: "Remark", key: "remark", render: (row) => row.remark || "N/A" },
];

const recentAssignmentsColumns = [
    { header: "Title", key: "title" },
    {
        header: "Course",
        key: "course_code",
        render: (row) => <><p className="font-medium">{row.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.course_code}</p></>,
        exportValue: (row) => `${row.course_code} - ${row.course_name}`,
    },
    { header: "Due Date", key: "due_date", render: (row) => row.due_date || "N/A" },
    { header: "Status", key: "status", render: (row) => <Badge variant="outline" className={statusClass(row.status)}>{row.status || "N/A"}</Badge> },
];

function ReportSection({ title, description, rows, columns, filename, emptyMessage, loading }) {
    function exportRows() {
        exportToCsv(filename, rows, columns.map((column) => ({
            header: column.header,
            key: column.key,
            value: column.exportValue,
        })));
    }

    return <section className="sms-card overflow-hidden">
        <div className="sms-section-header flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div><h2 className="font-semibold text-[var(--sms-ink)]">{title}</h2><p className="text-sm text-[var(--sms-muted)]">{description}</p></div>
            <Button type="button" variant="outline" size="sm" onClick={exportRows} disabled={loading || !rows.length} className="print:hidden"><FileSpreadsheet className="mr-2 h-4 w-4" />Export CSV</Button>
        </div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.header}>{column.header}</TableHead>)}</TableRow></TableHeader><TableBody>
            {loading ? <TableRow><TableCell colSpan={columns.length} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading report…</TableCell></TableRow>
                : rows.length ? rows.map((row, index) => <TableRow key={`${filename}-${index}`}>{columns.map((column) => <TableCell key={column.header}>{column.render ? column.render(row) : row[column.key] ?? "N/A"}</TableCell>)}</TableRow>)
                    : <TableRow><TableCell colSpan={columns.length} className="py-12 text-center text-[var(--sms-muted)]">{emptyMessage}</TableCell></TableRow>}
        </TableBody></Table></div>
    </section>;
}

function AdminReports() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getAdminReports();
            setReports(response.data || null);
        } catch (requestError) {
            setReports(null);
            setError(requestError.response?.data?.message || "Failed to load admin reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReports();
    }, [loadReports]);

    const summary = reports?.summary || {};

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Administrator</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Academic Reports</h1><p className="mt-2 text-[var(--sms-muted)]">Institution-wide summaries generated from the current academic database.</p></div>
            <div className="flex flex-wrap gap-2 print:hidden"><Button type="button" variant="outline" onClick={loadReports} disabled={loading}><RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button><Button type="button" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />Print Report</Button></div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{summaryDefinitions.map((stat) => <div key={stat.key} className="sms-card p-5"><p className="text-3xl font-bold text-[var(--sms-ink)]">{loading ? "…" : summary[stat.key] ?? 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">{stat.label}</p></div>)}</section>

        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-3">
                <ReportSection title="Students by Department" description="Student distribution across departments" rows={reports?.studentsByDepartment || []} columns={studentsByDepartmentColumns} filename="students-by-department.csv" emptyMessage="No department data found." loading={loading} />
                <ReportSection title="Teachers by Department" description="Teacher distribution across departments" rows={reports?.teachersByDepartment || []} columns={teachersByDepartmentColumns} filename="teachers-by-department.csv" emptyMessage="No department data found." loading={loading} />
                <ReportSection title="Courses by Department" description="Course distribution across departments" rows={reports?.coursesByDepartment || []} columns={coursesByDepartmentColumns} filename="courses-by-department.csv" emptyMessage="No department data found." loading={loading} />
            </div>
            <ReportSection title="Enrollments by Course" description="Enrollment totals for every course" rows={reports?.enrollmentsByCourse || []} columns={enrollmentsByCourseColumns} filename="enrollments-by-course.csv" emptyMessage="No enrollments found." loading={loading} />
            <ReportSection title="Grade Summary by Course" description="Recorded grade statistics using total scores" rows={reports?.gradesSummaryByCourse || []} columns={gradesSummaryColumns} filename="grades-summary-by-course.csv" emptyMessage="No grades recorded yet." loading={loading} />
            <ReportSection title="Recent Grades" description="Ten most recently updated grades" rows={reports?.recentGrades || []} columns={recentGradesColumns} filename="recent-grades.csv" emptyMessage="No grades recorded yet." loading={loading} />
            <ReportSection title="Recent Assignments" description="Ten most recently created assignments" rows={reports?.recentAssignments || []} columns={recentAssignmentsColumns} filename="recent-assignments.csv" emptyMessage="No assignments found." loading={loading} />
        </div>
    </>;
}

export default AdminReports;
