import { dashboardStats } from "@/data/mockData";

function TeacherDashboard() {
    return (
        <>
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                    Teacher
                </p>

                <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                    Teacher Dashboard
                </h1>

                <p className="mt-2 text-[var(--sms-muted)]">
                    Manage attendance, grades, assignments, and academic records.
                </p>
            </div>

            <section className="grid gap-4 md:grid-cols-4">
                {dashboardStats.teacher.map((item) => (
                    <div
                        key={item.label}
                        className="sms-card p-5"
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

            <section className="sms-card mt-8 p-5">
                <h2 className="font-semibold text-[var(--sms-ink)]">
                    Today&apos;s Schedule
                </h2>

                <div className="mt-4 space-y-3 text-sm text-[var(--sms-muted)]">
                    <p>09:00 AM — Object-Oriented Analysis & Design · Room 204</p>
                    <p>01:00 PM — Database Systems · Room 118</p>
                </div>
            </section>
        </>
    );
}

export default TeacherDashboard;
