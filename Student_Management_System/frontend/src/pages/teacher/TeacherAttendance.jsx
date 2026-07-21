import { useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { CalendarCheck, CheckCircle2, FileSpreadsheet, FileText, Save, Search } from "lucide-react";

import {
    attendanceStudentsData,
    teacherCoursesData,
} from "@/data/mockData";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function TeacherAttendance() {
    const [selectedCourse, setSelectedCourse] = useState("ITE-301");
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [attendanceBySession, setAttendanceBySession] = useState({});
    const [dirtySessions, setDirtySessions] = useState(() => new Set());
    const [saveMessage, setSaveMessage] = useState("");
    const sessionKey = `${selectedCourse}:${attendanceDate}`;
    const attendanceRecords = attendanceBySession[sessionKey] ?? attendanceStudentsData;
    const hasUnsavedChanges = dirtySessions.has(sessionKey);

    function handleCourseChange(value) {
        setSelectedCourse(value);
        setSaveMessage("");
    }

    function handleDateChange(event) {
        setAttendanceDate(event.target.value);
        setSaveMessage("");
    }

    const selectedCourseInfo = teacherCoursesData.find(
        (course) => course.courseCode === selectedCourse
    );

    const filteredRecords = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return attendanceRecords.filter((record) => {
            const sameCourse = record.courseCode === selectedCourse;

            const matchSearch =
                record.studentCode.toLowerCase().includes(keyword) ||
                record.studentName.toLowerCase().includes(keyword) ||
                record.status.toLowerCase().includes(keyword) ||
                record.remark.toLowerCase().includes(keyword);

            return sameCourse && matchSearch;
        });
    }, [attendanceRecords, selectedCourse, searchTerm]);

    const totalStudents = filteredRecords.length;
    const presentCount = filteredRecords.filter(
        (record) => record.status === "Present"
    ).length;
    const absentCount = filteredRecords.filter(
        (record) => record.status === "Absent"
    ).length;
    const lateCount = filteredRecords.filter(
        (record) => record.status === "Late"
    ).length;

    function updateStatus(studentId, status) {
        setAttendanceBySession((prev) => ({
            ...prev,
            [sessionKey]: (prev[sessionKey] ?? attendanceStudentsData).map((record) =>
                record.id === studentId
                    ? {
                        ...record,
                        status,
                    }
                    : record
            ),
        }));
        setDirtySessions((prev) => new Set(prev).add(sessionKey));
        setSaveMessage("");
    }

    function updateRemark(studentId, remark) {
        setAttendanceBySession((prev) => ({
            ...prev,
            [sessionKey]: (prev[sessionKey] ?? attendanceStudentsData).map((record) =>
                record.id === studentId
                    ? {
                        ...record,
                        remark,
                    }
                    : record
            ),
        }));
        setDirtySessions((prev) => new Set(prev).add(sessionKey));
        setSaveMessage("");
    }

    function getStatusBadgeClass(status) {
        if (status === "Present") {
            return "sms-badge-active";
        }

        if (status === "Late") {
            return "sms-badge-warning";
        }

        return "sms-badge-inactive";
    }

    function handleSaveAttendance() {
        setDirtySessions((prev) => {
            const next = new Set(prev);
            next.delete(sessionKey);
            return next;
        });
        setSaveMessage(`Attendance saved for ${selectedCourse} on ${attendanceDate}.`);
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Teacher
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Attendance Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Select a course, choose the attendance date, then mark students as
                        Present, Absent, or Late.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handleSaveAttendance}
                        disabled={!hasUnsavedChanges}
                        className="sms-btn-primary"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Attendance
                    </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("teacher-attendance.csv")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-ink)]">
                        {totalStudents}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Students
                    </p>
                </div>

                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-success)]">{presentCount}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Present
                    </p>
                </div>

                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-danger)]">{absentCount}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Absent
                    </p>
                </div>

                <div className="sms-card p-5">
                    <p className="text-3xl font-bold text-[var(--sms-warning)]">{lateCount}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                        Late
                    </p>
                </div>
            </section>

            <section className="sms-input-panel mb-8 p-5">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Course</Label>
                        <Select value={selectedCourse} onValueChange={handleCourseChange}>
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
                        <Label>Attendance Date</Label>
                        <Input
                            type="date"
                            value={attendanceDate}
                            onChange={handleDateChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Search Student</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
                            <Input
                                placeholder="Search name or ID..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-md border border-[var(--sms-line)] bg-[var(--sms-paper)] p-4 text-sm text-[var(--sms-muted)]">
                    <CalendarCheck className="mr-2 inline h-4 w-4" />
                    Selected course:{" "}
                    <strong className="text-[var(--sms-ink)]">
                        {selectedCourseInfo?.courseName}
                    </strong>{" "}
                    · Date:{" "}
                    <strong className="text-[var(--sms-ink)]">{attendanceDate}</strong>
                </div>

                {saveMessage && (
                    <p role="status" className="mt-3 flex items-center gap-2 rounded-md border border-[var(--sms-success-border)] bg-[var(--sms-success-bg)] px-4 py-3 text-sm font-medium text-[var(--sms-success)]">
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                        {saveMessage}
                    </p>
                )}
            </section>

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Attendance Records
                    </h2>
                    <p className="text-sm text-[var(--sms-muted)]">
                        {filteredRecords.length} student(s) found
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Mark Attendance</TableHead>
                                <TableHead>Remark</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-mono text-xs">
                                            {record.studentCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {record.studentName}
                                        </TableCell>

                                        <TableCell>
                                            {record.courseName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {record.courseCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(record.status)}
                                            >
                                                {record.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex min-w-max gap-1" role="group" aria-label={`Mark attendance for ${record.studentName}`}>
                                                {["Present", "Absent", "Late"].map((status) => {
                                                    const isSelected = record.status === status;
                                                    const selectedClass = status === "Present"
                                                        ? "border-[var(--sms-success-border)] bg-[var(--sms-success-bg)] text-[var(--sms-success)]"
                                                        : status === "Absent"
                                                            ? "border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] text-[var(--sms-danger)]"
                                                            : "border-[var(--sms-warning-border)] bg-[var(--sms-warning-bg)] text-[var(--sms-warning)]";

                                                    return (
                                                        <Button
                                                            key={status}
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            aria-pressed={isSelected}
                                                            onClick={() => updateStatus(record.id, status)}
                                                            className={isSelected ? selectedClass : "bg-[var(--sms-card)] text-[var(--sms-muted)]"}
                                                        >
                                                            {status}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Input
                                                value={record.remark}
                                                onChange={(event) =>
                                                    updateRemark(record.id, event.target.value)
                                                }
                                                placeholder="Optional remark"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="6"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No students found for this course.
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

export default TeacherAttendance;
