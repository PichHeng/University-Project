import { useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import {
    Edit,
    FileSpreadsheet,
    FileText,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import { assignmentsData, teacherCoursesData } from "@/data/mockData";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

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
    assignmentCode: "",
    assignmentTitle: "",
    courseCode: "ITE-301",
    courseName: "Web Application Development",
    dueDate: "",
    totalScore: 20,
    description: "",
    status: "Open",
};

function TeacherAssignments() {
    const [assignments, setAssignments] = useState(assignmentsData);
    const [selectedCourse, setSelectedCourse] = useState("ITE-301");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const selectedCourseInfo = teacherCoursesData.find(
        (course) => course.courseCode === selectedCourse
    );

    const filteredAssignments = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return assignments.filter((assignment) => {
            const sameCourse = assignment.courseCode === selectedCourse;

            const matchSearch =
                assignment.assignmentCode.toLowerCase().includes(keyword) ||
                assignment.assignmentTitle.toLowerCase().includes(keyword) ||
                assignment.courseName.toLowerCase().includes(keyword) ||
                assignment.status.toLowerCase().includes(keyword) ||
                assignment.description.toLowerCase().includes(keyword);

            return sameCourse && matchSearch;
        });
    }, [assignments, selectedCourse, searchTerm]);

    const openCount = filteredAssignments.filter(
        (assignment) => assignment.status === "Open"
    ).length;

    const draftCount = filteredAssignments.filter(
        (assignment) => assignment.status === "Draft"
    ).length;

    const closedCount = filteredAssignments.filter(
        (assignment) => assignment.status === "Closed"
    ).length;

    function openAddDialog() {
        const course = teacherCoursesData.find(
            (item) => item.courseCode === selectedCourse
        );

        setEditingAssignment(null);

        setFormData({
            ...emptyForm,
            assignmentCode: `ASM-${1000 + assignments.length + 1}`,
            courseCode: course?.courseCode || "ITE-301",
            courseName: course?.courseName || "Web Application Development",
        });

        setIsDialogOpen(true);
    }

    function openEditDialog(assignment) {
        setEditingAssignment(assignment);

        setFormData({
            assignmentCode: assignment.assignmentCode,
            assignmentTitle: assignment.assignmentTitle,
            courseCode: assignment.courseCode,
            courseName: assignment.courseName,
            dueDate: assignment.dueDate,
            totalScore: assignment.totalScore,
            description: assignment.description,
            status: assignment.status,
        });

        setIsDialogOpen(true);
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleScoreChange(event) {
        const value = Number(event.target.value);

        if (value < 1 || value > 100) return;

        setFormData((prev) => ({
            ...prev,
            totalScore: value,
        }));
    }

    function handleCourseChange(courseCode) {
        const course = teacherCoursesData.find(
            (item) => item.courseCode === courseCode
        );

        setFormData((prev) => ({
            ...prev,
            courseCode,
            courseName: course?.courseName || "",
        }));
    }

    function handleSelectChange(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (editingAssignment) {
            setAssignments((prev) =>
                prev.map((assignment) =>
                    assignment.id === editingAssignment.id
                        ? {
                            ...assignment,
                            ...formData,
                        }
                        : assignment
                )
            );
        } else {
            const newAssignment = {
                id: Date.now(),
                ...formData,
            };

            setAssignments((prev) => [newAssignment, ...prev]);
        }

        setIsDialogOpen(false);
        setEditingAssignment(null);
        setFormData(emptyForm);
    }

    function handleDelete(assignmentId) {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this assignment?"
        );

        if (!isConfirmed) return;

        setAssignments((prev) =>
            prev.filter((assignment) => assignment.id !== assignmentId)
        );
    }

    function getStatusBadgeClass(status) {
        if (status === "Open") {
            return "sms-badge-active";
        }

        if (status === "Draft") {
            return "sms-badge-warning";
        }

        return "border-slate-200 bg-slate-50 text-slate-700";
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Teacher
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Assignment Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Create, update, and manage assignments for your courses with due
                        dates, total scores, and assignment status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={openAddDialog}
                        className="sms-btn-primary"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Assignment
                    </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("teacher-assignments.csv")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-ink)]">
                        {filteredAssignments.length}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Assignments
                    </p>
                </div>

                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-success)]">{openCount}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Open
                    </p>
                </div>

                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-warning)]">{draftCount}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Draft
                    </p>
                </div>

                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-slate-700">{closedCount}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Closed
                    </p>
                </div>
            </section>

            <section className="sms-input-panel mb-8 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Course</Label>

                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                            </SelectTrigger>

                            <SelectContent>
                                {teacherCoursesData.map((course) => (
                                    <SelectItem key={course.id} value={course.courseCode}>
                                        {course.courseCode} — {course.courseName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Search Assignment</Label>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                            <Input
                                placeholder="Search assignment..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-md border border-[var(--sms-line)] bg-[var(--sms-paper)] p-4 text-sm text-[var(--sms-muted)]">
                    Selected course:{" "}
                    <strong className="text-[var(--sms-ink)]">
                        {selectedCourseInfo?.courseName}
                    </strong>
                </div>
            </section>

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Assignment Records
                    </h2>

                    <p className="text-sm text-[var(--sms-muted)]">
                        {filteredAssignments.length} assignment(s) found
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Total Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredAssignments.length > 0 ? (
                                filteredAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-mono text-xs">
                                            {assignment.assignmentCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {assignment.assignmentTitle}
                                            <p className="max-w-md text-xs text-[var(--sms-muted)]">
                                                {assignment.description}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            {assignment.courseName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {assignment.courseCode}
                                            </p>
                                        </TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {assignment.dueDate}
                                        </TableCell>

                                        <TableCell>{assignment.totalScore}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(assignment.status)}
                                            >
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(assignment)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(assignment.id)}
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
                                        colSpan="7"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No assignments found for this course.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAssignment ? "Edit Assignment" : "Add Assignment"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Assignment ID</Label>
                                <Input
                                    name="assignmentCode"
                                    value={formData.assignmentCode}
                                    onChange={handleInputChange}
                                    placeholder="ASM-1004"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Course</Label>
                                <Select
                                    value={formData.courseCode}
                                    onValueChange={handleCourseChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {teacherCoursesData.map((course) => (
                                            <SelectItem key={course.id} value={course.courseCode}>
                                                {course.courseCode} — {course.courseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Assignment Title</Label>
                                <Input
                                    name="assignmentTitle"
                                    value={formData.assignmentTitle}
                                    onChange={handleInputChange}
                                    placeholder="React Component Practice"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Total Score</Label>
                                <Input
                                    name="totalScore"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.totalScore}
                                    onChange={handleScoreChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Assignment instruction or description"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="sms-btn-primary"
                            >
                                {editingAssignment ? "Save Changes" : "Save Assignment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default TeacherAssignments;
