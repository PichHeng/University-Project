import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Download,
    FileSpreadsheet,
    FileText,
    RefreshCcw,
    Search,
    Upload,
} from "lucide-react";

import { getMyStudentAssignments } from "@/services/assignmentService";
import {
    downloadSubmission,
    getMySubmissions,
    submitAssignment,
} from "@/services/assignmentSubmissionService";
import { exportToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function normalizeAssignment(assignment) {
    return {
        ...assignment,
        id: assignment.assignment_id ?? assignment.assignmentId ?? assignment.id,
        courseCode: assignment.course_code ?? assignment.courseCode ?? "",
        courseName: assignment.course_name ?? assignment.courseName ?? "",
        teacherCode: assignment.teacher_code ?? assignment.teacherCode ?? "",
        teacherName: assignment.teacher_name ?? assignment.teacherName ?? "",
        dueDate: assignment.due_date ?? assignment.dueDate ?? "",
        maxScore: Number(assignment.max_score ?? assignment.maxScore ?? 100),
        status: String(assignment.status ?? "active").toLowerCase(),
        description: assignment.description || "",
    };
}

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatDueDate(value) {
    return value ? String(value).slice(0, 10) : "No due date";
}

function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [submitDialog, setSubmitDialog] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [studentNote, setStudentNote] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [assignmentResponse, submissionResponse] = await Promise.all([
                getMyStudentAssignments(),
                getMySubmissions(),
            ]);
            const submissionMap = new Map(
                (Array.isArray(submissionResponse.data) ? submissionResponse.data : []).map(
                    (submission) => [Number(submission.assignment_id), submission]
                )
            );
            const rows = Array.isArray(assignmentResponse.data)
                ? assignmentResponse.data
                : [];
            setAssignments(
                rows.map(normalizeAssignment).map((assignment) => ({
                    ...assignment,
                    submission: submissionMap.get(Number(assignment.id)) || null,
                }))
            );
        } catch (requestError) {
            setAssignments([]);
            setError(requestError.response?.data?.message || "Failed to load assignments.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAssignments();
    }, [fetchAssignments]);

    useEffect(() => {
        const handleFocus = () => fetchAssignments();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [fetchAssignments]);

    const visibleAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return assignments;

        return assignments.filter((assignment) =>
            [
                assignment.title,
                assignment.description,
                assignment.courseCode,
                assignment.courseName,
                assignment.teacherName,
                assignment.status,
                assignment.submission?.status,
                assignment.submission?.original_name,
                assignment.submission?.teacher_feedback,
            ].some((value) => String(value || "").toLowerCase().includes(keyword))
        );
    }, [assignments, search]);

    const isOverdue = (assignment) =>
        assignment.dueDate &&
        assignment.status === "active" &&
        new Date(`${String(assignment.dueDate).slice(0, 10)}T23:59:59`) < new Date();

    function openSubmitDialog(assignment) {
        setSubmitDialog(assignment);
        setSelectedFile(null);
        setStudentNote(assignment.submission?.student_note || "");
        setSubmitError("");
        setMessage("");
    }

    function closeSubmitDialog(open) {
        if (open || submitting) return;
        setSubmitDialog(null);
        setSelectedFile(null);
        setStudentNote("");
        setSubmitError("");
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0] || null;
        setSubmitError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const isPdfName = file.name.toLowerCase().endsWith(".pdf");
        const isPdfType = !file.type || file.type === "application/pdf";
        if (!isPdfName || !isPdfType) {
            setSelectedFile(null);
            event.target.value = "";
            setSubmitError("Only PDF files are allowed.");
            return;
        }

        setSelectedFile(file);
    }

    async function handleSubmission(event) {
        event.preventDefault();
        setSubmitError("");

        if (!selectedFile) {
            setSubmitError("Please select a PDF file.");
            return;
        }

        const isPdfName = selectedFile.name.toLowerCase().endsWith(".pdf");
        const isPdfType = !selectedFile.type || selectedFile.type === "application/pdf";
        if (!isPdfName || !isPdfType) {
            setSubmitError("Only PDF files are allowed.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("pdf", selectedFile);
            formData.append("student_note", studentNote.trim());
            await submitAssignment(submitDialog.id, formData);
            setSubmitDialog(null);
            setSelectedFile(null);
            setStudentNote("");
            setMessage(
                submitDialog.submission
                    ? "Assignment PDF replaced successfully."
                    : "Assignment submitted successfully."
            );
            await fetchAssignments();
        } catch (requestError) {
            setSubmitError(
                requestError.response?.data?.message || "Failed to upload the PDF."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDownload(submission) {
        try {
            setError("");
            await downloadSubmission(submission.submission_id, submission.original_name);
        } catch {
            setError("Failed to download the submitted PDF.");
        }
    }

    function exportAssignments() {
        exportToCsv("student-assignments.csv", visibleAssignments, [
            { header: "Title", key: "title" },
            { header: "Course Code", key: "courseCode" },
            { header: "Course Name", key: "courseName" },
            { header: "Teacher", key: "teacherName" },
            { header: "Due Date", key: "dueDate" },
            { header: "Max Score", key: "maxScore" },
            {
                header: "Submission Status",
                value: (row) => row.submission?.status || "not submitted",
            },
            {
                header: "Late",
                value: (row) => (row.submission?.is_late ? "Yes" : "No"),
            },
        ]);
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Student
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Assignments</h1>
                    <p className="mt-2 text-[var(--sms-muted)]">
                        Submit PDF work and review feedback from your teachers.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={fetchAssignments} disabled={loading}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button type="button" variant="outline" onClick={exportAssignments}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                    </Button>
                </div>
            </div>

            {error && (
                <div role="alert" className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">
                    {error}
                </div>
            )}
            {message && (
                <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    {message}
                </div>
            )}

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">Assignment Records</h2>
                        <p className="text-sm text-[var(--sms-muted)]">{visibleAssignments.length} assignment(s)</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
                        <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assignments..." />
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <Table className="min-w-[1100px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Teacher / Due</TableHead>
                                <TableHead>Submission</TableHead>
                                <TableHead>Teacher Feedback</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="py-12 text-center text-[var(--sms-muted)]">Loading assignments…</TableCell></TableRow>
                            ) : visibleAssignments.length ? (
                                visibleAssignments.map((assignment) => {
                                    const submission = assignment.submission;
                                    return (
                                        <TableRow key={assignment.id} className={isOverdue(assignment) ? "bg-red-50/70" : ""}>
                                            <TableCell className="min-w-[240px] whitespace-normal align-top">
                                                <div className="space-y-2">
                                                    <p className="font-semibold text-[var(--sms-ink)]">{assignment.title}</p>
                                                    <p className="max-w-sm break-words text-xs leading-relaxed text-[var(--sms-muted)]">{assignment.description || "No description provided."}</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={assignment.status === "active" ? "sms-badge-active" : "sms-badge-inactive"}
                                                        >
                                                            {assignment.status === "active" ? "Assignment Active" : "Closed"}
                                                        </Badge>
                                                        <span className="text-xs text-[var(--sms-muted)]">Max score: {assignment.maxScore}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[180px] whitespace-normal align-top">
                                                <p className="font-mono text-xs">{assignment.courseCode}</p>
                                                <p className="mt-1 break-words text-sm">{assignment.courseName}</p>
                                            </TableCell>
                                            <TableCell className="min-w-[190px] whitespace-normal align-top">
                                                <p>{assignment.teacherName || assignment.teacherCode || "—"}</p>
                                                <p className="mt-1 text-xs text-[var(--sms-muted)]">Due: {formatDueDate(assignment.dueDate)}</p>
                                                {isOverdue(assignment) && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--sms-danger)]"><AlertTriangle className="h-3 w-3" /> Overdue</p>}
                                            </TableCell>
                                            <TableCell className="min-w-[220px] whitespace-normal align-top">
                                                {!submission ? (
                                                    <Badge variant="outline" className="sms-badge-inactive">Not Submitted</Badge>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap gap-1">
                                                            <Badge variant="outline" className={submission.status === "reviewed" ? "sms-badge-active" : "border-blue-200 bg-blue-50 text-blue-700"}>{submission.status === "reviewed" ? "Reviewed" : "Submitted"}</Badge>
                                                            {Boolean(submission.is_late) && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Late</Badge>}
                                                            {!submission.is_late && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">On time</Badge>}
                                                        </div>
                                                        <button type="button" className="block max-w-[220px] truncate text-left text-xs font-medium text-blue-700 underline underline-offset-2" onClick={() => handleDownload(submission)} title={submission.original_name}>{submission.original_name}</button>
                                                        <p className="text-xs text-[var(--sms-muted)]">{formatDateTime(submission.submitted_at)}</p>
                                                        {submission.student_note && <p className="max-w-52 whitespace-normal text-xs">Note: {submission.student_note}</p>}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="min-w-[240px] max-w-[300px] whitespace-normal align-top text-sm">
                                                <p className="break-words leading-relaxed">
                                                    {submission?.teacher_feedback || "No feedback yet"}
                                                </p>
                                            </TableCell>
                                            <TableCell className="min-w-[190px] align-top">
                                                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                                                    {submission && <Button type="button" variant="outline" size="icon" aria-label="Download submitted PDF" onClick={() => handleDownload(submission)}><Download className="h-4 w-4" /></Button>}
                                                    <Button type="button" className="sms-btn-primary whitespace-nowrap" onClick={() => openSubmitDialog(assignment)} disabled={assignment.status !== "active"}><Upload className="mr-2 h-4 w-4" />{submission ? "Replace PDF" : "Submit PDF"}</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow><TableCell colSpan={6} className="py-12 text-center text-[var(--sms-muted)]">No assignments found from your enrolled courses.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Dialog open={Boolean(submitDialog)} onOpenChange={closeSubmitDialog}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{submitDialog?.submission ? "Replace Assignment Submission" : "Submit Assignment"}</DialogTitle>
                    </DialogHeader>
                    <form id="student-assignment-submission-form" onSubmit={handleSubmission} className="space-y-5">
                        <div className="rounded-xl border border-[var(--sms-line)] bg-slate-50 p-4 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-[var(--sms-ink)]">{submitDialog?.title}</p>
                                    <p className="mt-1 text-sm text-[var(--sms-muted)]">{submitDialog?.courseCode} - {submitDialog?.courseName}</p>
                                    <p className="mt-1 text-xs text-[var(--sms-muted)]">Due: {formatDueDate(submitDialog?.dueDate)}</p>
                                </div>
                                {submitDialog && isOverdue(submitDialog) && (
                                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                                        Late submission
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {submitDialog && isOverdue(submitDialog) && (
                            <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> This submission will be marked as late.
                            </div>
                        )}
                        {submitDialog?.submission && (
                            <p className="text-sm text-[var(--sms-muted)]">Uploading a new PDF will replace <span className="font-medium text-[var(--sms-ink)]">{submitDialog.submission.original_name}</span> and clear its previous teacher feedback.</p>
                        )}
                        {submitError && <div role="alert" className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]">{submitError}</div>}
                        <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-card p-5 shadow-sm">
                            <div>
                                <Label htmlFor="assignment-pdf">PDF file</Label>
                                <p className="mt-1 text-xs text-[var(--sms-muted)]">PDF only. Only PDF files are allowed.</p>
                            </div>
                            <Input id="assignment-pdf" type="file" accept="application/pdf,.pdf" onChange={handleFileChange} disabled={submitting} required />
                            {selectedFile && (
                                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                                    <FileText className="h-4 w-4 shrink-0" />
                                    <span className="truncate font-medium">{selectedFile.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assignment-note">Message to teacher</Label>
                            <textarea id="assignment-note" value={studentNote} onChange={(event) => setStudentNote(event.target.value)} maxLength={2000} rows={4} disabled={submitting} className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" placeholder="Add a short note about your submission..." />
                            <p className="text-right text-xs text-[var(--sms-muted)]">{studentNote.length}/2000</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => closeSubmitDialog(false)} disabled={submitting}>Cancel</Button>
                            <Button type="submit" form="student-assignment-submission-form" className="sms-btn-primary" disabled={submitting || !selectedFile}>{submitting ? "Uploading…" : submitDialog?.submission ? "Replace PDF" : "Submit PDF"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default StudentAssignments;
