// import { useMemo, useState } from "react";
// import { Edit, Plus, Search, Trash2 } from "lucide-react";

// import { departmentsData } from "@/data/mockData";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog";

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";

// const emptyForm = {
//     departmentCode: "",
//     departmentName: "",
//     description: "",
//     students: 0,
//     teachers: 0,
//     courses: 0,
//     status: "Active",
// };

// function ManageDepartments() {
//     const [departments, setDepartments] = useState(departmentsData);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingDepartment, setEditingDepartment] = useState(null);
//     const [formData, setFormData] = useState(emptyForm);

//     const filteredDepartments = useMemo(() => {
//         const keyword = searchTerm.toLowerCase();

//         return departments.filter((department) => {
//             return (
//                 department.departmentCode.toLowerCase().includes(keyword) ||
//                 department.departmentName.toLowerCase().includes(keyword) ||
//                 department.description.toLowerCase().includes(keyword) ||
//                 department.status.toLowerCase().includes(keyword)
//             );
//         });
//     }, [departments, searchTerm]);

//     function openAddDialog() {
//         setEditingDepartment(null);
//         setFormData(emptyForm);
//         setIsDialogOpen(true);
//     }

//     function openEditDialog(department) {
//         setEditingDepartment(department);

//         setFormData({
//             departmentCode: department.departmentCode,
//             departmentName: department.departmentName,
//             description: department.description,
//             students: department.students,
//             teachers: department.teachers,
//             courses: department.courses,
//             status: department.status,
//         });

//         setIsDialogOpen(true);
//     }

//     function handleInputChange(event) {
//         const { name, value } = event.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     }

//     function handleNumberChange(event) {
//         const { name, value } = event.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: Number(value),
//         }));
//     }

//     function handleSelectChange(name, value) {
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     }

//     function handleSubmit(event) {
//         event.preventDefault();

//         if (editingDepartment) {
//             setDepartments((prev) =>
//                 prev.map((department) =>
//                     department.id === editingDepartment.id
//                         ? {
//                             ...department,
//                             ...formData,
//                         }
//                         : department
//                 )
//             );
//         } else {
//             const newDepartment = {
//                 id: Date.now(),
//                 ...formData,
//             };

//             setDepartments((prev) => [newDepartment, ...prev]);
//         }

//         setIsDialogOpen(false);
//         setEditingDepartment(null);
//         setFormData(emptyForm);
//     }

//     function handleDelete(departmentId) {
//         const isConfirmed = window.confirm(
//             "Are you sure you want to delete this department?"
//         );

//         if (!isConfirmed) return;

//         setDepartments((prev) =>
//             prev.filter((department) => department.id !== departmentId)
//         );
//     }

//     return (
//         <>
//             <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//                 <div>
//                     <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
//                         Administrator
//                     </p>

//                     <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
//                         Department Management
//                     </h1>

//                     <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
//                         Manage academic departments, department codes, descriptions, and
//                         status.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                     <Button
//                         onClick={openAddDialog}
//                         className="sms-btn-primary"
//                     >
//                         <Plus className="mr-2 h-4 w-4" />
//                         Add Department
//                     </Button>

//                     <Button variant="outline">Export PDF</Button>
//                     <Button variant="outline">Export Excel</Button>
//                 </div>
//             </div>

//             <section className="sms-card overflow-hidden">
//                 <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
//                     <div>
//                         <h2 className="font-semibold text-[var(--sms-ink)]">
//                             Department Records
//                         </h2>
//                         <p className="text-sm text-[var(--sms-muted)]">
//                             {filteredDepartments.length} record(s) found
//                         </p>
//                     </div>

//                     <div className="relative w-full md:w-80">
//                         <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
//                         <Input
//                             placeholder="Search department..."
//                             value={searchTerm}
//                             onChange={(event) => setSearchTerm(event.target.value)}
//                             className="pl-9"
//                         />
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Code</TableHead>
//                                 <TableHead>Department</TableHead>
//                                 <TableHead>Students</TableHead>
//                                 <TableHead>Teachers</TableHead>
//                                 <TableHead>Courses</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>

//                         <TableBody>
//                             {filteredDepartments.length > 0 ? (
//                                 filteredDepartments.map((department) => (
//                                     <TableRow key={department.id}>
//                                         <TableCell className="font-mono text-xs">
//                                             {department.departmentCode}
//                                         </TableCell>

//                                         <TableCell className="font-medium">
//                                             {department.departmentName}
//                                             <p className="max-w-md text-xs text-[var(--sms-muted)]">
//                                                 {department.description}
//                                             </p>
//                                         </TableCell>

//                                         <TableCell>{department.students}</TableCell>
//                                         <TableCell>{department.teachers}</TableCell>
//                                         <TableCell>{department.courses}</TableCell>

//                                         <TableCell>
//                                             <Badge
//                                                 variant="outline"
//                                                 className={
//                                                     department.status === "Active"
//                                                         ? "sms-badge-active"
//                                                         : "sms-badge-inactive"
//                                                 }
//                                             >
//                                                 {department.status}
//                                             </Badge>
//                                         </TableCell>

//                                         <TableCell>
//                                             <div className="flex justify-end gap-2">
//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => openEditDialog(department)}
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>

//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => handleDelete(department.id)}
//                                                 >
//                                                     <Trash2 className="h-4 w-4 text-[var(--sms-danger)]" />
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell
//                                         colSpan="7"
//                                         className="py-12 text-center text-[var(--sms-muted)]"
//                                     >
//                                         No departments found.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </section>

