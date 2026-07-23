import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, LoaderCircle, RefreshCcw, Save, Search } from "lucide-react";

import {
    getTeacherCourseStudents,
    getTeacherGradeCourses,
    saveTeacherGrade,
    saveTeacherGradesBulk,
} from "@/services/gradeService";
import { exportToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const scoreFields = [
    { field: "assignment_score", label: "Assignment", max: 30 },
    { field: "midterm_score", label: "Midterm", max: 30 },
    { field: "final_score", label: "Final", max: 40 },
];

function calculateGradeLetter(totalScore) {
    if (totalScore >= 90) return "A";
    if (totalScore >= 80) return "B";
    if (totalScore >= 70) return "C";
    if (totalScore >= 60) return "D";
    return "F";
}

function calculateResult(draft) {
    const scores = [];
    for (const config of scoreFields) {
        const rawValue = draft?.[config.field];
        const score = Number(rawValue);
        if (
            rawValue === "" ||
            rawValue === null ||
            rawValue === undefined ||
            !Number.isFinite(score) ||
            score < 0 ||
            score > config.max
        ) {
            return { total: null, letter: "" };
        }
        scores.push(Number(score.toFixed(2)));
    }

    const total = Number(scores.reduce((sum, score) => sum + score, 0).toFixed(2));
    return { total, letter: calculateGradeLetter(total) };
}

function gradeBadgeClass(letter) {
    if (letter === "A") return "sms-badge-active";
    if (letter === "B" || letter === "C") return "sms-badge-info";
    if (letter === "D") return "sms-badge-warning";
    if (letter === "F") return "sms-badge-inactive";
    return "";
}

function draftFor(student) {
    return {
        assignment_score: String(student.assignment_score ?? 0),
        midterm_score: String(student.midterm_score ?? 0),
        final_score: String(student.final_score ?? 0),
        remark: student.remark || "",
    };
}

function draftsMatch(first, second) {
    return scoreFields.every(
        ({ field }) => String(first?.[field] ?? "") === String(second?.[field] ?? "")
    ) && String(first?.remark ?? "") === String(second?.remark ?? "");
}

function TeacherGrades() {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [savedDrafts, setSavedDrafts] = useState({});
    const [persistedEnrollmentIds, setPersistedEnrollmentIds] = useState(new Set());
    const [selectedCourse, setSelectedCourse] = useState("");
    const [search, setSearch] = useState("");
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadCourses() {
            try {
                setLoadingCourses(true);
                setError("");
                const response = await getTeacherGradeCourses();
                if (cancelled) return;

                const rows = response.data || [];
                setCourses(rows);
                setSelectedCourse((current) =>
                    rows.some((course) => String(course.course_id) === current)
                        ? current
                        : String(rows[0]?.course_id ?? "")
                );
                if (!rows.length) {
                    setStudents([]);
                    setDrafts({});
                    setSavedDrafts({});
                    setPersistedEnrollmentIds(new Set());
                }
            } catch (requestError) {
                if (!cancelled) {
                    setCourses([]);
                    setError(requestError.response?.data?.message || "Failed to load your courses.");
                }
            } finally {
                if (!cancelled) setLoadingCourses(false);
            }
        }

        loadCourses();
        return () => { cancelled = true; };
    }, [refreshKey]);

    useEffect(() => {
        if (!selectedCourse) return undefined;
        let cancelled = false;

        async function loadStudents() {
            try {
                setLoadingStudents(true);
                setError("");
                const response = await getTeacherCourseStudents(selectedCourse);
                if (cancelled) return;

                const rows = response.data || [];
                const nextDrafts = Object.fromEntries(
                    rows.map((student) => [student.enrollment_id, draftFor(student)])
                );
                setStudents(rows);
                setDrafts(nextDrafts);
                setSavedDrafts(nextDrafts);
                setPersistedEnrollmentIds(new Set(
                    rows.filter((student) => student.grade_id).map((student) => student.enrollment_id)
                ));
            } catch (requestError) {
                if (!cancelled) {
                    setStudents([]);
                    setDrafts({});
                    setSavedDrafts({});
                    setPersistedEnrollmentIds(new Set());
                    setError(
                        requestError.response?.data?.message || "Failed to load enrolled students."
                    );
                }
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        }

        loadStudents();
        return () => { cancelled = true; };
    }, [refreshKey, selectedCourse]);

    const visibleStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return students.filter((student) =>
            !keyword || [student.student_code, student.full_name, student.gender]
                .some((value) => String(value || "").toLowerCase().includes(keyword))
        );
    }, [search, students]);

    function updateDraft(enrollmentId, field, value) {
        setDrafts((current) => ({
            ...current,
            [enrollmentId]: { ...current[enrollmentId], [field]: value },
        }));
        setError("");
        setMessage("");
    }

    function payloadFor(student) {
        const draft = drafts[student.enrollment_id];
        const payload = { enrollment_id: student.enrollment_id };

        for (const config of scoreFields) {
            const rawValue = draft?.[config.field];
            const score = Number(rawValue);
            if (
                rawValue === "" ||
                !Number.isFinite(score) ||
                score < 0 ||
                score > config.max
            ) {
                return {
                    error: `${config.label} score for ${student.student_code} must be between 0 and ${config.max}.`,
                };
            }
            payload[config.field] = score;
        }

        payload.remark = draft.remark.trim() || null;
        return payload;
    }

    function rowChanged(student) {
        return !draftsMatch(
            drafts[student.enrollment_id],
            savedDrafts[student.enrollment_id]
        );
    }

    async function saveOne(student) {
        const payload = payloadFor(student);
        if (payload.error) {
            setError(payload.error);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");
            await saveTeacherGrade(payload);
            setSavedDrafts((current) => ({
                ...current,
                [student.enrollment_id]: { ...drafts[student.enrollment_id] },
            }));
            setPersistedEnrollmentIds((current) => new Set(current).add(student.enrollment_id));
            setMessage(`Grade saved for ${student.student_code}.`);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to save grade.");
        } finally {
            setSaving(false);
        }
    }

    async function saveAll() {
        const changedStudents = students.filter(rowChanged);
        if (!changedStudents.length) {
            setError("No grade changes to save.");
            return;
        }

        const grades = [];
        for (const student of changedStudents) {
            const payload = payloadFor(student);
            if (payload.error) {
                setError(payload.error);
                return;
            }
            grades.push(payload);
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");
            await saveTeacherGradesBulk(grades);
            setSavedDrafts(Object.fromEntries(
                students.map((student) => [
                    student.enrollment_id,
                    { ...drafts[student.enrollment_id] },
                ])
            ));
            setPersistedEnrollmentIds((current) => {
                const next = new Set(current);
                grades.forEach((grade) => next.add(grade.enrollment_id));
                return next;
            });
            setMessage(`Saved grades for ${grades.length} student(s).`);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to save grades.");
        } finally {
            setSaving(false);
        }
    }

    function exportGrades() {
        exportToCsv("teacher-grades.csv", visibleStudents.map((student) => {
            const draft = drafts[student.enrollment_id] || {};
            const result = calculateResult(draft);
            return { ...student, ...draft, total_score: result.total ?? "", grade_letter: result.letter };
        }), [
            { header: "Student Code", key: "student_code" },
            { header: "Student Name", key: "full_name" },
            { header: "Gender", key: "gender" },
            { header: "Assignment /30", key: "assignment_score" },
            { header: "Midterm /30", key: "midterm_score" },
            { header: "Final /40", key: "final_score" },
            { header: "Total /100", key: "total_score" },
            { header: "Grade", key: "grade_letter" },
            { header: "Remark", key: "remark" },
        ]);
    }

    const changedCount = students.filter(rowChanged).length;
    const selectedCourseData = courses.find(
        (course) => String(course.course_id) === selectedCourse
    );

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Teacher</p>
                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Grades</h1>
                <p className="mt-2 text-[var(--sms-muted)]">Record assignment, midterm, and final scores for your enrolled students.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setRefreshKey((value) => value + 1)} disabled={loadingCourses || loadingStudents || saving}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${loadingCourses || loadingStudents ? "animate-spin" : ""}`} />Refresh
                </Button>
                <Button type="button" variant="outline" onClick={exportGrades} disabled={!visibleStudents.length}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
                </Button>
            </div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}
        {message && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}

        <section className="sms-input-panel mb-6 grid gap-4 p-5 md:grid-cols-2">
            <div className="space-y-2">
                <Label>Course</Label>
                <Select value={selectedCourse || undefined} onValueChange={(value) => { setSelectedCourse(value); setMessage(""); setError(""); }} disabled={loadingCourses || !courses.length}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>{courses.map((course) => <SelectItem key={course.course_id} value={String(course.course_id)}>{course.course_code} - {course.course_name}</SelectItem>)}</SelectContent>
                </Select>
                {selectedCourseData && <p className="text-xs text-[var(--sms-muted)]">{selectedCourseData.semester || "No semester"} · {selectedCourseData.student_count} active student(s)</p>}
            </div>
            <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Student code, name, or gender" /></div>
            </div>
        </section>

        <section className="sms-card overflow-hidden">
            <div className="sms-section-header flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div><h2 className="font-semibold text-[var(--sms-ink)]">Enrolled Students</h2><p className="text-sm text-[var(--sms-muted)]">{visibleStudents.length} student(s) · {changedCount} unsaved</p></div>
                <Button type="button" onClick={saveAll} disabled={saving || !changedCount}>
                    {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{saving ? "Saving…" : "Save All"}
                </Button>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader><TableRow><TableHead>Student Code</TableHead><TableHead>Student Name</TableHead><TableHead>Gender</TableHead><TableHead>Assignment /30</TableHead><TableHead>Midterm /30</TableHead><TableHead>Final /40</TableHead><TableHead>Total /100</TableHead><TableHead>Grade</TableHead><TableHead>Remark</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {(loadingCourses || loadingStudents) ? <TableRow><TableCell colSpan={10} className="py-12 text-center text-[var(--sms-muted)]"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading grades…</TableCell></TableRow>
                            : !courses.length ? <TableRow><TableCell colSpan={10} className="py-12 text-center text-[var(--sms-muted)]">No courses assigned to you.</TableCell></TableRow>
                                : visibleStudents.length ? visibleStudents.map((student) => {
                                    const draft = drafts[student.enrollment_id] || {};
                                    const result = calculateResult(draft);
                                    const canSave = rowChanged(student) || !persistedEnrollmentIds.has(student.enrollment_id);
                                    return <TableRow key={student.enrollment_id}>
                                        <TableCell className="font-mono text-xs">{student.student_code}</TableCell>
                                        <TableCell className="min-w-48 font-medium">{student.full_name}</TableCell>
                                        <TableCell className="capitalize">{student.gender || "—"}</TableCell>
                                        {scoreFields.map((config) => <TableCell key={config.field}><Input type="number" min="0" max={config.max} step="0.01" value={draft[config.field] ?? ""} onChange={(event) => updateDraft(student.enrollment_id, config.field, event.target.value)} className="w-28" aria-label={`${config.label} score for ${student.student_code}`} /></TableCell>)}
                                        <TableCell className="font-semibold">{result.total ?? "—"}</TableCell>
                                        <TableCell><Badge variant="outline" className={gradeBadgeClass(result.letter)}>{result.letter || "—"}</Badge></TableCell>
                                        <TableCell><Input value={draft.remark || ""} onChange={(event) => updateDraft(student.enrollment_id, "remark", event.target.value)} placeholder="Optional remark" className="min-w-52" aria-label={`Remark for ${student.student_code}`} /></TableCell>
                                        <TableCell className="text-right"><Button type="button" variant="outline" size="sm" onClick={() => saveOne(student)} disabled={saving || !canSave}><Save className="mr-1 h-3.5 w-3.5" />Save</Button></TableCell>
                                    </TableRow>;
                                }) : <TableRow><TableCell colSpan={10} className="py-12 text-center text-[var(--sms-muted)]">No enrolled students found for this course.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        </section>
    </>;
}

export default TeacherGrades;
