import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import { studentsData } from "@/data/mockData";

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
    studentCode: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    department: "",
    yearLevel: "Year 1",
    phone: "",
    email: "",
    status: "Active",
};

function ManageStudents() {
    const [students, setStudents] = useState(studentsData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const filteredStudents = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return students.filter((student) => {
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

            return (
                student.studentCode.toLowerCase().includes(keyword) ||
                fullName.includes(keyword) ||
                student.department.toLowerCase().includes(keyword) ||
                student.status.toLowerCase().includes(keyword)
            );
        });
    }, [students, searchTerm]);

    function openAddDialog() {
        setEditingStudent(null);
        setFormData(emptyForm);
        setIsDialogOpen(true);
    }

    function openEditDialog(student) {
        setEditingStudent(student);
        setFormData({
            studentCode: student.studentCode,
            firstName: student.firstName,
            lastName: student.lastName,
            gender: student.gender,
            department: student.department,
            yearLevel: student.yearLevel,
            phone: student.phone,
            email: student.email,
            status: student.status,
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

        if (editingStudent) {
            setStudents((prev) =>
                prev.map((student) =>
                    student.id === editingStudent.id
                        ? {
                            ...student,
                            ...formData,
                        }
                        : student
                )
            );
        } else {
            const newStudent = {
                id: Date.now(),
                ...formData,
            };

            setStudents((prev) => [newStudent, ...prev]);
        }

        setIsDialogOpen(false);
        setEditingStudent(null);
        setFormData(emptyForm);
    }

    function handleDelete(studentId) {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!isConfirmed) return;

        setStudents((prev) => prev.filter((student) => student.id !== studentId));
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Administrator
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Student Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Manage student records, departments, year levels, status, and contact
                        information.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={openAddDialog}
                        className="bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>

                    <Button variant="outline">Export PDF</Button>
                    <Button variant="outline">Export Excel</Button>
                </div>
            </div>

            <section className="rounded-md border border-[var(--sms-line)] bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--sms-line)] bg-[var(--sms-paper-soft)] px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Student Records
                        </h2>
                        <p className="text-sm text-[var(--sms-muted)]">
                            {filteredStudents.length} record(s) found
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
                        <Input
                            placeholder="Search student..."
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
                                <TableHead>Student ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono text-xs">
                                            {student.studentCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {student.firstName} {student.lastName}
                                            <p className="text-xs text-[var(--sms-muted)]">
                                                {student.email}
                                            </p>
                                        </TableCell>

                                        <TableCell>{student.gender}</TableCell>
                                        <TableCell>{student.department}</TableCell>
                                        <TableCell>{student.yearLevel}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {student.phone}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    student.status === "Active"
                                                        ? "border-green-200 bg-green-50 text-green-700"
                                                        : "border-red-200 bg-red-50 text-red-700"
                                                }
                                            >
                                                {student.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(student)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(student.id)}
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
                                        colSpan="8"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No students found.
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
                            {editingStudent ? "Edit Student" : "Add Student"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Student ID</Label>
                                <Input
                                    name="studentCode"
                                    value={formData.studentCode}
                                    onChange={handleInputChange}
                                    placeholder="STU-1004"
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
                                <Label>First Name</Label>
                                <Input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleSelectChange("gender", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Year Level</Label>
                                <Select
                                    value={formData.yearLevel}
                                    onValueChange={(value) =>
                                        handleSelectChange("yearLevel", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Year 1">Year 1</SelectItem>
                                        <SelectItem value="Year 2">Year 2</SelectItem>
                                        <SelectItem value="Year 3">Year 3</SelectItem>
                                        <SelectItem value="Year 4">Year 4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="012 345 678"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="student@email.com"
                                    type="email"
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
                                        <SelectItem value="Inactive">Inactive</SelectItem>
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
                                {editingStudent ? "Save Changes" : "Save Student"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageStudents;