// import { useMemo, useState } from "react";
// import { Edit, Plus, Search, Trash2 } from "lucide-react";

// import { coursesData } from "@/data/mockData";

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
//     courseCode: "",
//     courseName: "",
//     department: "",
//     teacher: "",
//     credit: 3,
//     semester: "Semester 1",
//     status: "Active",
// };

// function ManageCourses() {
//     const [courses, setCourses] = useState(coursesData);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingCourse, setEditingCourse] = useState(null);
//     const [formData, setFormData] = useState(emptyForm);

//     const filteredCourses = useMemo(() => {
//         const keyword = searchTerm.toLowerCase();

//         return courses.filter((course) => {
//             return (
//                 course.courseCode.toLowerCase().includes(keyword) ||
//                 course.courseName.toLowerCase().includes(keyword) ||
//                 course.department.toLowerCase().includes(keyword) ||
//                 course.teacher.toLowerCase().includes(keyword) ||
//                 course.status.toLowerCase().includes(keyword)
//             );
//         });
//     }, [courses, searchTerm]);

//     function openAddDialog() {
//         setEditingCourse(null);
//         setFormData(emptyForm);
//         setIsDialogOpen(true);
//     }

//     function openEditDialog(course) {
//         setEditingCourse(course);

//         setFormData({
//             courseCode: course.courseCode,
//             courseName: course.courseName,
//             department: course.department,
//             teacher: course.teacher,
//             credit: course.credit,
//             semester: course.semester,
//             status: course.status,
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

//     function handleCreditChange(event) {
//         setFormData((prev) => ({
//             ...prev,
//             credit: Number(event.target.value),
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

//         if (editingCourse) {
//             setCourses((prev) =>
//                 prev.map((course) =>
//                     course.id === editingCourse.id
//                         ? {
//                             ...course,
//                             ...formData,
//                         }
//                         : course
//                 )
//             );
//         } else {
//             const newCourse = {
//                 id: Date.now(),
//                 ...formData,
//             };

//             setCourses((prev) => [newCourse, ...prev]);
//         }

//         setIsDialogOpen(false);
//         setEditingCourse(null);
//         setFormData(emptyForm);
//     }

//     function handleDelete(courseId) {
//         const isConfirmed = window.confirm(
//             "Are you sure you want to delete this course?"
//         );

//         if (!isConfirmed) return;

//         setCourses((prev) => prev.filter((course) => course.id !== courseId));
//     }

//     return (
//         <>
//             <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//                 <div>
//                     <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
//                         Administrator
//                     </p>

//                     <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
//                         Course Management
//                     </h1>

//                     <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
//                         Manage course or subject information, department assignment, teacher
//                         assignment, credits, semester, and course status.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                     <Button
//                         onClick={openAddDialog}
//                         className="sms-btn-primary"
//                     >
//                         <Plus className="mr-2 h-4 w-4" />
//                         Add Course
//                     </Button>

//                     <Button variant="outline">Export PDF</Button>
//                     <Button variant="outline">Export Excel</Button>
//                 </div>
//             </div>

//             <section className="sms-card overflow-hidden">
//                 <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
//                     <div>
//                         <h2 className="font-semibold text-[var(--sms-ink)]">
//                             Course Records
//                         </h2>

//                         <p className="text-sm text-[var(--sms-muted)]">
//                             {filteredCourses.length} record(s) found
//                         </p>
//                     </div>

//                     <div className="relative w-full md:w-80">
//                         <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />
//                         <Input
//                             placeholder="Search course..."
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
//                                 <TableHead>Course Code</TableHead>
//                                 <TableHead>Course Name</TableHead>
//                                 <TableHead>Department</TableHead>
//                                 <TableHead>Teacher</TableHead>
//                                 <TableHead>Credit</TableHead>
//                                 <TableHead>Semester</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>

//                         <TableBody>
//                             {filteredCourses.length > 0 ? (
//                                 filteredCourses.map((course) => (
//                                     <TableRow key={course.id}>
//                                         <TableCell className="font-mono text-xs">
//                                             {course.courseCode}
//                                         </TableCell>

