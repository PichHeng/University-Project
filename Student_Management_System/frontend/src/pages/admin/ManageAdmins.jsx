import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, KeyRound, RefreshCcw, Search } from "lucide-react";

import { getAdminUsers, resetUserPassword, updateUser } from "@/services/userService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function ManageAdmins() {
    const [admins, setAdmins] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editing, setEditing] = useState(null);
    const [resetting, setResetting] = useState(null);
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState("Active");
    const [password, setPassword] = useState("");

    const loadAdmins = useCallback(async () => {
        try {
            setLoading(true); setError("");
            const response = await getAdminUsers();
            setAdmins(response.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load admin accounts.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        // Loading remote data on mount is an intentional effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAdmins();
    }, [loadAdmins]);

    const visibleAdmins = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return admins.filter((admin) => !keyword || admin.username.toLowerCase().includes(keyword) || admin.status.toLowerCase().includes(keyword));
    }, [admins, search]);

    function openEdit(admin) { setEditing(admin); setUsername(admin.username); setStatus(admin.status); setError(""); }
    async function saveEdit(event) {
        event.preventDefault();
        try { setSaving(true); setError(""); await updateUser(editing.id, { username, status }); setMessage("Admin account updated successfully."); setEditing(null); await loadAdmins(); }
        catch (requestError) { setError(requestError.response?.data?.message || "Failed to update admin account."); }
        finally { setSaving(false); }
    }
    async function savePassword(event) {
        event.preventDefault();
        try { setSaving(true); setError(""); await resetUserPassword(resetting.id, password); setMessage(`Password reset for ${resetting.username}.`); setResetting(null); setPassword(""); }
        catch (requestError) { setError(requestError.response?.data?.message || "Failed to reset password."); }
        finally { setSaving(false); }
    }

    return <>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">Administrator</p><h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">Admin Accounts</h1><p className="mt-2 text-[var(--sms-muted)]">View and maintain administrator login accounts only.</p></div><Button variant="outline" onClick={loadAdmins} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button></div>
        {error && <div className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">{error}</div>}{message && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
        <section className="sms-card overflow-hidden"><div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center"><div><h2 className="font-semibold text-[var(--sms-ink)]">Administrators</h2><p className="text-sm text-[var(--sms-muted)]">{visibleAdmins.length} admin account(s)</p></div><div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search admins..." /></div></div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>User ID</TableHead><TableHead>Username</TableHead><TableHead>Status</TableHead><TableHead>Created At</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]">Loading admin accounts…</TableCell></TableRow> : visibleAdmins.length ? visibleAdmins.map((admin) => <TableRow key={admin.id}><TableCell>{admin.id}</TableCell><TableCell className="font-medium">{admin.username}</TableCell><TableCell><Badge variant="outline" className={admin.status === "Active" ? "sms-badge-active" : "sms-badge-inactive"}>{admin.status}</Badge></TableCell><TableCell>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}</TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="outline" size="icon" aria-label={`Edit ${admin.username}`} onClick={() => openEdit(admin)}><Edit className="h-4 w-4" /></Button><Button variant="outline" size="icon" aria-label={`Reset password for ${admin.username}`} onClick={() => { setResetting(admin); setPassword(""); setError(""); }}><KeyRound className="h-4 w-4" /></Button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="py-12 text-center text-[var(--sms-muted)]">No admin accounts found.</TableCell></TableRow>}</TableBody></Table></div></section>

        <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Edit Admin</DialogTitle></DialogHeader><form onSubmit={saveEdit} className="space-y-4"><div className="space-y-2"><Label>Username</Label><Input value={username} onChange={(event) => setUsername(event.target.value)} required /></div><div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></div><DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button className="sms-btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button></DialogFooter></form></DialogContent></Dialog>
        <Dialog open={Boolean(resetting)} onOpenChange={(open) => !open && setResetting(null)}><DialogContent><DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader><form onSubmit={savePassword} className="space-y-4"><p className="text-sm text-[var(--sms-muted)]">Set a new password for <strong>{resetting?.username}</strong>.</p><div className="space-y-2"><Label>New Password</Label><Input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setResetting(null)}>Cancel</Button><Button className="sms-btn-primary" disabled={saving}>{saving ? "Resetting…" : "Reset Password"}</Button></DialogFooter></form></DialogContent></Dialog>
    </>;
}

export default ManageAdmins;
