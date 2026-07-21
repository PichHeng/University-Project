import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function PageHeader({ eyebrow, title, description }) {
    const navigate = useNavigate();
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("sms_user"));
    } catch {
        // A corrupt session is handled by ProtectedRoute on the next navigation.
    }

    function handleLogout() {
        localStorage.removeItem("sms_user");
        navigate("/login", { replace: true });
    }

    return (
        <header className="mb-8 flex flex-col gap-5 border-b border-[var(--sms-line)] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold-dark)]">
                    {eyebrow}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-[var(--sms-ink)] sm:text-3xl">
                    {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--sms-muted)] sm:text-base">
                    {description}
                </p>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--sms-ink)]">{user?.name ?? "User"}</p>
                    <p className="text-xs capitalize text-[var(--sms-muted)]">{user?.role}</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="sms-btn-outline"
                >
                    <LogOut aria-hidden="true" />
                    Log out
                </Button>
            </div>
        </header>
    );
}

export default PageHeader;
