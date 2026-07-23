// import { Navigate, Route, Routes } from "react-router-dom";

// import DashboardLayout from "@/components/layout/DashboardLayout";
// import ModulePlaceholder from "@/components/common/ModulePlaceholder";

// import LoginPage from "@/pages/auth/LoginPage";
// import AdminDashboard from "@/pages/admin/AdminDashboard";
// import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
// import StudentDashboard from "@/pages/student/StudentDashboard";

// import ProtectedRoute from "./ProtectedRoute";

// import ManageStudents from "@/pages/admin/ManageStudents";
// import ManageTeachers from "@/pages/admin/ManageTeachers";
// import ManageDepartments from "@/pages/admin/ManageDepartments";
// import ManageCourses from "@/pages/admin/ManageCourses";
// import ManageEnrollments from "@/pages/admin/ManageEnrollments";
// import AdminReports from "@/pages/admin/AdminReports";
// import TeacherAttendance from "@/pages/teacher/TeacherAttendance";
// import TeacherGrades from "@/pages/teacher/TeacherGrades";
// import TeacherAssignments from "@/pages/teacher/TeacherAssignments";
// import TeacherCourses from "@/pages/teacher/TeacherCourses";
// import TeacherReports from "@/pages/teacher/TeacherReports";

// function ProtectedDashboardPage({ role, children }) {
//     return (
//         <ProtectedRoute allowedRoles={[role]}>
//             <DashboardLayout>{children}</DashboardLayout>
//         </ProtectedRoute>
//     );
// }

// function AppRoutes() {
//     return (
//         <Routes>
//             <Route path="/" element={<Navigate to="/login" replace />} />

//             <Route path="/login" element={<LoginPage />} />

//             {/* ================= ADMIN ROUTES ================= */}

//             <Route
//                 path="/admin/dashboard"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <AdminDashboard />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/admin/students"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <ManageStudents />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/admin/teachers"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <ManageTeachers />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/admin/departments"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <ManageDepartments />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/admin/courses"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <ManageCourses />
//                     </ProtectedDashboardPage>
//                 }
//             />


//             <Route
//                 path="/admin/enrollments"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <ManageEnrollments />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/admin/users"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <ModulePlaceholder
//                             role="Administrator"
//                             title="User Account Management"
//                             description="Manage login accounts for administrators, teachers, and students."
//                             actions={["+ Add User"]}
//                         />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/admin/reports"
//                 element={
//                     <ProtectedDashboardPage role="admin">
//                         <AdminReports />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             {/* ================= TEACHER ROUTES ================= */}

//             <Route
//                 path="/teacher/dashboard"
//                 element={
//                     <ProtectedDashboardPage role="teacher">
//                         <TeacherDashboard />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/teacher/courses"
//                 element={
//                     <ProtectedDashboardPage role="teacher">
//                         <TeacherCourses />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/teacher/attendance"
//                 element={
//                     <ProtectedDashboardPage role="teacher">
//                         <TeacherAttendance />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/teacher/grades"
//                 element={
//                     <ProtectedDashboardPage role="teacher">
//                         <TeacherGrades />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/teacher/assignments"
//                 element={
//                     <ProtectedDashboardPage role="teacher">
//                         <TeacherAssignments />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/teacher/reports"
//                 element={
//                     <ProtectedDashboardPage role="teacher">
//                         <TeacherReports />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             {/* ================= STUDENT ROUTES ================= */}

//             <Route
//                 path="/student/dashboard"
//                 element={
//                     <ProtectedDashboardPage role="student">
//                         <StudentDashboard />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/student/profile"
//                 element={
//                     <ProtectedDashboardPage role="student">
//                         <ModulePlaceholder
//                             role="Student"
//                             title="My Profile"
//                             description="View personal academic profile and contact information."
//                         />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/student/courses"
//                 element={
//                     <ProtectedDashboardPage role="student">
//                         <ModulePlaceholder
//                             role="Student"
//                             title="My Courses"
//                             description="View enrolled courses, credit information, and teacher details."
//                         />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/student/attendance"
//                 element={
//                     <ProtectedDashboardPage role="student">
//                         <ModulePlaceholder
//                             role="Student"
//                             title="My Attendance"
//                             description="View attendance history and attendance percentage for each course."
//                         />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/student/grades"
//                 element={
//                     <ProtectedDashboardPage role="student">
//                         <ModulePlaceholder
//                             role="Student"
//                             title="My Grades"
//                             description="View assignment, midterm, final, total score, and grade letter."
//                         />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route
//                 path="/student/reports"
//                 element={
//                     <ProtectedDashboardPage role="student">
//                         <ModulePlaceholder
//                             role="Student"
//                             title="My Academic Reports"
//                             description="View and download academic reports."
//                             actions={["Download PDF"]}
//                         />
//                     </ProtectedDashboardPage>
//                 }
//             />

