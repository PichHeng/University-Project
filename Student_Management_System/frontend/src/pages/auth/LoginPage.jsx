// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff, GraduationCap } from "lucide-react";
// import { demoAccounts } from "@/data/mockData";

// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// function LoginPage() {
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         username: "",
//         password: "",
//     });

//     const [error, setError] = useState("");
//     const [showPassword, setShowPassword] = useState(false);

//     useEffect(() => {
//         try {
//             const user = JSON.parse(localStorage.getItem("sms_user"));
//             if (["admin", "teacher", "student"].includes(user?.role)) {
//                 navigate(`/${user.role}/dashboard`, { replace: true });
//             }
//         } catch {
//             localStorage.removeItem("sms_user");
//         }
//     }, [navigate]);

//     function handleChange(event) {
//         const { name, value } = event.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));

//         setError("");
//     }

//     function handleSubmit(event) {
//         event.preventDefault()

//         const account = Object.values(demoAccounts).find(
//             (item) =>
//                 item.username.toLowerCase() === formData.username.trim().toLowerCase() &&
//                 item.password === formData.password
//         );

//         if (!account) {
//             setError("Incorrect username or password.");
//             return;
//         }

//         localStorage.setItem("sms_user", JSON.stringify(account));

//         navigate(`/${account.role}/dashboard`, { replace: true });
//     }

//     function chooseDemoAccount(account) {
//         setFormData({ username: account.username, password: account.password });
//         setError("");
//     }

//     return (
//         <main className="grid min-h-screen place-items-center bg-[var(--sms-page)] px-4 py-6">
//             <Card className="w-full max-w-md overflow-hidden rounded-xl border-[var(--sms-line)] bg-[var(--sms-card)] shadow-2xl shadow-slate-900/10">
//                 <CardHeader className="relative bg-[var(--sms-ink)] px-6 py-7 text-white sm:px-10 sm:py-9">
//                     <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--sms-gold)] text-[var(--sms-gold)]">
//                         <GraduationCap aria-hidden="true" className="h-6 w-6" />
//                     </div>

//                     <CardTitle className="text-2xl font-bold tracking-tight">
//                         Student Management System
//                     </CardTitle>

//                     <p className="mt-2 text-sm text-slate-300">
//                         Academic information, attendance, grades, and reports.
//                     </p>

//                     <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[var(--sms-gold)] via-[var(--sms-gold-soft)] to-transparent" />
//                 </CardHeader>

//                 <CardContent className="px-6 py-7 sm:px-10 sm:py-8">
//                     <div className="mb-6">
//                         <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sms-muted)]">
//                             Sign in
//                         </p>

//                         <h1 className="mt-2 text-xl font-semibold text-[var(--sms-ink-dark)]">
//                             Welcome back
//                         </h1>

//                         <p className="mt-1 text-sm text-[var(--sms-muted)]">
//                             Use your school account to continue.
//                         </p>
//                     </div>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div className="space-y-2">
//                             <Label htmlFor="username">Username</Label>
//                             <Input
//                                 id="username"
//                                 name="username"
//                                 placeholder="e.g. admin"
//                                 value={formData.username}
//                                 onChange={handleChange}
//                                 autoComplete="username"
//                                 required
//                                 autoFocus
//                                 aria-invalid={Boolean(error)}
//                             />
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="password">Password</Label>
//                             <div className="relative">
//                                 <Input
//                                     id="password"
//                                     name="password"
//                                     type={showPassword ? "text" : "password"}
//                                     placeholder="••••••••"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     autoComplete="current-password"
//                                     required
//                                     aria-invalid={Boolean(error)}
//                                     className="pr-10"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword((visible) => !visible)}
//                                     aria-label={showPassword ? "Hide password" : "Show password"}
//                                     className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-[var(--sms-muted)] hover:text-[var(--sms-ink)]"
//                                 >
//                                     {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
//                                 </button>
//                             </div>
//                         </div>

//                         {error && (
//                             <p role="alert" className="rounded-md bg-[var(--sms-danger-bg)] px-3 py-2 text-sm text-[var(--sms-danger)]">
//                                 {error}
//                             </p>
//                         )}

//                         <Button
//                             type="submit"
//                             className="sms-btn-primary w-full"
//                         >
//                             Log in
//                         </Button>
//                     </form>

