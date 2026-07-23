import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, LoaderCircle, RefreshCcw, Search } from "lucide-react";

import { getMyStudentGrades } from "@/services/gradeService";
import { exportToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function gradeBadgeClass(letter) {
    if (letter === "A") return "sms-badge-active";
    if (letter === "B" || letter === "C") return "sms-badge-info";
    if (letter === "D") return "sms-badge-warning";
    if (letter === "F") return "sms-badge-inactive";
    return "";
}

function formatScore(value) {
    const score = Number(value);
    return Number.isFinite(score)
        ? score.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "—";
}

function StudentGrades() {
    const [grades, setGrades] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadGrades = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMyStudentGrades();
            setGrades(response.data || []);
        } catch (requestError) {
            setGrades([]);
            setError(requestError.response?.data?.message || "Failed to load your grades.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadGrades();
    }, [loadGrades]);

    const visibleGrades = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return grades.filter((grade) =>
            !keyword || [
                grade.course_code,
                grade.course_name,
                grade.teacher_name,
                grade.grade_letter,
                grade.remark,
                grade.semester,
            ].some((value) => String(value || "").toLowerCase().includes(keyword))
        );
    }, [grades, search]);

    const average = grades.length
        ? grades.reduce((sum, grade) => sum + Number(grade.total_score || 0), 0) / grades.length
        : null;

    function exportGrades() {
        exportToCsv("my-grades.csv", visibleGrades, [
            { header: "Course Code", key: "course_code" },
            { header: "Course Name", key: "course_name" },
            { header: "Teacher", key: "teacher_name" },
            { header: "Assignment /30", key: "assignment_score" },
            { header: "Midterm /30", key: "midterm_score" },
            { header: "Final /40", key: "final_score" },
            { header: "Total /100", key: "total_score" },
            { header: "Grade Letter", key: "grade_letter" },
            { header: "Remark", key: "remark" },
            { header: "Semester", key: "semester" },
        ]);
    }

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Student</p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">My Grades</h1>
                <p className="mt-2 text-[var(--sms-muted)]">Course grades recorded for your student account.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={loadGrades} disabled={loading}><RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
                <Button type="button" variant="outline" onClick={exportGrades} disabled={!visibleGrades.length}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
            </div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}

        <section className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="sms-card p-5"><p className="text-3xl font-bold text-[var(--sms-ink)]">{grades.length}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">Graded Courses</p></div>
            <div className="sms-card p-5"><p className="text-3xl font-bold text-[var(--sms-ink)]">{average === null ? "N/A" : formatScore(average)}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">Average Score</p></div>
        </section>

        <section className="sms-input-panel mb-6 p-5">
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search course, teacher, grade, or semester" /></div>
        </section>

        <section className="sms-card overflow-hidden">
            <div className="sms-section-header px-5 py-4"><h2 className="font-semibold text-[var(--sms-ink)]">Grade Records</h2><p className="text-sm text-[var(--sms-muted)]">{visibleGrades.length} grade(s)</p></div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader><TableRow><TableHead>Course Code</TableHead><TableHead>Course Name</TableHead><TableHead>Teacher</TableHead><TableHead>Semester</TableHead><TableHead>Assignment /30</TableHead><TableHead>Midterm /30</TableHead><TableHead>Final /40</TableHead><TableHead>Total /100</TableHead><TableHead>Grade Letter</TableHead><TableHead>Remark</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={10} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading grades…</TableCell></TableRow>
                            : visibleGrades.length ? visibleGrades.map((grade) => <TableRow key={grade.course_code}>
                                <TableCell className="font-mono text-xs">{grade.course_code}</TableCell>
                                <TableCell className="min-w-48 font-medium">{grade.course_name}</TableCell>
                                <TableCell>{grade.teacher_name || "Unassigned"}</TableCell>
                                <TableCell>{grade.semester || "—"}</TableCell>
                                <TableCell>{formatScore(grade.assignment_score)}</TableCell>
                                <TableCell>{formatScore(grade.midterm_score)}</TableCell>
                                <TableCell>{formatScore(grade.final_score)}</TableCell>
                                <TableCell className="font-semibold">{formatScore(grade.total_score)}</TableCell>
                                <TableCell><Badge variant="outline" className={gradeBadgeClass(grade.grade_letter)}>{grade.grade_letter || "—"}</Badge></TableCell>
                                <TableCell className="min-w-48">{grade.remark || "—"}</TableCell>
                            </TableRow>) : <TableRow><TableCell colSpan={10} className="py-12 text-center text-[var(--sms-muted)]">{grades.length ? "No grades match your search." : "No grades recorded yet."}</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        </section>
    </>;
}

export default StudentGrades;