//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                         <DialogTitle>
//                             {editingDepartment ? "Edit Department" : "Add Department"}
//                         </DialogTitle>
//                     </DialogHeader>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div className="grid gap-4 md:grid-cols-2">
//                             <div className="space-y-2">
//                                 <Label>Department Code</Label>
//                                 <Input
//                                     name="departmentCode"
//                                     value={formData.departmentCode}
//                                     onChange={handleInputChange}
//                                     placeholder="ITE"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Department Name</Label>
//                                 <Input
//                                     name="departmentName"
//                                     value={formData.departmentName}
//                                     onChange={handleInputChange}
//                                     placeholder="Information Technology Engineering"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2 md:col-span-2">
//                                 <Label>Description</Label>
//                                 <Input
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={handleInputChange}
//                                     placeholder="Department description"
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Students</Label>
//                                 <Input
//                                     name="students"
//                                     type="number"
//                                     min="0"
//                                     value={formData.students}
//                                     onChange={handleNumberChange}
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Teachers</Label>
//                                 <Input
//                                     name="teachers"
//                                     type="number"
//                                     min="0"
//                                     value={formData.teachers}
//                                     onChange={handleNumberChange}
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Courses</Label>
//                                 <Input
//                                     name="courses"
//                                     type="number"
//                                     min="0"
//                                     value={formData.courses}
//                                     onChange={handleNumberChange}
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Status</Label>
//                                 <Select
//                                     value={formData.status}
//                                     onValueChange={(value) => handleSelectChange("status", value)}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select status" />
//                                     </SelectTrigger>

//                                     <SelectContent>
//                                         <SelectItem value="Active">Active</SelectItem>
//                                         <SelectItem value="Inactive">Inactive</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         <DialogFooter>
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => setIsDialogOpen(false)}
//                             >
//                                 Cancel
//                             </Button>

//                             <Button
//                                 type="submit"
//                                 className="sms-btn-primary"
//                             >
//                                 {editingDepartment ? "Save Changes" : "Save Department"}
//                             </Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default ManageDepartments;




import { useEffect, useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Edit, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import {
    createDepartment,
    deleteDepartment,
    getDepartments,
    updateDepartment,
} from "@/services/departmentService";

import { Button } from "@/components/ui/button";
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
};

function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadDepartments() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await getDepartments();

            setDepartments(response.data || []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load departments.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDepartments();
    }, []);

    const filteredDepartments = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return departments.filter((department) => {
            return (
                department.departmentCode?.toLowerCase().includes(keyword) ||
                department.departmentName?.toLowerCase().includes(keyword) ||
                department.description?.toLowerCase().includes(keyword)
            );
        });
    }, [departments, searchTerm]);

    function openAddDialog() {
        setEditingDepartment(null);
        setFormData(emptyForm);
        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function openEditDialog(department) {
        setEditingDepartment(department);

        setFormData({
            departmentCode: department.departmentCode || "",
            departmentName: department.departmentName || "",
            description: department.description || "",
        });

        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setIsSaving(true);
            setErrorMessage("");

            if (editingDepartment) {
                await updateDepartment(editingDepartment.id, formData);
            } else {
                await createDepartment(formData);
            }

            setIsDialogOpen(false);
            setEditingDepartment(null);
            setFormData(emptyForm);

            await loadDepartments();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save department.";

            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(department) {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete ${department.departmentName}?`
        );

        if (!isConfirmed) return;

        try {
            setErrorMessage("");

            await deleteDepartment(department.id);
            await loadDepartments();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete department.";

            setErrorMessage(message);
        }
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
                        Manage academic departments and view how many students and teachers
                        belong to each department.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={loadDepartments}
                        disabled={isLoading}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>

                    <Button onClick={openAddDialog} className="sms-btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>Export PDF</Button>
                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("departments.csv")}>Export Excel</Button>
                </div>
            </div>

            {errorMessage && (
                <div className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">
                    {errorMessage}
                </div>
            )}

            <section className="sms-card rounded-md">
                <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Department Records
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {isLoading
                                ? "Loading departments..."
                                : `${filteredDepartments.length} record(s) found`}
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
                                <TableHead>Department Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Teachers</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan="6"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        Loading departments...
                                    </TableCell>
                                </TableRow>
                            ) : filteredDepartments.length > 0 ? (
                                filteredDepartments.map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell className="font-mono text-xs font-semibold">
                                            {department.departmentCode}
                                        </TableCell>

                                        <TableCell className="font-medium text-[var(--sms-ink)]">
                                            {department.departmentName}
                                        </TableCell>

                                        <TableCell className="max-w-md text-sm text-[var(--sms-muted)]">
                                            {department.description || "No description"}
                                        </TableCell>

                                        <TableCell>{department.totalStudents || 0}</TableCell>

                                        <TableCell>{department.totalTeachers || 0}</TableCell>

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
                                                    onClick={() => handleDelete(department)}
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
                                        colSpan="6"
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
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDepartment ? "Edit Department" : "Add Department"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errorMessage && (
                            <div className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid gap-4">
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

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Department description"
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
                                disabled={isSaving}
                                className="sms-btn-primary"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : editingDepartment
                                        ? "Save Changes"
                                        : "Save Department"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageDepartments;
