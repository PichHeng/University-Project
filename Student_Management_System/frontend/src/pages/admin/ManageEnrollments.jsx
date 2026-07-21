// import { useMemo, useState } from "react";
// import { Edit, Plus, Search, Trash2 } from "lucide-react";

// import { enrollmentsData } from "@/data/mockData";

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
//     enrollmentCode: "",
//     studentName: "",
//     studentCode: "",
//     courseName: "",
//     courseCode: "",
//     department: "",
//     enrollmentDate: "",
//     status: "Active",
// };

// function ManageEnrollments() {
//     const [enrollments, setEnrollments] = useState(enrollmentsData);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingEnrollment, setEditingEnrollment] = useState(null);
//     const [formData, setFormData] = useState(emptyForm);

//     const filteredEnrollments = useMemo(() => {
//         const keyword = searchTerm.toLowerCase();

//         return enrollments.filter((enrollment) => {
//             return (
//                 enrollment.enrollmentCode.toLowerCase().includes(keyword) ||
//                 enrollment.studentName.toLowerCase().includes(keyword) ||
//                 enrollment.studentCode.toLowerCase().includes(keyword) ||
//                 enrollment.courseName.toLowerCase().includes(keyword) ||
//                 enrollment.courseCode.toLowerCase().includes(keyword) ||
//                 enrollment.department.toLowerCase().includes(keyword) ||
//                 enrollment.status.toLowerCase().includes(keyword)
//             );
//         });
//     }, [enrollments, searchTerm]);

//     function openAddDialog() {
//         setEditingEnrollment(null);
//         setFormData(emptyForm);
//         setIsDialogOpen(true);
//     }

//     function openEditDialog(enrollment) {
//         setEditingEnrollment(enrollment);

//         setFormData({
//             enrollmentCode: enrollment.enrollmentCode,
//             studentName: enrollment.studentName,
//             studentCode: enrollment.studentCode,
//             courseName: enrollment.courseName,
//             courseCode: enrollment.courseCode,
//             department: enrollment.department,
//             enrollmentDate: enrollment.enrollmentDate,
//             status: enrollment.status,
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

//         if (editingEnrollment) {
//             setEnrollments((prev) =>
//                 prev.map((enrollment) =>
//                     enrollment.id === editingEnrollment.id
//                         ? {
//                             ...enrollment,
//                             ...formData,
//                         }
//                         : enrollment
//                 )
//             );
//         } else {
//             const newEnrollment = {
//                 id: Date.now(),
//                 ...formData,
//             };

//             setEnrollments((prev) => [newEnrollment, ...prev]);
//         }

//         setIsDialogOpen(false);
//         setEditingEnrollment(null);
//         setFormData(emptyForm);
//     }

//     function handleDelete(enrollmentId) {
//         const isConfirmed = window.confirm(
//             "Are you sure you want to delete this enrollment?"
//         );

//         if (!isConfirmed) return;

//         setEnrollments((prev) =>
//             prev.filter((enrollment) => enrollment.id !== enrollmentId)
//         );
//     }

//     function getStatusBadgeClass(status) {
//         if (status === "Active") {
//             return "sms-badge-active";
//         }

//         if (status === "Completed") {
//             return "sms-badge-info";
//         }

//         return "sms-badge-inactive";
//     }

//     return (
//         <>
//             <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//                 <div>
//                     <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
//                         Administrator
//                     </p>

//                     <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
//                         Enrollment Management
//                     </h1>

//                     <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
//                         Manage student course enrollments, enrollment dates, departments,
//                         and enrollment status.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                     <Button
//                         onClick={openAddDialog}
//                         className="sms-btn-primary"
//                     >
//                         <Plus className="mr-2 h-4 w-4" />
//                         Add Enrollment
//                     </Button>

//                     <Button variant="outline">Export PDF</Button>
//                     <Button variant="outline">Export Excel</Button>
//                 </div>
//             </div>

//             <section className="sms-card overflow-hidden">
//                 <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
//                     <div>
//                         <h2 className="font-semibold text-[var(--sms-ink)]">
//                             Enrollment Records
//                         </h2>

//                         <p className="text-sm text-[var(--sms-muted)]">
//                             {filteredEnrollments.length} record(s) found
//                         </p>
//                     </div>

//                     <div className="relative w-full md:w-80">
//                         <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