//             <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//     );
// }

// export default AppRoutes;



import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
// import ModulePlaceholder from "@/components/common/ModulePlaceholder";
import ProtectedRoute from "@/routes/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("@/pages/admin/ManageStudents"));
const ManageTeachers = lazy(() => import("@/pages/admin/ManageTeachers"));
const ManageDepartments = lazy(() => import("@/pages/admin/ManageDepartments"));
const ManageCourses = lazy(() => import("@/pages/admin/ManageCourses"));
const ManageEnrollments = lazy(() => import("@/pages/admin/ManageEnrollments"));
const ManageUsers = lazy(() => import("@/pages/admin/ManageUsers"));
const ManageAdmins = lazy(() => import("@/pages/admin/ManageAdmins"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));

const TeacherInfo = lazy(() => import("@/pages/teacher/TeacherInfo"));
const TeacherDashboard = lazy(() => import("@/pages/teacher/TeacherDashboard"));
const TeacherCourses = lazy(() => import("@/pages/teacher/TeacherCourses"));
const TeacherAttendance = lazy(() =>
    import("@/pages/teacher/TeacherAttendance")
);
const TeacherGrades = lazy(() => import("@/pages/teacher/TeacherGrades"));
const TeacherAssignments = lazy(() =>
    import("@/pages/teacher/TeacherAssignments")
);
const TeacherReports = lazy(() => import("@/pages/teacher/TeacherReports"));

const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentProfile = lazy(() => import("@/pages/student/StudentProfile"));
const StudentCourses = lazy(() => import("@/pages/student/StudentCourses"));
const StudentAttendance = lazy(() =>
    import("@/pages/student/StudentAttendance")
);
const StudentGrades = lazy(() => import("@/pages/student/StudentGrades"));
const StudentReports = lazy(() => import("@/pages/student/StudentReports"));
const StudentAssignments = lazy(() => import("@/pages/student/StudentAssignments"));
const StudentEnrollCourses = lazy(() => import("@/pages/student/StudentEnrollCourses"));

function ProtectedDashboardPage({ role, children }) {
    return (
        <ProtectedRoute allowedRoles={[role]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <Suspense
            fallback={
                <div role="status" className="flex min-h-screen items-center justify-center bg-[var(--sms-page)] text-sm font-medium text-[var(--sms-ink)]">
                    Loading dashboard…
                </div>
            }
        >
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
                            <ManageUsers />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/admin/admins"
                    element={
                        <ProtectedDashboardPage role="admin">
                            <ManageAdmins />
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
                            <TeacherCourses />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/teacher/attendance"
                    element={
                        <ProtectedDashboardPage role="teacher">
                            <TeacherAttendance />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/teacher/grades"
                    element={
                        <ProtectedDashboardPage role="teacher">
                            <TeacherGrades />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/teacher/assignments"
                    element={
                        <ProtectedDashboardPage role="teacher">
                            <TeacherAssignments />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/teacher/reports"
                    element={
                        <ProtectedDashboardPage role="teacher">
                            <TeacherReports />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/teacher/profile"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <DashboardLayout>
                                <TeacherInfo />
                            </DashboardLayout>
                        </ProtectedRoute>
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
                            <StudentProfile />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/student/courses"
                    element={
                        <ProtectedDashboardPage role="student">
                            <StudentCourses />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/student/attendance"
                    element={
                        <ProtectedDashboardPage role="student">
                            <StudentAttendance />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/student/grades"
                    element={
                        <ProtectedDashboardPage role="student">
                            <StudentGrades />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/student/reports"
                    element={
                        <ProtectedDashboardPage role="student">
                            <StudentReports />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/student/assignments"
                    element={
                        <ProtectedDashboardPage role="student">
                            <StudentAssignments />
                        </ProtectedDashboardPage>
                    }
                />

                <Route
                    path="/student/enroll-courses"
                    element={
                        <ProtectedDashboardPage role="student">
                            <StudentEnrollCourses />
                        </ProtectedDashboardPage>
                    }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;
