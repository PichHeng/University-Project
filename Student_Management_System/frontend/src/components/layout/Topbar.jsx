import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Topbar({ user }) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("sms_user");
        navigate("/login");
    }

    return (
        <header className="flex h-14 items-center justify-between bg-[var(--sms-ink-dark)] px-5 text-white">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--sms-gold)] text-xs font-bold text-[var(--sms-gold)]">
                    SMS
                </div>

                <div>
                    <h1 className="text-sm font-semibold">Student Management System</h1>
                    <p className="text-xs text-slate-400">
                        Academic Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Badge className="bg-[var(--sms-gold)] text-[var(--sms-ink-dark)] hover:bg-[var(--sms-gold)]">
                    {user?.role?.toUpperCase()} · {user?.name}
                </Badge>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </div>
        </header>
    );
}

export default Topbar; 