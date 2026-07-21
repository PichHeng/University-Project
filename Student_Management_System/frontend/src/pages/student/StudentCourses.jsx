import { useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import {
    BookOpen,
    CalendarDays,
    Eye,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    MapPin,
    Search,
    User,
} from "lucide-react";

import { studentCoursesData } from "@/data/mockData";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function getStatusBadgeClass(status) {
    if (status === "Active") return "sms-badge-active";
    if (status === "Completed") return "sms-badge-info";
    return "sms-badge-inactive";
}

function StudentCourses() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null);

    const filteredCourses = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return studentCoursesData.filter((course) => {
            return (
                course.courseCode.toLowerCase().includes(keyword) ||
                course.courseName.toLowerCase().includes(keyword) ||
                course.teacher.toLowerCase().includes(keyword) ||
                course.department.toLowerCase().includes(keyword) ||
                course.semester.toLowerCase().includes(keyword) ||
                course.status.toLowerCase().includes(keyword)
            );
        });
    }, [searchTerm]);

    const totalCourses = studentCoursesData.length;

    const activeCourses = studentCoursesData.filter(
        (course) => course.status === "Active"
    ).length;

    const completedCourses = studentCoursesData.filter(
        (course) => course.status === "Completed"
    ).length;

    const totalCredits = studentCoursesData.reduce((sum, course) => {
        return sum + course.credit;
    }, 0);

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Student
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        My Courses
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        View your enrolled courses, teachers, credits, schedule, classroom,
                        and course status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("student-courses.csv")}>
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
                        Total Courses
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <CalendarDays className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />
                    <p className="text-3xl font-bold text-[var(--sms-success)]">
                        {activeCourses}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Active Courses
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <GraduationCap className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />
                    <p className="text-3xl font-bold text-[var(--sms-info)]">
                        {completedCourses}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Completed
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <BookOpen className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />
                    <p className="text-3xl font-bold text-[var(--sms-ink)]">
                        {totalCredits}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Total Credits
                    </p>
                </div>
            </section>

            <section className="sms-card mb-8 rounded-md p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Enrolled Course List
                        </h2>

                        <p className="mt-1 text-sm text-[var(--sms-muted)]">
                            {filteredCourses.length} course(s) found
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Search Course</Label>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                            <Input
                                placeholder="Search course, teacher, or department..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="sms-card rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Course Records
                    </h2>

                    <p className="text-sm text-[var(--sms-muted)]">
                        Your current and completed enrolled courses.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Credit</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-mono text-xs">
                                            {course.courseCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {course.courseName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {course.department}
                                            </p>
                                        </TableCell>

                                        <TableCell>{course.teacher}</TableCell>

                                        <TableCell>{course.credit}</TableCell>

                                        <TableCell>
                                            {course.semester}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                Section {course.section}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            {course.schedule}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {course.time}
                                            </p>
                                        </TableCell>

                                        <TableCell>{course.room}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(course.status)}
                                            >
                                                {course.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setSelectedCourse(course)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="9"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No courses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Dialog
                open={Boolean(selectedCourse)}
                onOpenChange={() => setSelectedCourse(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Course Details</DialogTitle>
                    </DialogHeader>

                    {selectedCourse && (
                        <div className="space-y-5">
                            <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-5">
                                <p className="font-mono text-xs text-[var(--sms-muted)]">
                                    {selectedCourse.courseCode}
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-[var(--sms-ink)]">
                                    {selectedCourse.courseName}
                                </h2>

                                <p className="mt-2 text-sm text-[var(--sms-muted)]">
                                    {selectedCourse.department}
                                </p>

                                <div className="mt-3">
                                    <Badge
                                        variant="outline"
                                        className={getStatusBadgeClass(selectedCourse.status)}
                                    >
                                        {selectedCourse.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-md border border-[var(--sms-line)] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                        <User className="h-4 w-4 text-[var(--sms-gold)]" />
                                        Teacher
                                    </div>
                                    <p className="font-semibold text-[var(--sms-ink)]">
                                        {selectedCourse.teacher}
                                    </p>
                                </div>

                                <div className="rounded-md border border-[var(--sms-line)] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                        <BookOpen className="h-4 w-4 text-[var(--sms-gold)]" />
                                        Credit
                                    </div>
                                    <p className="font-semibold text-[var(--sms-ink)]">
                                        {selectedCourse.credit}
                                    </p>
                                </div>

                                <div className="rounded-md border border-[var(--sms-line)] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                        <CalendarDays className="h-4 w-4 text-[var(--sms-gold)]" />
                                        Schedule
                                    </div>
                                    <p className="font-semibold text-[var(--sms-ink)]">
                                        {selectedCourse.schedule}
                                    </p>
                                    <p className="text-sm text-[var(--sms-muted)]">
                                        {selectedCourse.time}
                                    </p>
                                </div>

                                <div className="rounded-md border border-[var(--sms-line)] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--sms-muted)]">
                                        <MapPin className="h-4 w-4 text-[var(--sms-gold)]" />
                                        Room
                                    </div>
                                    <p className="font-semibold text-[var(--sms-ink)]">
                                        {selectedCourse.room}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default StudentCourses;