//                                         <TableCell className="font-medium">
//                                             {course.courseName}
//                                         </TableCell>

//                                         <TableCell>{course.department}</TableCell>
//                                         <TableCell>{course.teacher}</TableCell>
//                                         <TableCell>{course.credit}</TableCell>
//                                         <TableCell>{course.semester}</TableCell>

//                                         <TableCell>
//                                             <Badge
//                                                 variant="outline"
//                                                 className={
//                                                     course.status === "Active"
//                                                         ? "sms-badge-active"
//                                                         : "sms-badge-inactive"
//                                                 }
//                                             >
//                                                 {course.status}
//                                             </Badge>
//                                         </TableCell>

//                                         <TableCell>
//                                             <div className="flex justify-end gap-2">
//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => openEditDialog(course)}
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>

//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => handleDelete(course.id)}
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
//                                         colSpan="8"
//                                         className="py-12 text-center text-[var(--sms-muted)]"
//                                     >
//                                         No courses found.
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
//                             {editingCourse ? "Edit Course" : "Add Course"}
//                         </DialogTitle>
//                     </DialogHeader>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div className="grid gap-4 md:grid-cols-2">
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
//                                 <Label>Teacher</Label>
//                                 <Input
//                                     name="teacher"
//                                     value={formData.teacher}
//                                     onChange={handleInputChange}
//                                     placeholder="Rithy Pov"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Credit</Label>
//                                 <Input
//                                     name="credit"
//                                     type="number"
//                                     min="1"
//                                     max="6"
//                                     value={formData.credit}
//                                     onChange={handleCreditChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Semester</Label>
//                                 <Select
//                                     value={formData.semester}
//                                     onValueChange={(value) =>
//                                         handleSelectChange("semester", value)
//                                     }
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select semester" />
//                                     </SelectTrigger>

//                                     <SelectContent>
//                                         <SelectItem value="Semester 1">Semester 1</SelectItem>
//                                         <SelectItem value="Semester 2">Semester 2</SelectItem>
//                                         <SelectItem value="Semester 3">Semester 3</SelectItem>
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
//                                 {editingCourse ? "Save Changes" : "Save Course"}
//                             </Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default ManageCourses;



