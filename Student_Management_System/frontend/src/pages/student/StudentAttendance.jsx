import { useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import {
    CalendarCheck,
    FileSpreadsheet,
    FileText,
    Search,
} from "lucide-react";

import { studentAttendanceData, studentCoursesData } from "@/data/mockData";

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

function getStatusBadgeClass(status) {
    if (status === "Present") return "sms-badge-active";
    if (status === "Late") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function StudentAttendance() {
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAttendance = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return studentAttendanceData.filter((record) => {
            const matchCourse =
                selectedCourse === "all" || record.courseCode === selectedCourse;

            const matchSearch =
                record.courseCode.toLowerCase().includes(keyword) ||
                record.courseName.toLowerCase().includes(keyword) ||
                record.teacher.toLowerCase().includes(keyword) ||
                record.status.toLowerCase().includes(keyword) ||
                record.remark.toLowerCase().includes(keyword);

            return matchCourse && matchSearch;
        });
    }, [selectedCourse, searchTerm]);

    const totalRecords = filteredAttendance.length;

    const presentCount = filteredAttendance.filter(
        (record) => record.status === "Present"
    ).length;

    const lateCount = filteredAttendance.filter(
        (record) => record.status === "Late"
    ).length;

    const absentCount = filteredAttendance.filter(
        (record) => record.status === "Absent"
    ).length;

    const attendanceRate =
        totalRecords > 0
            ? Math.round(((presentCount + lateCount) / totalRecords) * 100)
            : 0;

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Student
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        My Attendance
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        View your attendance history by course, including Present, Absent,
                        Late status, attendance rate, and teacher remarks.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("student-attendance.csv")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
                <div className="sms-card rounded-md p-5">
                    <CalendarCheck className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />
                    <p className="text-3xl font-bold text-[var(--sms-ink)]">
                        {totalRecords}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Records
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <p className="text-3xl font-bold text-[var(--sms-success)]">
                        {presentCount}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Present
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <p className="text-3xl font-bold text-[var(--sms-warning)]">
                        {lateCount}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Late
                    </p>
                </div>

                <div className="sms-card rounded-md p-5">
                    <p className="text-3xl font-bold text-[var(--sms-danger)]">
                        {absentCount}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Absent
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
                        <Label>Search Attendance</Label>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                            <Input
                                placeholder="Search course, teacher, status, or remark..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4">
                    <p className="text-sm text-[var(--sms-muted)]">
                        Attendance Rate
                    </p>

                    <div className="mt-2 flex items-center gap-4">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--sms-line)]">
                            <div
                                className="h-full rounded-full bg-[var(--sms-success)]"
                                style={{ width: `${attendanceRate}%` }}
                            />
                        </div>

                        <p className="min-w-12 text-right text-lg font-bold text-[var(--sms-ink)]">
                            {attendanceRate}%
                        </p>
                    </div>
                </div>
            </section>

            <section className="sms-card rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Attendance Records
                    </h2>

                    <p className="text-sm text-[var(--sms-muted)]">
                        {filteredAttendance.length} attendance record(s) found.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remark</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-mono text-xs">
                                            {record.date}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {record.courseName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {record.courseCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>{record.teacher}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(record.status)}
                                            >
                                                {record.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            {record.remark ? (
                                                <span>{record.remark}</span>
                                            ) : (
                                                <span className="text-[var(--sms-muted)]">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="5"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No attendance records found.
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

export default StudentAttendance;
