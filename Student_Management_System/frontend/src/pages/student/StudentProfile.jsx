import {
    CalendarDays,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";

import { studentProfileData } from "@/data/mockData";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                <Icon className="h-4 w-4 text-[var(--sms-gold)]" />
                {label}
            </div>

            <p className="font-semibold text-[var(--sms-ink)]">{value}</p>
        </div>
    );
}

function StudentProfile() {
    const student = studentProfileData;

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Student
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        My Profile
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        View your personal information, academic details, department,
                        advisor, and guardian contact information.
                    </p>
                </div>

                    <Button type="button" variant="outline" disabled title="Profile update requests are coming soon">Request Information Update</Button>
            </div>

            <section className="sms-card mb-8 rounded-md p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--sms-gold)] bg-[var(--sms-ink)] text-3xl font-bold text-white">
                            {student.fullName
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)}
                        </div>

                        <div>
                            <p className="font-mono text-sm text-[var(--sms-muted)]">
                                {student.studentCode}
                            </p>

                            <h2 className="mt-1 text-3xl font-bold text-[var(--sms-ink)]">
                                {student.fullName}
                            </h2>

                            <p className="mt-1 text-[var(--sms-muted)]">
                                {student.department}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline" className="sms-badge-active">
                                    {student.academicStatus}
                                </Badge>

                                <Badge variant="outline" className="sms-badge-info">
                                    {student.yearLevel}
                                </Badge>

                                <Badge variant="outline" className="sms-badge-warning">
                                    {student.semester}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4 text-sm">
                        <p className="text-[var(--sms-muted)]">Academic Advisor</p>
                        <p className="mt-1 font-semibold text-[var(--sms-ink)]">
                            {student.advisor}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-3">
                <InfoItem icon={User} label="Gender" value={student.gender} />
                <InfoItem
                    icon={CalendarDays}
                    label="Date of Birth"
                    value={student.dateOfBirth}
                />
                <InfoItem
                    icon={GraduationCap}
                    label="Enrollment Date"
                    value={student.enrollmentDate}
                />
            </section>

            <section className="sms-card mb-8 rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Contact Information
                    </h2>
                    <p className="text-sm text-[var(--sms-muted)]">
                        Your personal contact details.
                    </p>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">
                    <InfoItem icon={Mail} label="Email" value={student.email} />
                    <InfoItem icon={Phone} label="Phone" value={student.phone} />
                    <InfoItem icon={MapPin} label="Address" value={student.address} />
                </div>
            </section>

            <section className="sms-card mb-8 rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Academic Information
                    </h2>
                    <p className="text-sm text-[var(--sms-muted)]">
                        Your current academic department and study level.
                    </p>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">
                    <InfoItem
                        icon={GraduationCap}
                        label="Department"
                        value={student.department}
                    />

                    <InfoItem icon={ShieldCheck} label="Status" value={student.academicStatus} />

                    <InfoItem icon={CalendarDays} label="Year Level" value={student.yearLevel} />

                    <InfoItem icon={CalendarDays} label="Semester" value={student.semester} />
                </div>
            </section>

            <section className="sms-card rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Guardian Information
                    </h2>
                    <p className="text-sm text-[var(--sms-muted)]">
                        Emergency or guardian contact information.
                    </p>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">
                    <InfoItem icon={Users} label="Guardian Name" value={student.guardianName} />
                    <InfoItem icon={Phone} label="Guardian Phone" value={student.guardianPhone} />
                </div>
            </section>
        </>
    );
}

export default StudentProfile;