//                         <Input
//                             placeholder="Search enrollment..."
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
//                                 <TableHead>Enrollment ID</TableHead>
//                                 <TableHead>Student</TableHead>
//                                 <TableHead>Course</TableHead>
//                                 <TableHead>Department</TableHead>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>

//                         <TableBody>
//                             {filteredEnrollments.length > 0 ? (
//                                 filteredEnrollments.map((enrollment) => (
//                                     <TableRow key={enrollment.id}>
//                                         <TableCell className="font-mono text-xs">
//                                             {enrollment.enrollmentCode}
//                                         </TableCell>

//                                         <TableCell className="font-medium">
//                                             {enrollment.studentName}
//                                             <p className="text-xs text-[var(--sms-muted)]">
//                                                 {enrollment.studentCode}
//                                             </p>
//                                         </TableCell>

//                                         <TableCell className="font-medium">
//                                             {enrollment.courseName}
//                                             <p className="text-xs text-[var(--sms-muted)]">
//                                                 {enrollment.courseCode}
//                                             </p>
//                                         </TableCell>

//                                         <TableCell>{enrollment.department}</TableCell>

//                                         <TableCell className="font-mono text-xs">
//                                             {enrollment.enrollmentDate}
//                                         </TableCell>

//                                         <TableCell>
//                                             <Badge
//                                                 variant="outline"
//                                                 className={getStatusBadgeClass(enrollment.status)}
//                                             >
//                                                 {enrollment.status}
//                                             </Badge>
//                                         </TableCell>

//                                         <TableCell>
//                                             <div className="flex justify-end gap-2">
//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => openEditDialog(enrollment)}
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>

//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => handleDelete(enrollment.id)}
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
//                                         No enrollments found.
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
//                             {editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}
//                         </DialogTitle>
//                     </DialogHeader>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div className="grid gap-4 md:grid-cols-2">
//                             <div className="space-y-2">
//                                 <Label>Enrollment ID</Label>
//                                 <Input
//                                     name="enrollmentCode"
//                                     value={formData.enrollmentCode}
//                                     onChange={handleInputChange}
//                                     placeholder="ENR-1004"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Enrollment Date</Label>
//                                 <Input
//                                     name="enrollmentDate"
//                                     type="date"
//                                     value={formData.enrollmentDate}
//                                     onChange={handleInputChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Student Name</Label>
//                                 <Input
//                                     name="studentName"
//                                     value={formData.studentName}
//                                     onChange={handleInputChange}
//                                     placeholder="Chea Pich Heng"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Student ID</Label>
//                                 <Input
//                                     name="studentCode"
//                                     value={formData.studentCode}
//                                     onChange={handleInputChange}
//                                     placeholder="STU-1001"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Course Name</Label>
//                                 <Input
//                                     name="courseName"
//                                     value={formData.courseName}
//                                     onChange={handleInputChange}
//                                     placeholder="Web Application Development"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Course Code</Label>
//                                 <Input
//                                     name="courseCode"
//                                     value={formData.courseCode}
//                                     onChange={handleInputChange}
//                                     placeholder="ITE-301"
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
//                                         <SelectItem value="Completed">Completed</SelectItem>
//                                         <SelectItem value="Dropped">Dropped</SelectItem>
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
//                                 {editingEnrollment ? "Save Changes" : "Save Enrollment"}
//                             </Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default ManageEnrollments;



import { useEffect, useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Edit, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import {
    createEnrollment,
    deleteEnrollment,
    getEnrollments,
    updateEnrollment,
} from "@/services/enrollmentService";

import { getStudents } from "@/services/studentService";
import { getCourses } from "@/services/courseService";

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

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
    studentCode: "",
    courseCode: "",
    enrollmentDate: getTodayDate(),
    status: "Active",
};