import { useEffect, useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import { Edit, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import {
    createCourse,
    deleteCourse,
    getCourses,
    updateCourse,
} from "@/services/courseService";

import { getDepartments } from "@/services/departmentService";
import { getTeachers } from "@/services/teacherService";

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
    courseCode: "",
    courseName: "",
    department: "",
    teacher: "Unassigned",
    credit: 3,
    semester: "",
    description: "",
    status: "Active",
};

function getStatusBadgeClass(status) {
    if (status === "Active") return "sms-badge-active";
    return "sms-badge-inactive";
}

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadInitialPageData() {
            try {
                const [courseResponse, departmentResponse, teacherResponse] =
                    await Promise.all([getCourses(), getDepartments(), getTeachers()]);

                if (!ignore) {
                    setCourses(courseResponse.data || []);
                    setDepartments(departmentResponse.data || []);
                    setTeachers(teacherResponse.data || []);
                    setErrorMessage("");
                }
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load course page data.";

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

    async function loadCourses() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await getCourses();

            setCourses(response.data || []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load courses.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredCourses = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return courses.filter((course) => {
            return (
                course.courseCode?.toLowerCase().includes(keyword) ||
                course.courseName?.toLowerCase().includes(keyword) ||
                course.department?.toLowerCase().includes(keyword) ||
                course.teacher?.toLowerCase().includes(keyword) ||
                course.semester?.toLowerCase().includes(keyword) ||
                course.status?.toLowerCase().includes(keyword) ||
                String(course.credit).includes(keyword)
            );
        });
    }, [courses, searchTerm]);

    function openAddDialog() {
        setEditingCourse(null);
        setFormData(emptyForm);
        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function openEditDialog(course) {
        setEditingCourse(course);

        setFormData({
            courseCode: course.courseCode || "",
            courseName: course.courseName || "",
            department: course.departmentCode || course.department || "",
            teacher: course.teacherCode || "Unassigned",
            credit: course.credit || 3,
            semester: course.semester || "",
            description: course.description || "",
            status: course.status || "Active",
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

            if (editingCourse) {
                await updateCourse(editingCourse.id, formData);
            } else {
                await createCourse(formData);
            }

            setIsDialogOpen(false);
            setEditingCourse(null);
            setFormData(emptyForm);

            await loadCourses();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save course.";

            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(course) {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete ${course.courseName}?`
        );

        if (!isConfirmed) return;

        try {
            setErrorMessage("");

            await deleteCourse(course.id);
            await loadCourses();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete course.";

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
                        Course Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Manage courses, assign departments, and optionally assign teachers
                        to each course.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={loadCourses} disabled={isLoading}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>

                    <Button onClick={openAddDialog} className="sms-btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Course
                    </Button>

                    <Button type="button" variant="outline" onClick={() => window.print()}>Export PDF</Button>
                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("courses.csv")}>Export Excel</Button>
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
                            Course Records
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {isLoading
                                ? "Loading courses..."
                                : `${filteredCourses.length} record(s) found`}
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                        <Input
                            placeholder="Search course..."
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
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Credit</TableHead>
                                <TableHead>Semester</TableHead>
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
                                        Loading courses...
                                    </TableCell>
                                </TableRow>
                            ) : filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-mono text-xs font-semibold">
                                            {course.courseCode}
                                        </TableCell>

                                        <TableCell className="font-medium text-[var(--sms-ink)]">
                                            {course.courseName}

                                            {course.description && (
                                                <p className="mt-1 text-xs text-[var(--sms-muted)]">
                                                    {course.description}
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell>{course.department}</TableCell>

                                        <TableCell>
                                            {course.teacher || "Unassigned"}

                                            {course.teacherCode && (
                                                <p className="text-xs text-[var(--sms-muted)]">
                                                    {course.teacherCode}
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell>{course.credit}</TableCell>
                                        <TableCell>{course.semester || "—"}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(course.status)}
                                            >
                                                {course.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(course)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(course)}
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
                                        No courses found.
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
                            {editingCourse ? "Edit Course" : "Add Course"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errorMessage && (
                            <div className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
                            <div className="min-w-0 space-y-2">
                                <Label>Course Code</Label>
                                <Input
                                    name="courseCode"
                                    value={formData.courseCode}
                                    onChange={handleInputChange}
                                    placeholder="WEB-301"
                                    required
                                />
                            </div>

                            <div className="min-w-0 space-y-2">
                                <Label>Course Name</Label>
                                <Input
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    placeholder="Web Development"
                                    required
                                />
                            </div>

                            <div className="min-w-0 space-y-2">
                                <Label>Department</Label>
                                <Select
                                    value={formData.department}
                                    onValueChange={(value) =>
                                        handleSelectChange("department", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {departments.map((department) => (
                                            <SelectItem
                                                key={department.id}
                                                value={department.departmentCode}
                                            >
                                                {department.departmentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="min-w-0 space-y-2">
                                <Label>Teacher</Label>
                                <Select
                                    value={formData.teacher}
                                    onValueChange={(value) => handleSelectChange("teacher", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Unassigned">Unassigned</SelectItem>

                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.teacherCode}>
                                                {teacher.firstName} {teacher.lastName} —{" "}
                                                {teacher.teacherCode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="min-w-0 space-y-2">
                                <Label>Credit</Label>
                                <Input
                                    name="credit"
                                    value={formData.credit}
                                    onChange={handleInputChange}
                                    type="number"
                                    min="1"
                                    placeholder="3"
                                />
                            </div>

                            <div className="min-w-0 space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    placeholder="Semester 1"
                                />
                            </div>

                            <div className="min-w-0 space-y-2">
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

                            <div className="min-w-0 space-y-2">
                                <Label>Description</Label>
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Course description"
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
                                    : editingCourse
                                        ? "Save Changes"
                                        : "Save Course"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageCourses;
