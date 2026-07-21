import { useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { FileSpreadsheet, FileText, Save, Search } from "lucide-react";

import { gradeStudentsData, teacherCoursesData } from "@/data/mockData";

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

function calculateTotal(assignmentScore, midtermScore, finalScore) {
  return Number(assignmentScore) + Number(midtermScore) + Number(finalScore);
}

function calculateGradeLetter(totalScore) {
  if (totalScore >= 85) return "A";
  if (totalScore >= 70) return "B";
  if (totalScore >= 60) return "C";
  if (totalScore >= 50) return "D";
  return "F";
}

function getGradeBadgeClass(gradeLetter) {
  if (gradeLetter === "A") {
    return "sms-badge-active";
  }

  if (gradeLetter === "B") {
    return "sms-badge-info";
  }

  if (gradeLetter === "C") {
    return "sms-badge-warning";
  }

  if (gradeLetter === "D") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "sms-badge-inactive";
}

function TeacherGrades() {
  const [selectedCourse, setSelectedCourse] = useState("ITE-301");
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeRecords, setGradeRecords] = useState(gradeStudentsData);

  const selectedCourseInfo = teacherCoursesData.find(
    (course) => course.courseCode === selectedCourse
  );

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return gradeRecords.filter((record) => {
      const sameCourse = record.courseCode === selectedCourse;

      const matchSearch =
        record.studentCode.toLowerCase().includes(keyword) ||
        record.studentName.toLowerCase().includes(keyword) ||
        record.courseName.toLowerCase().includes(keyword);

      return sameCourse && matchSearch;
    });
  }, [gradeRecords, selectedCourse, searchTerm]);

  const averageScore =
    filteredRecords.length > 0
      ? Math.round(
          filteredRecords.reduce((sum, record) => {
            return (
              sum +
              calculateTotal(
                record.assignmentScore,
                record.midtermScore,
                record.finalScore
              )
            );
          }, 0) / filteredRecords.length
        )
      : 0;

  const passedCount = filteredRecords.filter((record) => {
    const total = calculateTotal(
      record.assignmentScore,
      record.midtermScore,
      record.finalScore
    );

    return total >= 50;
  }).length;

  const failedCount = filteredRecords.length - passedCount;

  function updateScore(studentId, field, value) {
    const numericValue = value === "" ? 0 : Number(value);

    if (numericValue < 0 || numericValue > 100) return;

    setGradeRecords((prev) =>
      prev.map((record) =>
        record.id === studentId
          ? {
              ...record,
              [field]: numericValue,
            }
          : record
      )
    );
  }

  function handleSaveGrades() {
    window.alert("Grades were saved for this browser session. Database records require enrollment IDs from the live API.");
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
            Teacher
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
            Grade Management
          </h1>

          <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
            Enter assignment, midterm, and final scores. The system will
            automatically calculate total score and grade letter.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSaveGrades}
            className="sms-btn-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Grades
          </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("teacher-grades.csv")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="sms-card p-5">
          <p className="text-3xl font-bold text-[var(--sms-ink)]">
            {filteredRecords.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
            Students
          </p>
        </div>

        <div className="sms-card p-5">
          <p className="text-3xl font-bold text-[var(--sms-info)]">{averageScore}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
            Average Score
          </p>
        </div>

        <div className="sms-card p-5">
          <p className="text-3xl font-bold text-[var(--sms-success)]">{passedCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
            Passed
          </p>
        </div>

        <div className="sms-card p-5">
          <p className="text-3xl font-bold text-[var(--sms-danger)]">{failedCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
            Failed
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
          Selected course:{" "}
          <strong className="text-[var(--sms-ink)]">
            {selectedCourseInfo?.courseName}
          </strong>
        </div>
      </section>

      <section className="sms-card overflow-hidden">
        <div className="sms-section-header px-5 py-4">
          <h2 className="font-semibold text-[var(--sms-ink)]">
            Grade Records
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
                <TableHead>Assignment /20</TableHead>
                <TableHead>Midterm /30</TableHead>
                <TableHead>Final /50</TableHead>
                <TableHead>Total /100</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const totalScore = calculateTotal(
                    record.assignmentScore,
                    record.midtermScore,
                    record.finalScore
                  );

                  const gradeLetter = calculateGradeLetter(totalScore);

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">
                        {record.studentCode}
                      </TableCell>

                      <TableCell className="font-medium">
                        {record.studentName}
                        <p className="text-xs text-[var(--sms-muted)]">
                          {record.courseName}
                        </p>
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={record.assignmentScore}
                          onChange={(event) =>
                            updateScore(
                              record.id,
                              "assignmentScore",
                              event.target.value
                            )
                          }
                          className="w-24"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          value={record.midtermScore}
                          onChange={(event) =>
                            updateScore(
                              record.id,
                              "midtermScore",
                              event.target.value
                            )
                          }
                          className="w-24"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={record.finalScore}
                          onChange={(event) =>
                            updateScore(
                              record.id,
                              "finalScore",
                              event.target.value
                            )
                          }
                          className="w-24"
                        />
                      </TableCell>

                      <TableCell className="font-bold text-[var(--sms-ink)]">
                        {totalScore}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getGradeBadgeClass(gradeLetter)}
                        >
                          {gradeLetter}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="py-12 text-center text-[var(--sms-muted)]"
                  >
                    No grade records found for this course.
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

export default TeacherGrades;
