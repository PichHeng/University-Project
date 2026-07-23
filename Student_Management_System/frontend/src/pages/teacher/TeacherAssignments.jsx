import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Download,
    Edit,
    Eye,
    FileSpreadsheet,
    FileText,
    Plus,
    RefreshCcw,
    Search,
    Save,
    Trash2,
} from "lucide-react";

import {
    createAssignment,
    deleteAssignment,
    getAssignments,
    updateAssignment,
} from "@/services/assignmentService";
import { getMyTeacherCourses } from "@/services/courseService";
import {
    downloadSubmission,
    getAssignmentSubmissionsForTeacher,
    saveTeacherFeedback,
    viewSubmission,
} from "@/services/assignmentSubmissionService";
import { exportToCsv } from "@/lib/exportCsv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

const emptyForm = {
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
    status: "active",
};

function normalizeCourse(course) {
    return {
        ...course,
        id: course.course_id ?? course.id,
        courseCode: course.course_code ?? course.courseCode ?? course.code ?? "",
        courseName: course.course_name ?? course.courseName ?? course.name ?? "",
        status: String(course.status ?? "active").toLowerCase(),
    };
}

function normalizeAssignment(assignment) {
    return {
        ...assignment,
        assignmentId:
            assignment.assignment_id ?? assignment.assignmentId ?? assignment.id,
        courseId: assignment.course_id ?? assignment.courseId,
        courseCode:
            assignment.course_code ?? assignment.courseCode ?? assignment.code ?? "",
        courseName:
            assignment.course_name ?? assignment.courseName ?? assignment.name ?? "",
        dueDate: assignment.due_date ?? assignment.dueDate ?? "",
        maxScore: assignment.max_score ?? assignment.maxScore ?? 100,
        status: String(assignment.status ?? "active").toLowerCase(),
        totalStudents: Number(
            assignment.total_students ?? assignment.totalStudents ?? 0
        ),
        submittedCount: Number(
            assignment.submitted_count ?? assignment.submittedCount ?? 0
        ),
        lateCount: Number(assignment.late_count ?? assignment.lateCount ?? 0),
        reviewedCount: Number(
            assignment.reviewed_count ?? assignment.reviewedCount ?? 0
        ),
    };
}

function getCourseLabel(course) {
    const code = course.courseCode || "Unknown course";
    const name = course.courseName || "Unnamed course";
    return `${code} - ${name}`;
}

function TeacherAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [message, setMessage] = useState("");
    const [submissionAssignment, setSubmissionAssignment] = useState(null);
    const [submissionRows, setSubmissionRows] = useState([]);
    const [feedbackDrafts, setFeedbackDrafts] = useState({});
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [savingFeedbackId, setSavingFeedbackId] = useState(null);
    const [submissionError, setSubmissionError] = useState("");
    const [submissionMessage, setSubmissionMessage] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [assignmentResponse, courseResponse] = await Promise.all([
                getAssignments(),
                getMyTeacherCourses(),
            ]);

            setAssignments((assignmentResponse.data || []).map(normalizeAssignment));
            setCourses(
                (courseResponse.data || [])
                    .map(normalizeCourse)
                    .filter((course) => course.id != null)
            );
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load assignments.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const activeCourses = useMemo(
        () => courses.filter((course) => course.status === "active"),
        [courses]
    );

    const visibleAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return assignments.filter((assignment) => {
            if (courseFilter !== "all" && String(assignment.courseId) !== courseFilter) {
                return false;
            }

            return (
                !keyword ||
                [
                    assignment.title,
                    assignment.description,
                    assignment.courseCode,
                    assignment.courseName,
                    assignment.status,
                ].some((value) => String(value || "").toLowerCase().includes(keyword))
            );
        });
    }, [assignments, courseFilter, search]);

    function openAdd() {
        setEditing(null);
        setForm(emptyForm);
        setFormError("");
        setDialogOpen(true);
    }

    function openEdit(assignment) {
        setEditing(assignment);
        setForm({
            courseId: String(assignment.courseId ?? ""),
            title: assignment.title || "",
            description: assignment.description || "",
            dueDate: assignment.dueDate ? String(assignment.dueDate).slice(0, 10) : "",
            maxScore: Number(assignment.maxScore || 100),
            status: assignment.status === "closed" ? "closed" : "active",
        });
        setFormError("");
        setDialogOpen(true);
    }

    function change(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError("");
        setMessage("");

        const courseId = Number(form.courseId);
        const title = form.title.trim();
        const dueDate = String(form.dueDate || "").slice(0, 10);
        const maxScore = Number(form.maxScore);
        const status = form.status === "closed" ? "closed" : "active";

        if (!Number.isInteger(courseId) || courseId <= 0) {
            setFormError("Please select a course.");
            return;
        }
        if (!title) {
            setFormError("Title is required.");
            return;
        }
        if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/u.test(dueDate)) {
            setFormError("Due date is required and must use YYYY-MM-DD format.");
            return;
        }
        if (!Number.isFinite(maxScore) || maxScore <= 0) {
            setFormError("Max score must be a positive number.");
            return;
        }

        const payload = {
            course_id: courseId,
            title,
            description: form.description.trim(),
            due_date: dueDate,
            max_score: maxScore,
            status,
        };

        try {
            setSaving(true);
            if (editing) {
                await updateAssignment(editing.assignmentId, payload);
            } else {
                await createAssignment(payload);
            }

            await loadData();
            setDialogOpen(false);
            setMessage(
                editing
                    ? "Assignment updated successfully."
                    : "Assignment created. Enrolled students can now see it."
            );
        } catch (requestError) {
            setFormError(
                requestError.response?.data?.message || "Failed to save assignment."
            );
        } finally {
            setSaving(false);
        }
    }

    async function removeAssignment(assignment) {
        if (
            !window.confirm(
                `Delete assignment “${assignment.title}” from ${assignment.courseCode}?`
            )
        ) {
            return;
        }

        try {
            setError("");
            await deleteAssignment(assignment.assignmentId);
            setMessage("Assignment deleted successfully.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to delete assignment.");
        }
    }

    async function loadSubmissions(assignment) {
        try {
            setLoadingSubmissions(true);
            setSubmissionError("");
            const response = await getAssignmentSubmissionsForTeacher(
                assignment.assignmentId
            );
            const rows = Array.isArray(response.data) ? response.data : [];
            setSubmissionRows(rows);
            setFeedbackDrafts(
                Object.fromEntries(
                    rows
                        .filter((row) => row.submission_id)
                        .map((row) => [row.submission_id, row.teacher_feedback || ""])
                )
            );
        } catch (requestError) {
            setSubmissionRows([]);
            setSubmissionError(
                requestError.response?.data?.message || "Failed to load submissions."
            );
        } finally {
            setLoadingSubmissions(false);
        }
    }

    function openSubmissions(assignment) {
        setSubmissionAssignment(assignment);
        setSubmissionRows([]);
        setSubmissionMessage("");
        loadSubmissions(assignment);
    }

    async function handleFeedbackSave(row) {
        const feedback = String(feedbackDrafts[row.submission_id] || "").trim();
        if (!feedback) {
            setSubmissionError("Enter feedback before saving.");
            return;
        }

        try {
            setSavingFeedbackId(row.submission_id);
            setSubmissionError("");
            setSubmissionMessage("");
            await saveTeacherFeedback(row.submission_id, feedback);
            setSubmissionMessage(`Feedback saved for ${row.student_code}.`);
            await loadSubmissions(submissionAssignment);
            await loadData();
        } catch (requestError) {
            setSubmissionError(
                requestError.response?.data?.message || "Failed to save feedback."
            );
        } finally {
            setSavingFeedbackId(null);
        }
    }

    async function handleSubmissionDownload(row) {
        try {
            setSubmissionError("");
            await downloadSubmission(row.submission_id, row.original_name);
        } catch {
            setSubmissionError("Failed to download the submitted PDF.");
        }
    }

    async function handleSubmissionView(row) {
        try {
            setSubmissionError("");
            await viewSubmission(row.submission_id);
        } catch {
            setSubmissionError("Failed to open the submitted PDF.");
        }
    }

    function formatFileSize(value) {
        const bytes = Number(value);
        if (!Number.isFinite(bytes) || bytes < 0) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function formatDateTime(value) {
        if (!value) return "—";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
    }

    function exportAssignments() {
        exportToCsv("teacher-assignments.csv", visibleAssignments, [
            { header: "Title", key: "title" },
            { header: "Course Code", key: "courseCode" },
            { header: "Course Name", key: "courseName" },
            {
                header: "Due Date",
                value: (row) => (row.dueDate ? String(row.dueDate).slice(0, 10) : ""),
            },
            { header: "Max Score", key: "maxScore" },
            { header: "Status", key: "status" },
        ]);
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Teacher
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Assignments
                    </h1>
                    <p className="mt-2 text-[var(--sms-muted)]">
                        Create assignments for your courses and publish them to enrolled
                        students.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={loadData} disabled={loading}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                    <Button type="button" variant="outline" onClick={exportAssignments}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                    <Button
                        type="button"
                        className="sms-btn-primary"
                        onClick={openAdd}
                        disabled={loading}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]"
                >
                    {error}
                </div>
            )}
            {message && (
                <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    {message}
                </div>
            )}

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">Assignment Records</h2>
                        <p className="text-sm text-[var(--sms-muted)]">
                            {visibleAssignments.length} assignment(s)
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                        <Select value={courseFilter} onValueChange={setCourseFilter}>
                            <SelectTrigger className="sm:w-72">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                                <SelectItem value="all">All courses</SelectItem>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={String(course.id)}>
                                        {getCourseLabel(course)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative sm:w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
                            <Input
                                className="pl-9"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search assignments..."
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table className="min-w-[1180px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Max Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submission Progress</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        Loading assignments…
                                    </TableCell>
                                </TableRow>
                            ) : visibleAssignments.length ? (
                                visibleAssignments.map((assignment) => (
                                    <TableRow key={assignment.assignmentId}>
                                        <TableCell>
                                            <p className="font-medium text-[var(--sms-ink)]">
                                                {assignment.title}
                                            </p>
                                            <p className="max-w-md whitespace-normal text-xs text-[var(--sms-muted)]">
                                                {assignment.description || "No description"}
                                            </p>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {assignment.courseCode || "—"}
                                        </TableCell>
                                        <TableCell>{assignment.courseName || "—"}</TableCell>
                                        <TableCell>
                                            {assignment.dueDate
                                                ? String(assignment.dueDate).slice(0, 10)
                                                : "—"}
                                        </TableCell>
                                        <TableCell>{Number(assignment.maxScore)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    assignment.status === "active"
                                                        ? "sms-badge-active"
                                                        : "sms-badge-inactive"
                                                }
                                            >
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="min-w-[190px]">
                                            <div className="flex flex-wrap gap-1.5 text-xs">
                                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                    Submitted {assignment.submittedCount} / {assignment.totalStudents}
                                                </Badge>
                                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                                    Late {assignment.lateCount}
                                                </Badge>
                                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                    Reviewed {assignment.reviewedCount}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="whitespace-nowrap"
                                                    aria-label={`View submissions for ${assignment.title}`}
                                                    onClick={() => openSubmissions(assignment)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Submissions
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    aria-label={`Edit ${assignment.title}`}
                                                    onClick={() => openEdit(assignment)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    aria-label={`Delete ${assignment.title}`}
                                                    onClick={() => removeAssignment(assignment)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-[var(--sms-danger)]" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No assignments found. Create one for an active course to
                                        publish it to enrolled students.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Assignment" : "Create Assignment"}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        id="teacher-assignment-form"
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {formError && (
                            <div
                                role="alert"
                                className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]"
                            >
                                {formError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="assignment-course">Course</Label>
                            <Select
                                value={form.courseId || undefined}
                                onValueChange={(value) =>
                                    setForm((current) => ({ ...current, courseId: value }))
                                }
                                disabled={saving}
                            >
                                <SelectTrigger id="assignment-course" className="w-full">
                                    <SelectValue placeholder="Select your course" />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                    {activeCourses.map((course) => (
                                        <SelectItem key={course.id} value={String(course.id)}>
                                            {getCourseLabel(course)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!activeCourses.length && (
                                <p className="text-xs text-[var(--sms-danger)]">
                                    No active courses are assigned to your teacher account.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignment-title">Title</Label>
                            <Input
                                id="assignment-title"
                                name="title"
                                value={form.title}
                                onChange={change}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignment-description">Description</Label>
                            <textarea
                                id="assignment-description"
                                name="description"
                                value={form.description}
                                onChange={change}
                                rows={5}
                                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="assignment-due-date">Due Date</Label>
                                <Input
                                    id="assignment-due-date"
                                    name="dueDate"
                                    type="date"
                                    value={form.dueDate}
                                    onChange={change}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assignment-max-score">Max Score</Label>
                                <Input
                                    id="assignment-max-score"
                                    name="maxScore"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.maxScore}
                                    onChange={change}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:w-1/2 md:pr-2">
                            <Label htmlFor="assignment-status">Status</Label>
                            <Select
                                value={form.status}
                                onValueChange={(value) =>
                                    setForm((current) => ({ ...current, status: value }))
                                }
                                disabled={saving}
                            >
                                <SelectTrigger id="assignment-status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="teacher-assignment-form"
                                className="sms-btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving…"
                                    : editing
                                      ? "Update Assignment"
                                      : "Create Assignment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(submissionAssignment)}
                onOpenChange={(open) => {
                    if (!open && !savingFeedbackId) {
                        setSubmissionAssignment(null);
                        setSubmissionRows([]);
                        setSubmissionError("");
                        setSubmissionMessage("");
                    }
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="flex max-h-[90vh] w-[95vw] max-w-[95vw] flex-col gap-0 overflow-hidden p-0 lg:max-w-6xl xl:max-w-7xl"
                >
                    <DialogHeader className="static m-0 shrink-0 gap-1 border-b border-[var(--sms-line)] bg-card px-6 py-4 pr-6">
                        <DialogTitle className="text-lg">Assignment Submissions</DialogTitle>
                        <DialogDescription>
                            Review PDF submissions and send feedback for {submissionAssignment?.courseCode || "this course"}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
                        <div className="rounded-xl border border-[var(--sms-line)] bg-slate-50 p-4 shadow-sm">
                            <p className="font-semibold text-[var(--sms-ink)]">
                                {submissionAssignment?.title}
                            </p>
                            <p className="mt-1 text-sm text-[var(--sms-muted)]">
                                {submissionAssignment?.courseCode} - {submissionAssignment?.courseName}
                            </p>
                        </div>

                        {submissionError && (
                            <div
                                role="alert"
                                className="rounded-xl border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]"
                            >
                                {submissionError}
                            </div>
                        )}
                        {submissionMessage && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                {submissionMessage}
                            </div>
                        )}

                        <div className="w-full overflow-x-auto rounded-xl border border-[var(--sms-line)] bg-card shadow-sm">
                            <Table className="min-w-[1500px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-28 whitespace-nowrap px-3">Student Code</TableHead>
                                    <TableHead className="min-w-[180px] px-3">Student Name</TableHead>
                                    <TableHead className="w-32 whitespace-nowrap px-3">Status</TableHead>
                                    <TableHead className="min-w-[160px] whitespace-nowrap px-3">Submitted At</TableHead>
                                    <TableHead className="w-24 whitespace-nowrap px-3">Late</TableHead>
                                    <TableHead className="min-w-[260px] px-3">Submitted File</TableHead>
                                    <TableHead className="min-w-[220px] px-3">Student Note</TableHead>
                                    <TableHead className="min-w-[280px] px-3">Teacher Feedback</TableHead>
                                    <TableHead className="min-w-[130px] whitespace-nowrap px-3">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingSubmissions ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-12 text-center text-[var(--sms-muted)]">
                                            Loading submissions…
                                        </TableCell>
                                    </TableRow>
                                ) : submissionRows.length ? (
                                    submissionRows.map((row) => (
                                        <TableRow key={row.student_id}>
                                            <TableCell className="w-28 whitespace-nowrap px-3 font-mono text-xs">
                                                {row.student_code}
                                            </TableCell>
                                            <TableCell className="min-w-[180px] whitespace-normal px-3 font-medium">
                                                {row.student_name}
                                            </TableCell>
                                            <TableCell className="w-32 whitespace-nowrap px-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        !row.submission_id
                                                            ? "sms-badge-inactive"
                                                            : row.status === "reviewed"
                                                              ? "sms-badge-active"
                                                              : row.is_late
                                                                ? "border-red-200 bg-red-50 text-red-700"
                                                              : "border-blue-200 bg-blue-50 text-blue-700"
                                                    }
                                                >
                                                    {!row.submission_id
                                                        ? "Not Submitted"
                                                        : row.status === "reviewed"
                                                          ? "Reviewed"
                                                          : row.is_late
                                                            ? "Late"
                                                          : "Submitted"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="min-w-[160px] whitespace-nowrap px-3 text-sm">
                                                {formatDateTime(row.submitted_at)}
                                            </TableCell>
                                            <TableCell className="w-24 whitespace-nowrap px-3">
                                                {row.submission_id ? (
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            row.is_late
                                                                ? "border-red-200 bg-red-50 text-red-700"
                                                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        }
                                                    >
                                                        {row.is_late ? "Late" : "On time"}
                                                    </Badge>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell className="min-w-[260px] whitespace-normal px-3 align-top">
                                                {row.submission_id ? (
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p
                                                                className="max-w-[250px] break-all text-sm font-medium text-[var(--sms-ink)]"
                                                                title={row.original_name}
                                                            >
                                                                {row.original_name || row.file_name || "Submitted PDF"}
                                                            </p>
                                                            {row.file_size != null && (
                                                                <p className="mt-0.5 text-xs text-[var(--sms-muted)]">
                                                                    {formatFileSize(row.file_size)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSubmissionDownload(row)}
                                                            >
                                                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                                                Download PDF
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSubmissionView(row)}
                                                            >
                                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                View PDF
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-[var(--sms-muted)]">No file submitted</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button type="button" variant="outline" size="sm" disabled>
                                                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                                                Download PDF
                                                            </Button>
                                                            <Button type="button" variant="outline" size="sm" disabled>
                                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                View PDF
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="min-w-[220px] whitespace-normal px-3 align-top text-sm">
                                                <p className="max-w-[260px] break-words">
                                                    {row.student_note || "—"}
                                                </p>
                                            </TableCell>
                                            <TableCell className="min-w-[280px] whitespace-normal px-3 align-top">
                                                <textarea
                                                    aria-label={`Feedback for ${row.student_code}`}
                                                    value={
                                                        row.submission_id
                                                            ? feedbackDrafts[row.submission_id] || ""
                                                            : ""
                                                    }
                                                    onChange={(event) =>
                                                        setFeedbackDrafts((current) => ({
                                                            ...current,
                                                            [row.submission_id]: event.target.value,
                                                        }))
                                                    }
                                                    maxLength={5000}
                                                    rows={3}
                                                    disabled={!row.submission_id || savingFeedbackId === row.submission_id}
                                                    placeholder={row.submission_id ? "Write feedback..." : "Awaiting submission"}
                                                    className="min-w-[280px] resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                                                />
                                            </TableCell>
                                            <TableCell className="min-w-[130px] px-3 align-top">
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <Button
                                                        type="button"
                                                        className="sms-btn-primary whitespace-nowrap"
                                                        disabled={!row.submission_id || savingFeedbackId === row.submission_id}
                                                        onClick={() => handleFeedbackSave(row)}
                                                    >
                                                        <Save className="mr-2 h-4 w-4" />
                                                        {savingFeedbackId === row.submission_id ? "Saving…" : "Save"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-12 text-center text-[var(--sms-muted)]">
                                            No actively enrolled students were found for this course.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter className="static m-0 shrink-0 border-t border-[var(--sms-line)] bg-card px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSubmissionAssignment(null)}
                            disabled={Boolean(savingFeedbackId)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default TeacherAssignments;
