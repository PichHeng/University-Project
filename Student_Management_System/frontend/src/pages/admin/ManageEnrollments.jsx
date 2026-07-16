import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import { enrollmentsData } from "@/data/mockData";

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
    enrollmentCode: "",
    studentName: "",
    studentCode: "",
    courseName: "",
    courseCode: "",
    department: "",
    enrollmentDate: "",
    status: "Active",
};

function ManageEnrollments() {
    const [enrollments, setEnrollments] = useState(enrollmentsData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const filteredEnrollments = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return enrollments.filter((enrollment) => {
            return (
                enrollment.enrollmentCode.toLowerCase().includes(keyword) ||
                enrollment.studentName.toLowerCase().includes(keyword) ||
                enrollment.studentCode.toLowerCase().includes(keyword) ||
                enrollment.courseName.toLowerCase().includes(keyword) ||
                enrollment.courseCode.toLowerCase().includes(keyword) ||
                enrollment.department.toLowerCase().includes(keyword) ||
                enrollment.status.toLowerCase().includes(keyword)
            );
        });
    }, [enrollments, searchTerm]);

    function openAddDialog() {
        setEditingEnrollment(null);
        setFormData(emptyForm);
        setIsDialogOpen(true);
    }

    function openEditDialog(enrollment) {
        setEditingEnrollment(enrollment);

        setFormData({
            enrollmentCode: enrollment.enrollmentCode,
            studentName: enrollment.studentName,
            studentCode: enrollment.studentCode,
            courseName: enrollment.courseName,
            courseCode: enrollment.courseCode,
            department: enrollment.department,
            enrollmentDate: enrollment.enrollmentDate,
            status: enrollment.status,
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

    function handleSelectChange(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (editingEnrollment) {
            setEnrollments((prev) =>
                prev.map((enrollment) =>
                    enrollment.id === editingEnrollment.id
                        ? {
                            ...enrollment,
                            ...formData,
                        }
                        : enrollment
                )
            );
        } else {
            const newEnrollment = {
                id: Date.now(),
                ...formData,
            };

            setEnrollments((prev) => [newEnrollment, ...prev]);
        }

        setIsDialogOpen(false);
        setEditingEnrollment(null);
        setFormData(emptyForm);
    }

    function handleDelete(enrollmentId) {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this enrollment?"
        );

        if (!isConfirmed) return;

        setEnrollments((prev) =>
            prev.filter((enrollment) => enrollment.id !== enrollmentId)
        );
    }

    function getStatusBadgeClass(status) {
        if (status === "Active") {
            return "border-green-200 bg-green-50 text-green-700";
        }

        if (status === "Completed") {
            return "border-blue-200 bg-blue-50 text-blue-700";
        }

        return "border-red-200 bg-red-50 text-red-700";
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Administrator
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Enrollment Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Manage student course enrollments, enrollment dates, departments,
                        and enrollment status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={openAddDialog}
                        className="bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Enrollment
                    </Button>

                    <Button variant="outline">Export PDF</Button>
                    <Button variant="outline">Export Excel</Button>
                </div>
            </div>

            <section className="rounded-md border border-[var(--sms-line)] bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--sms-line)] bg-[var(--sms-paper-soft)] px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Enrollment Records
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {filteredEnrollments.length} record(s) found
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                        <Input
                            placeholder="Search enrollment..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Enrollment ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredEnrollments.length > 0 ? (
                                filteredEnrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell className="font-mono text-xs">
                                            {enrollment.enrollmentCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {enrollment.studentName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {enrollment.studentCode}
                                            </p>
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {enrollment.courseName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {enrollment.courseCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>{enrollment.department}</TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {enrollment.enrollmentDate}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(enrollment.status)}
                                            >
                                                {enrollment.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(enrollment)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(enrollment.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
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
                                        No enrollments found.
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
                            {editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Enrollment ID</Label>
                                <Input
                                    name="enrollmentCode"
                                    value={formData.enrollmentCode}
                                    onChange={handleInputChange}
                                    placeholder="ENR-1004"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Enrollment Date</Label>
                                <Input
                                    name="enrollmentDate"
                                    type="date"
                                    value={formData.enrollmentDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Student Name</Label>
                                <Input
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleInputChange}
                                    placeholder="Chea Pich Heng"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Student ID</Label>
                                <Input
                                    name="studentCode"
                                    value={formData.studentCode}
                                    onChange={handleInputChange}
                                    placeholder="STU-1001"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Course Name</Label>
                                <Input
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    placeholder="Web Application Development"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Course Code</Label>
                                <Input
                                    name="courseCode"
                                    value={formData.courseCode}
                                    onChange={handleInputChange}
                                    placeholder="ITE-301"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    placeholder="Information Technology Engineering"
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
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Dropped">Dropped</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                className="bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                            >
                                {editingEnrollment ? "Save Changes" : "Save Enrollment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageEnrollments;