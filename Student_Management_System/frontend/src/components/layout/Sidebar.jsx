import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Building2,
    BookOpen,
    ClipboardList,
    FileText,
    UserCog,
    CalendarCheck,
    NotebookPen,
    User,
} from "lucide-react";

const menuItems = {
    admin: [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Students",
            path: "/admin/students",
            icon: Users,
        },
        {
            label: "Teachers",
            path: "/admin/teachers",
            icon: GraduationCap,
        },
        {
            label: "Departments",
            path: "/admin/departments",
            icon: Building2,
        },
        {
            label: "Courses",
            path: "/admin/courses",
            icon: BookOpen,
        },
        {
            label: "Enrollments",
            path: "/admin/enrollments",
            icon: ClipboardList,
        },
        {
            label: "Users",
            path: "/admin/users",
            icon: UserCog,
        },
        {
            label: "Reports",
            path: "/admin/reports",
            icon: FileText,
        },
    ],

    teacher: [
        {
            label: "Dashboard",
            path: "/teacher/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Courses",
            path: "/teacher/courses",
            icon: BookOpen,
        },
        {
            label: "Attendance",
            path: "/teacher/attendance",
            icon: CalendarCheck,
        },
        {
            label: "Grades",
            path: "/teacher/grades",
            icon: NotebookPen,
        },
        {
            label: "Assignments",
            path: "/teacher/assignments",
            icon: ClipboardList,
        },
        {
            label: "Reports",
            path: "/teacher/reports",
            icon: FileText,
        },
    ],

    student: [
        {
            label: "Dashboard",
            path: "/student/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Profile",
            path: "/student/profile",
            icon: User,
        },
        {
            label: "My Courses",
            path: "/student/courses",
            icon: BookOpen,
        },
        {
            label: "My Attendance",
            path: "/student/attendance",
            icon: CalendarCheck,
        },
        {
            label: "My Grades",
            path: "/student/grades",
            icon: NotebookPen,
        },
        {
            label: "Reports",
            path: "/student/reports",
            icon: FileText,
        },
    ],
};

function Sidebar({ role }) {
    const items = menuItems[role] || [];

    return (
        <aside className="hidden w-64 shrink-0 bg-[var(--sms-ink)] py-5 text-slate-200 md:block">
            <nav className="space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                [
                                    "mx-3 flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition",
                                    isActive
                                        ? "bg-[var(--sms-paper)] text-[var(--sms-ink)] shadow-sm"
                                        : "text-slate-300 hover:bg-[var(--sms-ink-soft)] hover:text-white",
                                ].join(" ")
                            }
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="mt-8 px-6 text-xs text-slate-500">
                SMS · v1.0
            </div>
        </aside>
    );
}

export default Sidebar;