//                     <div className="mt-6 rounded-md border border-[var(--sms-line)] bg-[var(--sms-page-soft)] p-4 text-sm">
//                         <p className="mb-3 font-semibold text-[var(--sms-ink)]">
//                             Demo accounts
//                         </p>

//                         <div className="grid grid-cols-3 gap-2">
//                             {Object.values(demoAccounts).map((account) => (
//                                 <Button key={account.role} type="button" variant="outline" size="sm" onClick={() => chooseDemoAccount(account)} className="sms-btn-outline capitalize">
//                                     {account.role}
//                                 </Button>
//                             ))}
//                         </div>
//                         <p className="mt-3 text-xs text-[var(--sms-muted)]">Choose a role to fill its demo credentials.</p>
//                     </div>
//                 </CardContent>
//             </Card>
//         </main>
//     );
// }

// export default LoginPage;





import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Lock, LogIn, User } from "lucide-react";

import { loginUser } from "@/services/authService";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getDashboardPath(role) {
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === "admin") return "/admin/dashboard";
    if (normalizedRole === "teacher") return "/teacher/dashboard";
    if (normalizedRole === "student") return "/student/dashboard";

    return "/login";
}

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const testAccounts = [
        { role: "Admin", username: "admin", password: "Admin@123" },
        { role: "Teacher", username: "tch-2001", password: "Teacher@123" },
        { role: "Student", username: "stu-2001", password: "Student@123" },
    ];

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrorMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await loginUser(formData.username, formData.password);

            const token = data.token;
            const user = data.user;

            if (!token || !user) {
                throw new Error("Invalid login response from server.");
            }

            localStorage.setItem("sms_token", token);
            localStorage.setItem("sms_user", JSON.stringify(user));

            navigate(getDashboardPath(user.role), { replace: true });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please check your username and password.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--sms-page)] px-4 py-6 sm:py-10">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--sms-line)] bg-[var(--sms-card)] shadow-2xl shadow-slate-900/10 md:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden bg-[var(--sms-ink)] p-8 text-white md:flex md:flex-col md:justify-between lg:p-10">
                    <div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--sms-gold)] text-[var(--sms-gold)]">
                            <GraduationCap aria-hidden="true" className="h-7 w-7" />
                        </div>

                        <h1 className="mt-8 text-4xl font-bold leading-tight">
                            Student Management System
                        </h1>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                            Manage students, teachers, departments, courses, enrollments,
                            attendance, grades, assignments, and reports in one academic
                            dashboard.
                        </p>
                    </div>

                    <div className="rounded-xl border border-[var(--sms-ink-soft)] bg-[var(--sms-ink-dark)] p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--sms-gold)]">
                            Academic Portal
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                            Admin · Teacher · Student
                        </p>
                    </div>
                </section>

                <section className="p-6 sm:p-8 md:p-10">
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold text-[var(--sms-ink)]">
                                Sign in
                            </CardTitle>

                            <p className="text-sm text-[var(--sms-muted)]">
                                Use your system account to access the dashboard.
                            </p>
                        </CardHeader>

                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>

                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                                        <Input
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            placeholder="admin"
                                            className="pl-9"
                                            autoComplete="username"
                                            autoFocus
                                            aria-invalid={Boolean(errorMessage)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>

                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Admin@123"
                                            className="px-9"
                                            autoComplete="current-password"
                                            aria-invalid={Boolean(errorMessage)}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[var(--sms-muted)] hover:text-[var(--sms-ink)]" aria-label={showPassword ? "Hide password" : "Show password"}>
                                            {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div role="alert" className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="sms-btn-primary w-full"
                                >
                                    <LogIn aria-hidden="true" className="mr-2 h-4 w-4" />
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>

                                <div className="rounded-lg border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4 text-sm text-[var(--sms-muted)]">
                                    <p className="font-semibold text-[var(--sms-ink)]">
                                        Test accounts
                                    </p>
                                    <p className="mt-1 text-xs">Choose a role to fill the sign-in form.</p>
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        {testAccounts.map((account) => (
                                            <Button key={account.role} type="button" variant="outline" size="sm" onClick={() => { setFormData({ username: account.username, password: account.password }); setErrorMessage(""); }} className="min-w-0 px-2">
                                                <span className="truncate">{account.role}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}

export default LoginPage;
