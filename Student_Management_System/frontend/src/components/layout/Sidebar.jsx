import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    path: "/admin/students",
    icon: GraduationCap,
  },
  {
    label: "Teachers",
    path: "/admin/teachers",
    icon: Users,
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
];

const teacherLinks = [
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
];

const studentLinks = [
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
];

function getLinksByRole(role) {
  if (role === "admin") return adminLinks;
  if (role === "teacher") return teacherLinks;
  return studentLinks;
}

function Sidebar({ role, isOpen = false, onClose }) {
  const links = getLinksByRole(role);

  return (
    <>
    {isOpen && (
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[1px] md:hidden"
        onClick={onClose}
        aria-label="Close navigation"
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-[var(--sms-ink-soft)] bg-[var(--sms-ink)] text-white shadow-2xl transition-transform duration-200 md:static md:z-20 md:h-full md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="border-b border-[var(--sms-ink-soft)] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sms-gold)]">Navigation</p>
            <p className="mt-1 text-sm text-slate-300">{role?.toUpperCase()} Panel</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation" className="text-slate-300 hover:bg-white/10 hover:text-white md:hidden">
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-[var(--sms-gold)] text-[var(--sms-ink-dark)]"
                    : "text-slate-300 hover:bg-[var(--sms-ink-soft)] hover:text-white",
                ].join(" ")
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
    </>
  );
}

export default Sidebar;
