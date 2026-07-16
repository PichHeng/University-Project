import { dashboardStats } from "@/data/mockData";

function StudentDashboard() {
    return (
        <>
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                    Student
                </p>

                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                    Student Dashboard
                </h1>

                <p className="mt-2 text-[var(--sms-muted)]">
                    View your profile, courses, attendance, grades, and reports.
                </p>
            </div>

            <section className="grid gap-4 md:grid-cols-4">
                {dashboardStats.student.map((item) => (
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

            <section className="mt-8 rounded-md border border-[var(--sms-line)] bg-white p-5">
                <h2 className="font-semibold text-[var(--sms-ink)]">
                    Academic Summary
                </h2>

                <div className="mt-4 space-y-3 text-sm text-[var(--sms-muted)]">
                    <p>Program: Information Technology Engineering</p>
                    <p>Year Level: Year 3</p>
                    <p>Status: Active</p>
                </div>
            </section>
        </>
    );
}

export default StudentDashboard;