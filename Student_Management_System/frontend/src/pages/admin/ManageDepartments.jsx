import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import { departmentsData } from "@/data/mockData";

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
    departmentCode: "",
    departmentName: "",
    description: "",
    students: 0,
    teachers: 0,
    courses: 0,
    status: "Active",
};

function ManageDepartments() {
    const [departments, setDepartments] = useState(departmentsData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const filteredDepartments = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return departments.filter((department) => {
            return (
                department.departmentCode.toLowerCase().includes(keyword) ||
                department.departmentName.toLowerCase().includes(keyword) ||
                department.description.toLowerCase().includes(keyword) ||
                department.status.toLowerCase().includes(keyword)
            );
        });
    }, [departments, searchTerm]);

    function openAddDialog() {
        setEditingDepartment(null);
        setFormData(emptyForm);
        setIsDialogOpen(true);
    }

    function openEditDialog(department) {
        setEditingDepartment(department);

        setFormData({
            departmentCode: department.departmentCode,
            departmentName: department.departmentName,
            description: department.description,
            students: department.students,
            teachers: department.teachers,
            courses: department.courses,
            status: department.status,
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

    function handleNumberChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: Number(value),
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

        if (editingDepartment) {
            setDepartments((prev) =>
                prev.map((department) =>
                    department.id === editingDepartment.id
                        ? {
                            ...department,
                            ...formData,
                        }
                        : department
                )
            );
        } else {
            const newDepartment = {
                id: Date.now(),
                ...formData,
            };

            setDepartments((prev) => [newDepartment, ...prev]);
        }

        setIsDialogOpen(false);
        setEditingDepartment(null);
        setFormData(emptyForm);
    }

    function handleDelete(departmentId) {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!isConfirmed) return;

        setDepartments((prev) =>
            prev.filter((department) => department.id !== departmentId)
        );
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Administrator
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Department Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Manage academic departments, department codes, descriptions, and
                        status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={openAddDialog}
                        className="bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>

                    <Button variant="outline">Export PDF</Button>
                    <Button variant="outline">Export Excel</Button>
                </div>
            </div>

            <section className="rounded-md border border-[var(--sms-line)] bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--sms-line)] bg-[var(--sms-paper-soft)] px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Department Records
                        </h2>
                        <p className="text-sm text-[var(--sms-muted)]">
                            {filteredDepartments.length} record(s) found
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
                        <Input
                            placeholder="Search department..."
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
                                <TableHead>Code</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Teachers</TableHead>
                                <TableHead>Courses</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell className="font-mono text-xs">
                                            {department.departmentCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {department.departmentName}
                                            <p className="max-w-md text-xs text-[var(--sms-muted)]">
                                                {department.description}
                                            </p>
                                        </TableCell>

                                        <TableCell>{department.students}</TableCell>
                                        <TableCell>{department.teachers}</TableCell>
                                        <TableCell>{department.courses}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    department.status === "Active"
                                                        ? "border-green-200 bg-green-50 text-green-700"
                                                        : "border-red-200 bg-red-50 text-red-700"
                                                }
                                            >
                                                {department.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(department)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(department.id)}
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
                                        No departments found.
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
                            {editingDepartment ? "Edit Department" : "Add Department"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Department Code</Label>
                                <Input
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleInputChange}
                                    placeholder="ITE"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Department Name</Label>
                                <Input
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleInputChange}
                                    placeholder="Information Technology Engineering"
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Department description"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Students</Label>
                                <Input
                                    name="students"
                                    type="number"
                                    min="0"
                                    value={formData.students}
                                    onChange={handleNumberChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Teachers</Label>
                                <Input
                                    name="teachers"
                                    type="number"
                                    min="0"
                                    value={formData.teachers}
                                    onChange={handleNumberChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Courses</Label>
                                <Input
                                    name="courses"
                                    type="number"
                                    min="0"
                                    value={formData.courses}
                                    onChange={handleNumberChange}
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
                                {editingDepartment ? "Save Changes" : "Save Department"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageDepartments;