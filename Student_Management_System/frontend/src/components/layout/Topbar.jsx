// import { useNavigate } from "react-router-dom";
// import { LogOut, Menu } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// function Topbar({ user, onMenuClick }) {
//     const navigate = useNavigate();

//     function handleLogout() {
//         localStorage.removeItem("sms_user");
//         navigate("/login", { replace: true });
//     }

//     return (
//         <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-white/10 bg-[var(--sms-ink-dark)] px-3 text-white shadow-md sm:px-5">
//             <div className="flex items-center gap-3">
//                 <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={onMenuClick}
//                     aria-label="Open navigation"
//                     className="text-white hover:bg-white/10 hover:text-white md:hidden"
//                 >
//                     <Menu aria-hidden="true" />
//                 </Button>
//                 <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--sms-gold)] text-xs font-bold text-[var(--sms-gold)]">
//                     SMS
//                 </div>

//                 <div>
//                     <h1 className="text-sm font-semibold">
//                         Student Management System
//                     </h1>
//                     <p className="hidden text-xs text-slate-400 sm:block">Academic Dashboard</p>
//                 </div>
//             </div>

//             <div className="flex items-center gap-3">
//                 <Badge className="hidden bg-[var(--sms-gold)] text-[var(--sms-ink-dark)] hover:bg-[var(--sms-gold)] sm:inline-flex">
//                     {user?.role?.toUpperCase()} · {user?.name}
//                 </Badge>

//                 <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={function handleLogout() {
//                         localStorage.removeItem("sms_token");
//                         localStorage.removeItem("sms_user");
//                         navigate("/login");
//                     }}
//                     className="sms-btn-dark"
//                 >
//                     <LogOut aria-hidden="true" className="h-4 w-4 sm:mr-1" />
//                     <span className="hidden sm:inline">Log out</span>
//                 </Button>
//             </div>
//         </header>
//     );
// }

// export default Topbar;

import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Topbar({ user, onMenuClick }) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("sms_token");
        localStorage.removeItem("sms_user");
        navigate("/login");
    }

    return (
        <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[var(--sms-ink-dark)] px-3 text-white shadow-md sm:px-5">
            <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation" className="text-white hover:bg-white/10 hover:text-white md:hidden">
                    <Menu aria-hidden="true" />
                </Button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--sms-gold)] text-xs font-bold text-[var(--sms-gold)]">
                    SMS
                </div>

                <div>
                    <h1 className="text-sm font-semibold">
                        Student Management System
                    </h1>
                    <p className="hidden text-xs text-slate-400 sm:block">Academic Dashboard</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Badge className="hidden max-w-56 truncate bg-[var(--sms-gold)] text-[var(--sms-ink-dark)] hover:bg-[var(--sms-gold)] sm:inline-flex">
                    {user?.role?.toUpperCase()} · {user?.name}
                </Badge>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-slate-600 bg-transparent text-slate-200 hover:bg-[var(--sms-ink-soft)] hover:text-white"
                >
                    <LogOut aria-hidden="true" className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Log out</span>
                </Button>
            </div>
        </header>
    );
}

export default Topbar;
