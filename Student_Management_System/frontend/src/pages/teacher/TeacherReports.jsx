import { useCallback, useEffect, useState } from "react";
import { FileSpreadsheet, FileText, LoaderCircle, RefreshCcw } from "lucide-react";

import { getTeacherReports } from "@/services/reportService";
import { exportToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const summaryDefinitions = [
    { label: "My Courses", key: "totalCourses" },
    { label: "My Students", key: "totalStudents" },
    { label: "Assignments", key: "totalAssignments" },
    { label: "Grades Recorded", key: "totalGrades" },
];

function statusClass(status) {
    return String(status).toLowerCase() === "active" ? "sms-badge-active" : "sms-badge-inactive";
}

function gradeClass(letter) {
    if (letter === "A") return "sms-badge-active";
    if (letter === "B" || letter === "C") return "sms-badge-info";
    if (letter === "D") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function formatScore(value) {
    const score = Number(value);
    return Number.isFinite(score) ? score.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "N/A";
}

const courseColumns = [
    { header: "Course Code", key: "course_code" },
    { header: "Course Name", key: "course_name" },
    { header: "Department", key: "department_name", render: (row) => row.department_name || "No Department" },
    { header: "Semester", key: "semester", render: (row) => row.semester || "N/A" },
    { header: "Credit", key: "credit" },
    { header: "Students", key: "student_count" },
    { header: "Status", key: "status", render: (row) => <Badge variant="outline" className={statusClass(row.status)}>{row.status || "N/A"}</Badge> },
];

const studentColumns = [
    { header: "Course", key: "course_code", render: (row) => <><p className="font-medium">{row.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.course_code}</p></>, exportValue: (row) => `${row.course_code} - ${row.course_name}` },
    { header: "Student Code", key: "student_code" },
    { header: "Student Name", key: "student_name" },
    { header: "Gender", key: "gender", render: (row) => <span className="capitalize">{row.gender || "N/A"}</span> },
    { header: "Enrollment Status", key: "enrollment_status", render: (row) => <Badge variant="outline" className={statusClass(row.enrollment_status)}>{row.enrollment_status || "N/A"}</Badge> },
];

const gradeColumns = [
    { header: "Course", key: "course_code", render: (row) => <><p className="font-medium">{row.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.course_code}</p></>, exportValue: (row) => `${row.course_code} - ${row.course_name}` },
    { header: "Student", key: "student_code", render: (row) => <><p className="font-medium">{row.student_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.student_code}</p></>, exportValue: (row) => `${row.student_code} - ${row.student_name}` },
    { header: "Assignment", key: "assignment_score" },
    { header: "Midterm", key: "midterm_score" },
    { header: "Final", key: "final_score" },
    { header: "Total", key: "total_score", render: (row) => formatScore(row.total_score) },
    { header: "Grade", key: "grade_letter", render: (row) => <Badge variant="outline" className={gradeClass(row.grade_letter)}>{row.grade_letter || "N/A"}</Badge> },
    { header: "Remark", key: "remark", render: (row) => row.remark || "N/A" },
];

const assignmentColumns = [
    { header: "Course", key: "course_code", render: (row) => <><p className="font-medium">{row.course_name}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{row.course_code}</p></>, exportValue: (row) => `${row.course_code} - ${row.course_name}` },
    { header: "Title", key: "title" },
    { header: "Due Date", key: "due_date", render: (row) => row.due_date || "N/A" },
    { header: "Max Score", key: "max_score", render: (row) => formatScore(row.max_score) },
    { header: "Status", key: "status", render: (row) => <Badge variant="outline" className={statusClass(row.status)}>{row.status || "N/A"}</Badge> },
];

function ReportSection({ title, rows, columns, filename, emptyMessage, loading }) {
    function exportRows() {
        exportToCsv(filename, rows, columns.map((column) => ({ header: column.header, key: column.key, value: column.exportValue })));
    }

    return <section className="sms-card overflow-hidden">
        <div className="sms-section-header flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-[var(--sms-ink)]">{title}</h2><p className="text-sm text-[var(--sms-muted)]">{rows.length} record(s)</p></div><Button type="button" variant="outline" size="sm" onClick={exportRows} disabled={loading || !rows.length} className="print:hidden"><FileSpreadsheet className="mr-2 h-4 w-4" />Export CSV</Button></div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.header}>{column.header}</TableHead>)}</TableRow></TableHeader><TableBody>
            {loading ? <TableRow><TableCell colSpan={columns.length} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading report…</TableCell></TableRow>
                : rows.length ? rows.map((row, index) => <TableRow key={`${filename}-${index}`}>{columns.map((column) => <TableCell key={column.header}>{column.render ? column.render(row) : row[column.key] ?? "N/A"}</TableCell>)}</TableRow>)
                    : <TableRow><TableCell colSpan={columns.length} className="py-12 text-center text-[var(--sms-muted)]">{emptyMessage}</TableCell></TableRow>}
        </TableBody></Table></div>
    </section>;
}

function TeacherReports() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getTeacherReports();
            setReports(response.data || null);
        } catch (requestError) {
            setReports(null);
            setError(requestError.response?.data?.message || "Failed to load teacher reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReports();
    }, [loadReports]);

    const teacher = reports?.teacher;
    const summary = reports?.summary || {};

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Teacher</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Academic Reports</h1><p className="mt-2 text-[var(--sms-muted)]">Courses, students, grades, and assignments from your teaching records.</p></div><div className="flex flex-wrap gap-2 print:hidden"><Button type="button" variant="outline" onClick={loadReports} disabled={loading}><RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button><Button type="button" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />Print Report</Button></div></div>
        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaryDefinitions.map((stat) => <div key={stat.key} className="sms-card p-5"><p className="text-3xl font-bold text-[var(--sms-ink)]">{loading ? "…" : summary[stat.key] ?? 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">{stat.label}</p></div>)}</section>
        <section className="sms-card mb-6 grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">Teacher Code</p><p className="mt-1 font-medium">{teacher?.teacher_code || "N/A"}</p></div><div><p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">Full Name</p><p className="mt-1 font-medium">{teacher?.full_name || "N/A"}</p></div><div><p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">Department</p><p className="mt-1 font-medium">{teacher?.department_name || "No Department"}</p></div><div><p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">Gender</p><p className="mt-1 font-medium capitalize">{teacher?.gender || "N/A"}</p></div></section>
        <div className="space-y-6">
            <ReportSection title="My Courses" rows={reports?.courses || []} columns={courseColumns} filename="teacher-courses-report.csv" emptyMessage="No courses assigned to you." loading={loading} />
            <ReportSection title="Students by Course" rows={reports?.studentsByCourse || []} columns={studentColumns} filename="teacher-students-report.csv" emptyMessage="No enrolled students found." loading={loading} />
            <ReportSection title="Grades by Course" rows={reports?.gradesByCourse || []} columns={gradeColumns} filename="teacher-grades-report.csv" emptyMessage="No grades recorded yet." loading={loading} />
            <ReportSection title="Assignments by Course" rows={reports?.assignmentsByCourse || []} columns={assignmentColumns} filename="teacher-assignments-report.csv" emptyMessage="No assignments found." loading={loading} />
        </div>
    </>;
}

export default TeacherReports;
