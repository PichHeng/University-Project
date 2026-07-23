import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, RefreshCcw, Search } from "lucide-react";

import { enrollInCourse, getMyAvailableCourses, getMyEnrolledCourses } from "@/services/enrollmentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function StudentEnrollCourses() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getMyAvailableCourses();
            setCourses(response.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load available courses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCourses();
    }, [loadCourses]);

    const visibleCourses = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return courses.filter((course) => !keyword || [course.courseCode, course.courseName, course.department, course.teacher, course.semester].some((value) => value?.toLowerCase().includes(keyword)));
    }, [courses, search]);

    async function handleEnroll(course) {
        if (!window.confirm(`Enroll in ${course.courseCode} - ${course.courseName}?`)) return;
        try {
            setEnrollingId(course.id);
            setError("");
            setMessage("");
            const response = await enrollInCourse(course.id);
            const [, enrolledResponse] = await Promise.all([loadCourses(), getMyEnrolledCourses()]);
            const enrolledCount = enrolledResponse.data?.length || 0;
            setMessage(`${response.message || "Enrollment successful."} My Courses now contains ${enrolledCount} course(s).`);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Enrollment failed.");
        } finally {
            setEnrollingId(null);
        }
    }

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Student</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Enroll Courses</h1><p className="mt-2 text-[var(--sms-muted)]">Browse active courses that are available to you.</p></div><Button variant="outline" onClick={loadCourses} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button></div>
        {error && <div className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}{message && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
        <section className="sms-card overflow-hidden"><div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center"><div><h2 className="font-semibold text-[var(--sms-ink)]">Available Courses</h2><p className="text-sm text-[var(--sms-muted)]">{visibleCourses.length} course(s)</p></div><div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses..." /></div></div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Department</TableHead><TableHead>Teacher</TableHead><TableHead>Credit</TableHead><TableHead>Semester</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-[var(--sms-muted)]">Loading courses…</TableCell></TableRow> : visibleCourses.length ? visibleCourses.map((course) => <TableRow key={course.id}><TableCell><p className="font-medium">{course.courseName}</p><p className="font-mono text-xs text-[var(--sms-muted)]">{course.courseCode}</p></TableCell><TableCell>{course.department}</TableCell><TableCell>{course.teacher}</TableCell><TableCell>{course.credit}</TableCell><TableCell>{course.semester || "—"}</TableCell><TableCell className="text-right"><Button className="sms-btn-primary" onClick={() => handleEnroll(course)} disabled={enrollingId === course.id}><BookOpen className="mr-2 h-4 w-4" />{enrollingId === course.id ? "Enrolling…" : "Enroll"}</Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={6} className="py-12 text-center text-[var(--sms-muted)]">No active courses are currently available.</TableCell></TableRow>}</TableBody></Table></div></section>
    </>;
}

export default StudentEnrollCourses;
