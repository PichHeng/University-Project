import { useMemo, useState } from "react";
import {
    Download,
    FileSpreadsheet,
    FileText,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import { reportsData, reportStats } from "@/data/mockData";

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
    reportTitle: "",
    reportType: "Students",
    format: "PDF",
};

function AdminReports() {
    const [reports, setReports] = useState(reportsData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const filteredReports = useMemo(() => {
        const keyword = searchTerm.toLowerCase();

        return reports.filter((report) => {
            return (
                report.reportCode.toLowerCase().includes(keyword) ||
                report.reportTitle.toLowerCase().includes(keyword) ||
                report.reportType.toLowerCase().includes(keyword) ||
                report.format.toLowerCase().includes(keyword) ||
                report.status.toLowerCase().includes(keyword)
            );
        });
    }, [reports, searchTerm]);

    function openGenerateDialog() {
        setFormData(emptyForm);
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

    function handleGenerateReport(event) {
        event.preventDefault();

        const newReport = {
            id: Date.now(),
            reportCode: `RPT-${1000 + reports.length + 1}`,
            reportTitle: formData.reportTitle,
            reportType: formData.reportType,
            generatedBy: "Admin User",
            format: formData.format,
            generatedAt: new Date().toISOString().split("T")[0],
            status: "Ready",
        };

        setReports((prev) => [newReport, ...prev]);
        setIsDialogOpen(false);
        setFormData(emptyForm);
    }

    function handleDelete(reportId) {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this report?"
        );

        if (!isConfirmed) return;

        setReports((prev) => prev.filter((report) => report.id !== reportId));
    }

    function getFormatBadgeClass(format) {
        return format === "PDF"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-green-200 bg-green-50 text-green-700";
    }

    function getStatusBadgeClass(status) {
        return status === "Ready"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-amber-200 bg-amber-50 text-amber-700";
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Administrator
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        Academic Reports
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        Generate, view, and download academic reports in PDF or Excel format.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={openGenerateDialog}
                        className="bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>

                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button variant="outline">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
                {reportStats.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-md border border-[var(--sms-line)] bg-white p-5 shadow-sm"
                    >
                        <p className="text-3xl font-bold text-[var(--sms-ink)]">
                            {item.value}
                        </p>

                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                            {item.label}
                        </p>
                    </div>
                ))}
            </section>

            <section className="rounded-md border border-[var(--sms-line)] bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--sms-line)] bg-[var(--sms-paper-soft)] px-5 py-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Generated Reports
                        </h2>

                        <p className="text-sm text-[var(--sms-muted)]">
                            {filteredReports.length} report(s) found
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                        <Input
                            placeholder="Search report..."
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
                                <TableHead>Report ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead>Generated By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-mono text-xs">
                                            {report.reportCode}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {report.reportTitle}
                                        </TableCell>

                                        <TableCell>{report.reportType}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getFormatBadgeClass(report.format)}
                                            >
                                                {report.format}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>{report.generatedBy}</TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {report.generatedAt}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(report.status)}
                                            >
                                                {report.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon">
                                                    <Download className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(report.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="8"
                                        className="py-12 text-center text-[var(--sms-muted)]"
                                    >
                                        No reports found.
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
                        <DialogTitle>Generate Academic Report</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleGenerateReport} className="space-y-5">
                        <div className="space-y-2">
                            <Label>Report Title</Label>
                            <Input
                                name="reportTitle"
                                value={formData.reportTitle}
                                onChange={handleInputChange}
                                placeholder="Student List Report"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select
                                value={formData.reportType}
                                onValueChange={(value) =>
                                    handleSelectChange("reportType", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="Students">Students</SelectItem>
                                    <SelectItem value="Teachers">Teachers</SelectItem>
                                    <SelectItem value="Departments">Departments</SelectItem>
                                    <SelectItem value="Courses">Courses</SelectItem>
                                    <SelectItem value="Enrollments">Enrollments</SelectItem>
                                    <SelectItem value="Attendance">Attendance</SelectItem>
                                    <SelectItem value="Grades">Grades</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>File Format</Label>
                            <Select
                                value={formData.format}
                                onValueChange={(value) => handleSelectChange("format", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="Excel">Excel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-paper)] p-4 text-sm text-[var(--sms-muted)]">
                            This is the frontend UI only. Later, the Generate button will call
                            the backend report API to create real PDF and Excel files.
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
                                className="bg-[var(--sms-ink)] hover:bg-[var(--sms-ink-soft)]"
                            >
                                Generate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AdminReports;