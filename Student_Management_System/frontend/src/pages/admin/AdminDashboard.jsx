import { dashboardStats, recentStudents } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

function AdminDashboard() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
          Administrator
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-[var(--sms-muted)]">
          Manage students, teachers, departments, courses, enrollments, users, and reports.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {dashboardStats.admin.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-[var(--sms-line)] bg-white p-5 shadow-sm"
          >
            <p className="text-3xl font-bold text-[var(--sms-ink)]">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
              {item.label}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-md border border-[var(--sms-line)] bg-white">
        <div className="border-b border-[var(--sms-line)] bg-[var(--sms-paper-soft)] px-5 py-4">
          <h2 className="font-semibold text-[var(--sms-ink)]">
            Recent Students
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--sms-line)] text-xs uppercase tracking-wide text-[var(--sms-muted)]">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Gender</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-[var(--sms-line)] hover:bg-[var(--sms-paper-soft)]"
                >
                  <td className="px-5 py-3 font-mono text-xs">
                    {student.id}
                  </td>
                  <td className="px-5 py-3">{student.name}</td>
                  <td className="px-5 py-3">{student.gender}</td>
                  <td className="px-5 py-3">{student.department}</td>
                  <td className="px-5 py-3">{student.phone}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline">{student.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default AdminDashboard;