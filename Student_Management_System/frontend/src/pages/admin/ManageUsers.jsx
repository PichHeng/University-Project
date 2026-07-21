// import { useMemo, useState } from "react";
// import { Edit, Plus, Search, Trash2 } from "lucide-react";

// import { usersData } from "@/data/mockData";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog";

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";

// const emptyForm = {
//     username: "",
//     fullName: "",
//     role: "Student",
//     email: "",
//     status: "Active",
//     createdAt: "",
// };

// function ManageUsers() {
//     const [users, setUsers] = useState(usersData);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);
//     const [formData, setFormData] = useState(emptyForm);

//     const filteredUsers = useMemo(() => {
//         const keyword = searchTerm.toLowerCase();

//         return users.filter((user) => {
//             return (
//                 user.username.toLowerCase().includes(keyword) ||
//                 user.fullName.toLowerCase().includes(keyword) ||
//                 user.role.toLowerCase().includes(keyword) ||
//                 user.email.toLowerCase().includes(keyword) ||
//                 user.status.toLowerCase().includes(keyword)
//             );
//         });
//     }, [users, searchTerm]);

//     function openAddDialog() {
//         setEditingUser(null);
//         setFormData({
//             ...emptyForm,
//             createdAt: new Date().toISOString().split("T")[0],
//         });
//         setIsDialogOpen(true);
//     }

//     function openEditDialog(user) {
//         setEditingUser(user);

//         setFormData({
//             username: user.username,
//             fullName: user.fullName,
//             role: user.role,
//             email: user.email,
//             status: user.status,
//             createdAt: user.createdAt,
//         });

//         setIsDialogOpen(true);
//     }

//     function handleInputChange(event) {
//         const { name, value } = event.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     }

//     function handleSelectChange(name, value) {
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     }

//     function handleSubmit(event) {
//         event.preventDefault();

//         if (editingUser) {
//             setUsers((prev) =>
//                 prev.map((user) =>
//                     user.id === editingUser.id
//                         ? {
//                             ...user,
//                             ...formData,
//                         }
//                         : user
//                 )
//             );
//         } else {
//             const newUser = {
//                 id: Date.now(),
//                 ...formData,
//             };

//             setUsers((prev) => [newUser, ...prev]);
//         }

//         setIsDialogOpen(false);
//         setEditingUser(null);
//         setFormData(emptyForm);
//     }

//     function handleDelete(userId) {
//         const isConfirmed = window.confirm(
//             "Are you sure you want to delete this user account?"
//         );

//         if (!isConfirmed) return;

//         setUsers((prev) => prev.filter((user) => user.id !== userId));
//     }

//     function getRoleBadgeClass(role) {
//         if (role === "Admin") {
//             return "border-purple-200 bg-purple-50 text-purple-700";
//         }

//         if (role === "Teacher") {
//             return "sms-badge-info";
//         }

//         return "sms-badge-warning";
//     }

//     function getStatusBadgeClass(status) {
//         return status === "Active"
//             ? "sms-badge-active"
//             : "sms-badge-inactive";
//     }

//     return (
//         <>
//             <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//                 <div>
//                     <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
//                         Administrator
//                     </p>

//                     <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
//                         User Account Management
//                     </h1>

//                     <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
//                         Manage login accounts, roles, account status, and access control for
//                         administrators, teachers, and students.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                     <Button
//                         onClick={openAddDialog}
//                         className="sms-btn-primary"
//                     >
//                         <Plus className="mr-2 h-4 w-4" />
//                         Add User
//                     </Button>

//                     <Button variant="outline">Export PDF</Button>
//                     <Button variant="outline">Export Excel</Button>
//                 </div>
//             </div>

//             <section className="sms-card overflow-hidden">
//                 <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
//                     <div>
//                         <h2 className="sms-panel-title">
//                             User Accounts
//                         </h2>

//                         <p className="text-sm text-[var(--sms-muted)]">
//                             {filteredUsers.length} account(s) found
//                         </p>
//                     </div>

//                     <div className="relative w-full md:w-80">
//                         <Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

//                         <Input
//                             placeholder="Search user..."
//                             value={searchTerm}
//                             onChange={(event) => setSearchTerm(event.target.value)}
//                             className="pl-9"
//                         />
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Username</TableHead>
//                                 <TableHead>Full Name</TableHead>
//                                 <TableHead>Email</TableHead>
//                                 <TableHead>Role</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead>Created At</TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>

