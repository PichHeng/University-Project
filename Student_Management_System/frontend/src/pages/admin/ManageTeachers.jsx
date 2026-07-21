// import { useMemo, useState } from "react";
// import { Edit, Plus, Search, Trash2 } from "lucide-react";

// import { teachersData } from "@/data/mockData";

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
//     teacherCode: "",
//     firstName: "",
//     lastName: "",
//     gender: "Male",
//     department: "",
//     phone: "",
//     email: "",
//     status: "Active",
// };

// function ManageTeachers() {
//     const [teachers, setTeachers] = useState(teachersData);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingTeacher, setEditingTeacher] = useState(null);
//     const [formData, setFormData] = useState(emptyForm);

//     const filteredTeachers = useMemo(() => {
//         const keyword = searchTerm.toLowerCase();

//         return teachers.filter((teacher) => {
//             const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();

//             return (
//                 teacher.teacherCode.toLowerCase().includes(keyword) ||
//                 fullName.includes(keyword) ||
//                 teacher.department.toLowerCase().includes(keyword) ||
//                 teacher.status.toLowerCase().includes(keyword)
//             );
//         });
//     }, [teachers, searchTerm]);

//     function openAddDialog() {
//         setEditingTeacher(null);
//         setFormData(emptyForm);
//         setIsDialogOpen(true);
//     }

//     function openEditDialog(teacher) {
//         setEditingTeacher(teacher);

//         setFormData({
//             teacherCode: teacher.teacherCode,
//             firstName: teacher.firstName,
//             lastName: teacher.lastName,
//             gender: teacher.gender,
//             department: teacher.department,
//             phone: teacher.phone,
//             email: teacher.email,
//             status: teacher.status,
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

//     function handleSelectChange(name, value) {
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     }

//     function handleSubmit(event) {
//         event.preventDefault();

//         if (editingTeacher) {
//             setTeachers((prev) =>
//                 prev.map((teacher) =>
//                     teacher.id === editingTeacher.id
//                         ? {
//                             ...teacher,
//                             ...formData,
//                         }
//                         : teacher
//                 )
//             );
//         } else {
//             const newTeacher = {
//                 id: Date.now(),
//                 ...formData,
//             };

//             setTeachers((prev) => [newTeacher, ...prev]);
//         }

//         setIsDialogOpen(false);
//         setEditingTeacher(null);
//         setFormData(emptyForm);
//     }

//     function handleDelete(teacherId) {
//         const isConfirmed = window.confirm(
//             "Are you sure you want to delete this teacher?"
//         );

//         if (!isConfirmed) return;

//         setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
//     }

//     return (
//         <>
//             <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//                 <div>
//                     <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
//                         Administrator
//                     </p>

//                     <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
//                         Teacher Management
//                     </h1>

//                     <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
//                         Manage teacher records, departments, contact information, and account
//                         status.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                     <Button
//                         onClick={openAddDialog}
//                         className="sms-btn-primary"
//                     >
//                         <Plus className="mr-2 h-4 w-4" />
//                         Add Teacher
//                     </Button>

//                     <Button variant="outline">Export PDF</Button>
//                     <Button variant="outline">Export Excel</Button>
//                 </div>
//             </div>

//             <section className="sms-card overflow-hidden">
//                 <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
//                     <div>
//                         <h2 className="font-semibold text-[var(--sms-ink)]">
//                             Teacher Records
//                         </h2>
//                         <p className="text-sm text-[var(--sms-muted)]">
//                             {filteredTeachers.length} record(s) found
//                         </p>
//                     </div>

//                     <div className="relative w-full md:w-80">
//                         <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
//                         <Input
//                             placeholder="Search teacher..."
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
//                                 <TableHead>Teacher ID</TableHead>
//                                 <TableHead>Name</TableHead>
//                                 <TableHead>Gender</TableHead>
//                                 <TableHead>Department</TableHead>
//                                 <TableHead>Phone</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>

