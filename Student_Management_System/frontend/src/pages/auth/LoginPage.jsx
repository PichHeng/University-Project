import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoAccounts } from "@/data/mockData";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("sms_user"));
            if (["admin", "teacher", "student"].includes(user?.role)) {
                navigate(`/${user.role}/dashboard`, { replace: true });
            }
        } catch {
            localStorage.removeItem("sms_user");
        }
    }, [navigate]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    }

    function handleSubmit(event) {
        event.preventDefault()

        const account = Object.values(demoAccounts).find(
            (item) =>
                item.username === formData.username.trim() &&
                item.password === formData.password
        );

        if (!account) {
            setError("Incorrect username or password.");
            return;
        }

        localStorage.setItem("sms_user", JSON.stringify(account));

        if (account.role === "admin") {
            navigate("/admin/dashboard");
        } else if (account.role === "teacher") {
            navigate("/teacher/dashboard");
        } else {
            navigate("/student/dashboard");
        }
    }

    return (
        <main className="min-h-screen bg-[var(--sms-paper)] px-4 py-5 sm:py-8">
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Card className="w-full max-w-md overflow-hidden rounded-md border-[var(--sms-line)] bg-white shadow-2xl shadow-slate-900/10">
                    <CardHeader className="relative bg-[var(--sms-ink)] px-6 py-7 text-white sm:px-10 sm:py-9">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--sms-gold)] text-sm font-bold text-[var(--sms-gold)]">
                            SMS
                        </div>

                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Student Management System
                        </CardTitle>

                        <p className="mt-2 text-sm text-slate-300">
                            Academic information, attendance, grades, and reports.
                        </p>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[var(--sms-gold)] via-[var(--sms-gold-soft)] to-transparent" />
                    </CardHeader>

                    <CardContent className="px-6 py-7 sm:px-10 sm:py-8">
                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sms-muted)]">
                                Sign in
                            </p>

                            <h1 className="mt-2 text-xl font-semibold text-[var(--sms-ink-dark)]">
                                Welcome back
                            </h1>

                            <p className="mt-1 text-sm text-[var(--sms-muted)]">
                                Use your school account to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="e.g. admin"
                                    value={formData.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {error && (
                                <p role="alert" className="rounded-md bg-[var(--sms-danger-bg)] px-3 py-2 text-sm text-[var(--sms-danger)]">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                            >
                                Log in
                            </Button>
                        </form>

                        <div className="mt-6 rounded-md border border-[var(--sms-line)] bg-[var(--sms-paper)] p-4 text-sm">
                            <p className="mb-3 font-semibold text-[var(--sms-ink)]">
                                Demo accounts
                            </p>

                            <div className="space-y-2 text-[var(--sms-muted)]">
                                <p>
                                    <strong>Admin:</strong> admin / Admin@123
                                </p>
                                <p>
                                    <strong>Teacher:</strong> teacher / Teacher@123
                                </p>
                                <p>
                                    <strong>Student:</strong> student / Student@123
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default LoginPage;