//                         <TableBody>
//                             {filteredUsers.length > 0 ? (
//                                 filteredUsers.map((user) => (
//                                     <TableRow key={user.id}>
//                                         <TableCell className="font-mono text-xs">
//                                             {user.username}
//                                         </TableCell>

//                                         <TableCell className="font-medium">
//                                             {user.fullName}
//                                         </TableCell>

//                                         <TableCell>{user.email}</TableCell>

//                                         <TableCell>
//                                             <Badge
//                                                 variant="outline"
//                                                 className={getRoleBadgeClass(user.role)}
//                                             >
//                                                 {user.role}
//                                             </Badge>
//                                         </TableCell>

//                                         <TableCell>
//                                             <Badge
//                                                 variant="outline"
//                                                 className={getStatusBadgeClass(user.status)}
//                                             >
//                                                 {user.status}
//                                             </Badge>
//                                         </TableCell>

//                                         <TableCell className="font-mono text-xs">
//                                             {user.createdAt}
//                                         </TableCell>

//                                         <TableCell>
//                                             <div className="flex justify-end gap-2">
//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => openEditDialog(user)}
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>

//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon"
//                                                     onClick={() => handleDelete(user.id)}
//                                                 >
//                                                     <Trash2 className="h-4 w-4 text-[var(--sms-danger)]" />
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell
//                                         colSpan="7"
//                                         className="py-12 text-center text-[var(--sms-muted)]"
//                                     >
//                                         No user accounts found.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </section>

//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                         <DialogTitle>
//                             {editingUser ? "Edit User Account" : "Add User Account"}
//                         </DialogTitle>
//                     </DialogHeader>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div className="grid gap-4 md:grid-cols-2">
//                             <div className="space-y-2">
//                                 <Label>Username</Label>
//                                 <Input
//                                     name="username"
//                                     value={formData.username}
//                                     onChange={handleInputChange}
//                                     placeholder="username"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Full Name</Label>
//                                 <Input
//                                     name="fullName"
//                                     value={formData.fullName}
//                                     onChange={handleInputChange}
//                                     placeholder="Full name"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2 md:col-span-2">
//                                 <Label>Email</Label>
//                                 <Input
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleInputChange}
//                                     placeholder="user@school.edu"
//                                     type="email"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Role</Label>
//                                 <Select
//                                     value={formData.role}
//                                     onValueChange={(value) => handleSelectChange("role", value)}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select role" />
//                                     </SelectTrigger>

//                                     <SelectContent>
//                                         <SelectItem value="Admin">Admin</SelectItem>
//                                         <SelectItem value="Teacher">Teacher</SelectItem>
//                                         <SelectItem value="Student">Student</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Status</Label>
//                                 <Select
//                                     value={formData.status}
//                                     onValueChange={(value) => handleSelectChange("status", value)}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select status" />
//                                     </SelectTrigger>

//                                     <SelectContent>
//                                         <SelectItem value="Active">Active</SelectItem>
//                                         <SelectItem value="Inactive">Inactive</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Created At</Label>
//                                 <Input
//                                     name="createdAt"
//                                     type="date"
//                                     value={formData.createdAt}
//                                     onChange={handleInputChange}
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div className="sms-card-soft p-4 text-sm text-[var(--sms-muted)]">
//                             Password handling will be connected later with the backend using
//                             bcrypt. In this UI step, we only design the account management
//                             interface.
//                         </div>

//                         <DialogFooter>
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => setIsDialogOpen(false)}
//                             >
//                                 Cancel
//                             </Button>

//                             <Button
//                                 type="submit"
//                                 className="sms-btn-primary"
//                             >
//                                 {editingUser ? "Save Changes" : "Save User"}
//                             </Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default ManageUsers;




import { useEffect, useMemo, useState } from "react";
import { exportVisibleTableToCsv } from "@/lib/exportCsv";
import {
    Edit,
    KeyRound,
    Plus,
    RefreshCcw,
    Search,
    Shield,
    Trash2,
} from "lucide-react";

import {
    createUser,
    deleteUser,
    getUsers,
    resetUserPassword,
    updateUser,
} from "@/services/userService";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const emptyForm = {
    username: "",
    password: "",
    role: "Admin",
    status: "Active",
};

function getStatusBadgeClass(status) {
    if (status === "Active") return "sms-badge-active";
    return "sms-badge-inactive";
}

function getRoleBadgeClass(role) {
    if (role === "Admin") return "sms-badge-info";
    if (role === "Teacher") return "sms-badge-active";
    if (role === "Student") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadInitialUsers() {
            try {
                const response = await getUsers();

                if (!ignore) {
                    setUsers(response.data || []);
                    setErrorMessage("");
                }
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load users.";

                if (!ignore) {
                    setErrorMessage(message);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadInitialUsers();

        return () => {
            ignore = true;
        };
    }, []);

    async function loadUsers() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await getUsers();

            setUsers(response.data || []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load users.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return users.filter((user) => {
            return (
                String(user.id).includes(keyword) ||
                user.username?.toLowerCase().includes(keyword) ||
                user.role?.toLowerCase().includes(keyword) ||
                user.status?.toLowerCase().includes(keyword) ||
                user.linkedName?.toLowerCase().includes(keyword) ||
                user.linkedCode?.toLowerCase().includes(keyword)
            );
        });
    }, [users, searchTerm]);

    function openAddDialog() {
        setEditingUser(null);
        setFormData(emptyForm);
        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function openEditDialog(user) {
        setEditingUser(user);

        setFormData({
            username: user.username || "",
            password: "",
            role: user.role || "Admin",
            status: user.status || "Active",
        });

        setErrorMessage("");
        setIsDialogOpen(true);
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSelectChange(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setIsSaving(true);
            setErrorMessage("");

            if (editingUser) {
                await updateUser(editingUser.id, {
                    username: formData.username,
                    status: formData.status,
                });
            } else {
                await createUser(formData);
            }

            setIsDialogOpen(false);
            setEditingUser(null);
            setFormData(emptyForm);

            await loadUsers();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save user.";

            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleResetPassword(user) {
        const newPassword = window.prompt(
            `Enter new password for ${user.username}:`
        );

        if (!newPassword) return;

        if (newPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        try {
            setErrorMessage("");

            await resetUserPassword(user.id, newPassword);

            alert(`Password reset successfully for ${user.username}.`);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to reset password.";

            setErrorMessage(message);
        }
    }

    async function handleDelete(user) {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete user "${user.username}"?`
        );

        if (!isConfirmed) return;

        try {
            setErrorMessage("");

            await deleteUser(user.id);
            await loadUsers();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete user.";

            setErrorMessage(message);
        }
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Administrator
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        User Management
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Manage login accounts, account status, and password reset.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>

                    <Button onClick={openAddDialog} className="sms-btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Admin User
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("users.csv")}>
                        Export Excel
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">
                    {errorMessage}
                </div>
            )}

            <section className="sms-card rounded-md">
                <div className="sms-section-header flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="flex items-center gap-2 font-semibold text-[var(--sms-ink)]">
                            <Shield className="h-5 w-5 text-[var(--sms-gold)]" />
                            Login Accounts
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {isLoading
                                ? "Loading users..."
                                : `${filteredUsers.length} record(s) found`}
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                        <Input
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Linked Profile</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan="7"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-mono text-xs">
                                            #{user.id}
                                        </TableCell>

                                        <TableCell className="font-medium text-[var(--sms-ink)]">
                                            {user.username}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getRoleBadgeClass(user.role)}
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <span>{user.linkedName}</span>

                                            <p className="text-xs font-mono text-[var(--sms-muted)]">
                                                {user.linkedCode}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(user.status)}
                                            >
                                                {user.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-sm text-[var(--sms-muted)]">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : "—"}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleResetPassword(user)}
                                                >
                                                    <KeyRound className="h-4 w-4 text-[var(--sms-info)]" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-[var(--sms-danger)]" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="7"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? "Edit User" : "Add Admin User"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errorMessage && (
                            <div className="rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-3 text-sm text-[var(--sms-danger)]">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="admin2"
                                    required
                                />
                            </div>

                            {!editingUser && (
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Admin@123"
                                        type="password"
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Role</Label>

                                <Select
                                    value={formData.role}
                                    disabled={Boolean(editingUser)}
                                    onValueChange={(value) => handleSelectChange("role", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>

                                <p className="text-xs text-[var(--sms-muted)]">
                                    Student and teacher accounts are created from Student
                                    Management and Teacher Management.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>

                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="sms-btn-primary"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : editingUser
                                        ? "Save Changes"
                                        : "Save User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ManageUsers;