//                         <TableBody>
//                             {filteredTeachers.length > 0 ? (
//                                 filteredTeachers.map((teacher) => (
//                                     <TableRow key={teacher.id}>
//                                         <TableCell className="font-mono text-xs">
//                                             {teacher.teacherCode}
//                                         </TableCell>

//                                         <TableCell className="font-medium">
//                                             {teacher.firstName} {teacher.lastName}
//                                             <p className="text-xs text-[var(--sms-muted)]">
//                                                 {teacher.email}
//                                             </p>
//                                         </TableCell>

//                                         <TableCell>{teacher.gender}</TableCell>
//                                         <TableCell>{teacher.department}</TableCell>

//                                         <TableCell className="font-mono text-xs">
//                                             {teacher.phone}
//                                         </TableCell>

//                                         <TableCell>
//                                             <Badge
//                                                 variant="outline"
//                                                 className={
//                                                     teacher.status === "Active"
//                                                         ? "sms-badge-active"
//                                                         : "sms-badge-inactive"
//                                                 }
//                                             >
//                                                 {teacher.status}
//                                             </Badge>
//                                         </TableCell>

//                                         <TableCell>
//                                             <div className="flex justify-end gap-2">
//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => openEditDialog(teacher)}
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>

//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => handleDelete(teacher.id)}
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
//                                         No teachers found.
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
//                             {editingTeacher ? "Edit Teacher" : "Add Teacher"}
//                         </DialogTitle>
//                     </DialogHeader>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div className="grid gap-4 md:grid-cols-2">
//                             <div className="space-y-2">
//                                 <Label>Teacher ID</Label>
//                                 <Input
//                                     name="teacherCode"
//                                     value={formData.teacherCode}
//                                     onChange={handleInputChange}
//                                     placeholder="TCH-1004"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Department</Label>
//                                 <Input
//                                     name="department"
//                                     value={formData.department}
//                                     onChange={handleInputChange}
//                                     placeholder="Information Technology Engineering"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>First Name</Label>
//                                 <Input
//                                     name="firstName"
//                                     value={formData.firstName}
//                                     onChange={handleInputChange}
//                                     placeholder="First name"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Last Name</Label>
//                                 <Input
//                                     name="lastName"
//                                     value={formData.lastName}
//                                     onChange={handleInputChange}
//                                     placeholder="Last name"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Gender</Label>
//                                 <Select
//                                     value={formData.gender}
//                                     onValueChange={(value) => handleSelectChange("gender", value)}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select gender" />
//                                     </SelectTrigger>

//                                     <SelectContent>
//                                         <SelectItem value="Male">Male</SelectItem>
//                                         <SelectItem value="Female">Female</SelectItem>
//                                         <SelectItem value="Other">Other</SelectItem>
//                                     </SelectContent>
//                                 </Select>
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

//                             <div className="space-y-2">
//                                 <Label>Phone</Label>
//                                 <Input
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleInputChange}
//                                     placeholder="012 000 111"
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Email</Label>
//                                 <Input
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleInputChange}
//                                     placeholder="teacher@email.com"
//                                     type="email"
//                                 />
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
//                                 {editingTeacher ? "Save Changes" : "Save Teacher"}
//                             </Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default ManageTeachers;




import { useEffect, useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Edit, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import {
    createTeacher,
    deleteTeacher,
    getTeachers,
    updateTeacher,
} from "@/services/teacherService";

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
    teacherCode: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    department: "",
    phone: "",
    email: "",
    address: "",
    status: "Active",
};

function getStatusBadgeClass(status) {
    if (status === "Active") return "sms-badge-active";
    return "sms-badge-inactive";
}

function ManageTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadTeachers() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await getTeachers();

            setTeachers(response.data || []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load teachers.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTeachers();
    }, []);

    const filteredTeachers = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return teachers.filter((teacher) => {
            const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();

            return (
                teacher.teacherCode?.toLowerCase().includes(keyword) ||
                fullName.includes(keyword) ||
                teacher.department?.toLowerCase().includes(keyword) ||
                teacher.gender?.toLowerCase().includes(keyword) ||
                teacher.status?.toLowerCase().includes(keyword) ||
                teacher.email?.toLowerCase().includes(keyword) ||
                teacher.phone?.toLowerCase().includes(keyword)
            );
        });
    }, [teachers, searchTerm]);

    function openAddDialog() {
        setEditingTeacher(null);
        setFormData(emptyForm);
        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function openEditDialog(teacher) {
        setEditingTeacher(teacher);

        setFormData({
            teacherCode: teacher.teacherCode || "",
            firstName: teacher.firstName || "",
            lastName: teacher.lastName || "",
            gender: teacher.gender || "Male",
            department: teacher.department || "",
            phone: teacher.phone || "",
            email: teacher.email || "",
            address: teacher.address || "",
            status: teacher.status || "Active",
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

    function handleSelectChange(name, value) {
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

            if (editingTeacher) {
                await updateTeacher(editingTeacher.id, formData);
            } else {
                const response = await createTeacher(formData);

                if (response.data?.username && response.data?.defaultPassword) {
                    alert(
                        `Teacher created successfully.\n\nLogin username: ${response.data.username}\nDefault password: ${response.data.defaultPassword}`
                    );
                }
            }

            setIsDialogOpen(false);
            setEditingTeacher(null);
            setFormData(emptyForm);

            await loadTeachers();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save teacher.";

            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(teacher) {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`
        );

        if (!isConfirmed) return;

        try {
            setErrorMessage("");

            await deleteTeacher(teacher.id);
            await loadTeachers();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete teacher.";

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
                        Teacher Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Manage teacher records and teacher login accounts from the real
                        MySQL database.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={loadTeachers} disabled={isLoading}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>

                    <Button onClick={openAddDialog} className="sms-btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Teacher
                    </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>Export PDF</Button>
                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("teachers.csv")}>Export Excel</Button>
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
                            Teacher Records
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {isLoading
                                ? "Loading teachers..."
                                : `${filteredTeachers.length} record(s) found`}
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                        <Input
                            placeholder="Search teacher..."
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
                                <TableHead>Teacher ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan="8"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        Loading teachers...
                                    </TableCell>
                                </TableRow>
                            ) : filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-mono text-xs">
                                            {teacher.teacherCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {teacher.firstName} {teacher.lastName}

                                            {teacher.username && (
                                                <p className="text-xs text-[var(--sms-muted)]">
                                                    Login: {teacher.username}
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell>{teacher.gender}</TableCell>
                                        <TableCell>{teacher.department}</TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {teacher.phone || "—"}
                                        </TableCell>

                                        <TableCell className="text-sm">
                                            {teacher.email || "No email"}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(teacher.status)}
                                            >
                                                {teacher.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(teacher)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(teacher)}
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
                                        colSpan="8"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No teachers found.
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
                            {editingTeacher ? "Edit Teacher" : "Add Teacher"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errorMessage && (
                            <div className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Teacher ID</Label>
                                <Input
                                    name="teacherCode"
                                    value={formData.teacherCode}
                                    onChange={handleInputChange}
                                    placeholder="TCH-2002"
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
                                    placeholder="teacher@email.com"
                                    type="email"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Address</Label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Teacher address"
                                />
                            </div>
                        </div>

                        {!editingTeacher && (
                            <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4 text-sm text-[var(--sms-muted)]">
                                A teacher login account will be created automatically.
                                <br />
                                Username will be based on Teacher ID.
                                <br />
                                Default password:{" "}
                                <span className="font-semibold text-[var(--sms-ink)]">
                                    Teacher@123
                                </span>
                            </div>
                        )}

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
                                    : editingTeacher
                                        ? "Save Changes"
                                        : "Save Teacher"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageTeachers;
