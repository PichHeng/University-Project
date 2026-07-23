import { useCallback, useEffect, useState } from "react";
import { CalendarDays, GraduationCap, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";

import { getMyStudentProfile } from "@/services/studentService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function InfoItem({ icon: Icon, label, value }) {
    return <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]"><Icon className="h-4 w-4 text-[var(--sms-gold)]" />{label}</div><p className="font-semibold text-[var(--sms-ink)]">{value || "N/A"}</p></div>;
}

function StudentProfile() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMyStudentProfile();
            setStudent(response.data || null);
        } catch (requestError) {
            setStudent(null);
            setError(requestError.response?.data?.message || "Failed to load student profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading API data on mount is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProfile();
    }, [loadProfile]);

    if (loading) return <div className="sms-card p-8 text-center text-[var(--sms-muted)]">Loading student profile…</div>;
    if (error) return <div role="alert" className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}<div className="mt-3"><Button type="button" variant="outline" onClick={loadProfile}>Try Again</Button></div></div>;
    if (!student) return <div className="sms-card p-8 text-center text-[var(--sms-muted)]">No student profile found.</div>;

    const initials = String(student.fullName || student.studentCode || "S").split(/\s+/u).map((word) => word[0]).join("").slice(0, 2);
    const status = String(student.status || "").toLowerCase();

    return <>
        <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Student</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">My Profile</h1><p className="mt-2 text-[var(--sms-muted)]">Personal and academic information from your student record.</p></div>
        <section className="sms-card mb-8 p-6"><div className="flex flex-col gap-6 md:flex-row md:items-center"><div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--sms-gold)] bg-[var(--sms-ink)] text-3xl font-bold text-white">{initials}</div><div><p className="font-mono text-sm text-[var(--sms-muted)]">{student.studentCode}</p><h2 className="mt-1 text-3xl font-bold text-[var(--sms-ink)]">{student.fullName}</h2><p className="mt-1 text-[var(--sms-muted)]">{student.department || "No Department"}</p><div className="mt-3 flex gap-2"><Badge variant="outline" className={status === "active" ? "sms-badge-active" : "sms-badge-inactive"}>{student.status || "N/A"}</Badge><Badge variant="outline" className="sms-badge-info">Year {student.yearLevel || "N/A"}</Badge></div></div></div></section>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={User} label="Username" value={student.username} />
            <InfoItem icon={User} label="Gender" value={student.gender} />
            <InfoItem icon={CalendarDays} label="Date of Birth" value={student.dateOfBirth} />
            <InfoItem icon={Mail} label="Email" value={student.email} />
            <InfoItem icon={Phone} label="Phone" value={student.phone} />
            <InfoItem icon={MapPin} label="Address" value={student.address} />
            <InfoItem icon={GraduationCap} label="Department" value={student.department} />
            <InfoItem icon={GraduationCap} label="Department Code" value={student.departmentCode} />
            <InfoItem icon={ShieldCheck} label="Academic Status" value={student.status} />
        </section>
    </>;
}

export default StudentProfile;
