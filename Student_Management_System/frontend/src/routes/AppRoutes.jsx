import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ModulePlaceholder from "@/components/common/ModulePlaceholder";

import LoginPage from "@/pages/auth/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";

import ProtectedRoute from "./ProtectedRoute";

import ManageStudents from "@/pages/admin/ManageStudents";
import ManageTeachers from "@/pages/admin/ManageTeachers";
import ManageDepartments from "@/pages/admin/ManageDepartments";
import ManageCourses from "@/pages/admin/ManageCourses";
import ManageEnrollments from "@/pages/admin/ManageEnrollments";
import AdminReports from "@/pages/admin/AdminReports";

function ProtectedDashboardPage({ role, children }) {
    return (
        <ProtectedRoute allowedRoles={[role]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginPage />} />

            {/* ================= ADMIN ROUTES ================= */}

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedDashboardPage role="admin">
                        <AdminDashboard />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/admin/students"
                element={
                    <ProtectedDashboardPage role="admin">
                        <ManageStudents />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/admin/teachers"
                element={
                    <ProtectedDashboardPage role="admin">
                        <ManageTeachers />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/admin/departments"
                element={
                    <ProtectedDashboardPage role="admin">
                        <ManageDepartments />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/admin/courses"
                element={
                    <ProtectedDashboardPage role="admin">
                        <ManageCourses />
                    </ProtectedDashboardPage>
                }
            />


            <Route
                path="/admin/enrollments"
                element={
                    <ProtectedDashboardPage role="admin">
                        <ManageEnrollments />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <ProtectedDashboardPage role="admin">
                        <ModulePlaceholder
                            role="Administrator"
                            title="User Account Management"
                            description="Manage login accounts for administrators, teachers, and students."
                            actions={["+ Add User"]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/admin/reports"
                element={
                    <ProtectedDashboardPage role="admin">
                        <AdminReports />
                    </ProtectedDashboardPage>
                }
            />

            {/* ================= TEACHER ROUTES ================= */}

            <Route
                path="/teacher/dashboard"
                element={
                    <ProtectedDashboardPage role="teacher">
                        <TeacherDashboard />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/teacher/courses"
                element={
                    <ProtectedDashboardPage role="teacher">
                        <ModulePlaceholder
                            role="Teacher"
                            title="My Courses"
                            description="View courses, enrolled students, and course details."
                            items={[
                                {
                                    title: "Assigned Courses",
                                    text: "View all courses connected to your teaching schedule.",
                                },
                                {
                                    title: "Students",
                                    text: "View students enrolled in each course.",
                                },
                                {
                                    title: "Course Reports",
                                    text: "Prepare academic summaries for your courses.",
                                },
                            ]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/teacher/attendance"
                element={
                    <ProtectedDashboardPage role="teacher">
                        <ModulePlaceholder
                            role="Teacher"
                            title="Attendance Management"
                            description="Record and update student attendance as Present, Absent, or Late."
                            actions={["Save Attendance", "Export Attendance"]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/teacher/grades"
                element={
                    <ProtectedDashboardPage role="teacher">
                        <ModulePlaceholder
                            role="Teacher"
                            title="Grade Management"
                            description="Enter assignment, midterm, final scores, and automatically calculate final grades."
                            actions={["Save Grades", "Export Grades"]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/teacher/assignments"
                element={
                    <ProtectedDashboardPage role="teacher">
                        <ModulePlaceholder
                            role="Teacher"
                            title="Assignment Management"
                            description="Create and manage assignments for students."
                            actions={["+ Add Assignment"]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/teacher/reports"
                element={
                    <ProtectedDashboardPage role="teacher">
                        <ModulePlaceholder
                            role="Teacher"
                            title="Teacher Reports"
                            description="Generate reports for attendance, grades, and course performance."
                            actions={["Generate PDF", "Generate Excel"]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            {/* ================= STUDENT ROUTES ================= */}

            <Route
                path="/student/dashboard"
                element={
                    <ProtectedDashboardPage role="student">
                        <StudentDashboard />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/student/profile"
                element={
                    <ProtectedDashboardPage role="student">
                        <ModulePlaceholder
                            role="Student"
                            title="My Profile"
                            description="View personal academic profile and contact information."
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/student/courses"
                element={
                    <ProtectedDashboardPage role="student">
                        <ModulePlaceholder
                            role="Student"
                            title="My Courses"
                            description="View enrolled courses, credit information, and teacher details."
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/student/attendance"
                element={
                    <ProtectedDashboardPage role="student">
                        <ModulePlaceholder
                            role="Student"
                            title="My Attendance"
                            description="View attendance history and attendance percentage for each course."
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/student/grades"
                element={
                    <ProtectedDashboardPage role="student">
                        <ModulePlaceholder
                            role="Student"
                            title="My Grades"
                            description="View assignment, midterm, final, total score, and grade letter."
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route
                path="/student/reports"
                element={
                    <ProtectedDashboardPage role="student">
                        <ModulePlaceholder
                            role="Student"
                            title="My Academic Reports"
                            description="View and download academic reports."
                            actions={["Download PDF"]}
                        />
                    </ProtectedDashboardPage>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppRoutes;