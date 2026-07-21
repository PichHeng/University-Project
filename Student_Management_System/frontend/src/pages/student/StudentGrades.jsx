import { useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import {
    Award,
    BookOpen,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    Search,
    TrendingUp,
} from "lucide-react";

import { studentCoursesData, studentGradesData } from "@/data/mockData";

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

function getGradeBadgeClass(gradeLetter) {
    if (gradeLetter === "A") return "sms-badge-active";
    if (gradeLetter === "B") return "sms-badge-info";
    if (gradeLetter === "C" || gradeLetter === "D") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function getStatusBadgeClass(status) {
    return status === "Passed" ? "sms-badge-active" : "sms-badge-inactive";
}

function StudentGrades() {
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredGrades = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return studentGradesData.filter((record) => {
            const matchCourse =
                selectedCourse === "all" || record.courseCode === selectedCourse;

            const matchSearch =
                record.courseCode.toLowerCase().includes(keyword) ||
                record.courseName.toLowerCase().includes(keyword) ||
                record.teacher.toLowerCase().includes(keyword) ||
                record.gradeLetter.toLowerCase().includes(keyword) ||
                record.status.toLowerCase().includes(keyword);

            return matchCourse && matchSearch;
        });
    }, [selectedCourse, searchTerm]);

    const totalCourses = filteredGrades.length;

    const averageScore =
        filteredGrades.length > 0
            ? Math.round(
                filteredGrades.reduce((sum, record) => {
                    return sum + record.totalScore;
                }, 0) / filteredGrades.length
            )
            : 0;

    const passedCount = filteredGrades.filter(
        (record) => record.status === "Passed"
    ).length;

    const failedCount = filteredGrades.filter(
        (record) => record.status === "Failed"
    ).length;

    const highestScore =
        filteredGrades.length > 0
            ? Math.max(...filteredGrades.map((record) => record.totalScore))
            : 0;

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Student
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        My Grades
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        View your assignment, midterm, final, total scores, grade letters,
                        and academic result status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("student-grades.csv")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
                <div className="sms-card rounded-md p-5">
                    <BookOpen className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />

                    <p className="text-3xl font-bold text-[var(--sms-ink)]">
                        {totalCourses}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Courses
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <TrendingUp className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />

                    <p className="text-3xl font-bold text-[var(--sms-info)]">
                        {averageScore}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Average Score
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <GraduationCap className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />

                    <p className="text-3xl font-bold text-[var(--sms-success)]">
                        {passedCount}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Passed
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <Award className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />

                    <p className="text-3xl font-bold text-[var(--sms-ink)]">
                        {highestScore}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Highest Score
                    </p>
                </div>
            </section>

            <section className="sms-card mb-8 rounded-md p-5">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Course</Label>

                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>

                                {studentCoursesData.map((course) => (
                                    <SelectItem key={course.id} value={course.courseCode}>
                                        {course.courseCode} — {course.courseName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Search Grade</Label>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                            <Input
                                placeholder="Search course, teacher, grade, or status..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4">
                    <p className="text-sm text-[var(--sms-muted)]">Academic Summary</p>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                            <p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                Average
                            </p>
                            <p className="text-xl font-bold text-[var(--sms-ink)]">
                                {averageScore}/100
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                Passed
                            </p>
                            <p className="text-xl font-bold text-[var(--sms-success)]">
                                {passedCount}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                Failed
                            </p>
                            <p className="text-xl font-bold text-[var(--sms-danger)]">
                                {failedCount}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sms-card rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Grade Records
                    </h2>

                    <p className="text-sm text-[var(--sms-muted)]">
                        {filteredGrades.length} grade record(s) found.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Assignment /20</TableHead>
                                <TableHead>Midterm /30</TableHead>
                                <TableHead>Final /50</TableHead>
                                <TableHead>Total /100</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredGrades.length > 0 ? (
                                filteredGrades.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {record.courseName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {record.courseCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>{record.teacher}</TableCell>

                                        <TableCell>{record.assignmentScore}</TableCell>

                                        <TableCell>{record.midtermScore}</TableCell>

                                        <TableCell>{record.finalScore}</TableCell>

                                        <TableCell className="font-bold text-[var(--sms-ink)]">
                                            {record.totalScore}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getGradeBadgeClass(record.gradeLetter)}
                                            >
                                                {record.gradeLetter}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(record.status)}
                                            >
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="8"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No grade records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </>
    );
}

export default StudentGrades;