function getStatusBadgeClass(status) {
    if (status === "Active") return "sms-badge-active";
    if (status === "Completed") return "sms-badge-info";
    if (status === "Dropped") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function ManageEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadInitialPageData() {
            try {
                const [enrollmentResponse, studentResponse, courseResponse] =
                    await Promise.all([getEnrollments(), getStudents(), getCourses()]);

                if (!ignore) {
                    setEnrollments(enrollmentResponse.data || []);
                    setStudents(studentResponse.data || []);
                    setCourses(courseResponse.data || []);
                    setErrorMessage("");
                }
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load enrollment page data.";

                if (!ignore) {
                    setErrorMessage(message);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadInitialPageData();

        return () => {
            ignore = true;
        };
    }, []);

    async function loadEnrollments() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await getEnrollments();

            setEnrollments(response.data || []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load enrollments.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredEnrollments = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return enrollments.filter((enrollment) => {
            return (
                enrollment.studentCode?.toLowerCase().includes(keyword) ||
                enrollment.studentName?.toLowerCase().includes(keyword) ||
                enrollment.courseCode?.toLowerCase().includes(keyword) ||
                enrollment.courseName?.toLowerCase().includes(keyword) ||
                enrollment.department?.toLowerCase().includes(keyword) ||
                enrollment.status?.toLowerCase().includes(keyword) ||
                enrollment.enrollmentDate?.toLowerCase().includes(keyword)
            );
        });
    }, [enrollments, searchTerm]);

    function openAddDialog() {
        setEditingEnrollment(null);
        setFormData({
            ...emptyForm,
            enrollmentDate: getTodayDate(),
        });
        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function openEditDialog(enrollment) {
        setEditingEnrollment(enrollment);

        setFormData({
            studentCode: enrollment.studentCode || "",
            courseCode: enrollment.courseCode || "",
            enrollmentDate: enrollment.enrollmentDate || getTodayDate(),
            status: enrollment.status || "Active",
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

            if (!formData.studentCode || !formData.courseCode) {
                setErrorMessage("Please select both student and course.");
                return;
            }

            if (editingEnrollment) {
                await updateEnrollment(editingEnrollment.id, formData);
            } else {
                await createEnrollment(formData);
            }

            setIsDialogOpen(false);
            setEditingEnrollment(null);
            setFormData(emptyForm);

            await loadEnrollments();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save enrollment.";

            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(enrollment) {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete this enrollment?\n\nStudent: ${enrollment.studentName}\nCourse: ${enrollment.courseName}`
        );

        if (!isConfirmed) return;

        try {
            setErrorMessage("");

            await deleteEnrollment(enrollment.id);
            await loadEnrollments();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete enrollment.";

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
                        Enrollment Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Enroll students into courses and manage enrollment status from the
                        real MySQL database.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={loadEnrollments}
                        disabled={isLoading}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>

                    <Button onClick={openAddDialog} className="sms-btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Enrollment
                    </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>Export PDF</Button>
                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("enrollments.csv")}>Export Excel</Button>
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
                            Enrollment Records
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {isLoading
                                ? "Loading enrollments..."
                                : `${filteredEnrollments.length} record(s) found`}
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
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Enrollment Date</TableHead>
                                <TableHead>Status</TableHead>
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
                                        Loading enrollments...
                                    </TableCell>
                                </TableRow>
                            ) : filteredEnrollments.length > 0 ? (
                                filteredEnrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell className="font-medium text-[var(--sms-ink)]">
                                            {enrollment.studentName}

                                            <p className="text-xs font-mono text-[var(--sms-muted)]">
                                                {enrollment.studentCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            <span className="font-medium">
                                                {enrollment.courseName}
                                            </span>

                                            <p className="text-xs font-mono text-[var(--sms-muted)]">
                                                {enrollment.courseCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>{enrollment.department}</TableCell>

                                        <TableCell>{enrollment.enrollmentDate || "—"}</TableCell>

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
                                                    onClick={() => handleDelete(enrollment)}
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
                                        No enrollments found.
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
                            {editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}
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
                                <Label>Student</Label>

                                <Select
                                    value={formData.studentCode || undefined}
                                    onValueChange={(value) =>
                                        handleSelectChange("studentCode", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem
                                                key={student.id}
                                                value={student.studentCode}
                                            >
                                                {student.firstName} {student.lastName} —{" "}
                                                {student.studentCode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Course</Label>

                                <Select
                                    value={formData.courseCode || undefined}
                                    onValueChange={(value) =>
                                        handleSelectChange("courseCode", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.courseCode}>
                                                {course.courseName} — {course.courseCode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Enrollment Date</Label>
                                <Input
                                    name="enrollmentDate"
                                    value={formData.enrollmentDate}
                                    onChange={handleInputChange}
                                    type="date"
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

                        <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4 text-sm text-[var(--sms-muted)]">
                            A student cannot be enrolled in the same course twice.
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
                                    : editingEnrollment
                                        ? "Save Changes"
                                        : "Save Enrollment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageEnrollments;
