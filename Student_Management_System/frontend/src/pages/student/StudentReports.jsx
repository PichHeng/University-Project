import { useMemo, useState } from "react";
import { exportRecordToCsv, exportVisibleTableToCsv } from "@/lib/exportCsv";
import {
    Download,
    FileSpreadsheet,
    FileText,
    Search,
} from "lucide-react";

import { studentReportsData, studentReportStats } from "@/data/mockData";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function getFormatBadgeClass(format) {
    return format === "PDF" ? "sms-badge-inactive" : "sms-badge-active";
}

function getStatusBadgeClass(status) {
    if (status === "Ready") return "sms-badge-active";
    if (status === "Processing") return "sms-badge-warning";
    return "sms-badge-inactive";
}

function StudentReports() {
    const [reports] = useState(studentReportsData);
    const [searchTerm, setSearchTerm] = useState("");

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

    function handleDownload(report) {
        if (report.status !== "Ready") {
            window.alert("This report is still processing.");
            return;
        }

        if (report.format === "PDF") {
            window.print();
            return;
        }

        exportRecordToCsv(`${report.reportCode}.csv`, report);
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        Student
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        My Academic Reports
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        View and download your academic reports, attendance summaries,
                        enrolled course reports, grade reports, and transcripts.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>

                    <Button type="button" variant="outline" onClick={() => exportVisibleTableToCsv("student-reports.csv")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
                {studentReportStats.map((item) => (
                    <div key={item.label} className="sms-card rounded-md p-5">
                        <FileText className="mb-3 h-5 w-5 text-[var(--sms-gold)]" />

                        <p className="text-3xl font-bold text-[var(--sms-ink)]">
                            {item.value}
                        </p>

                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                            {item.label}
                        </p>
                    </div>
                ))}
            </section>

            <section className="sms-card mb-8 rounded-md p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h2 className="font-semibold text-[var(--sms-ink)]">
                            Report Center
                        </h2>

                        <p className="mt-1 text-sm text-[var(--sms-muted)]">
                            {filteredReports.length} report(s) found.
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--sms-muted)]" />

                        <Input
                            placeholder="Search report..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </section>

            <section className="sms-card rounded-md">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Academic Report Records
                    </h2>

                    <p className="text-sm text-[var(--sms-muted)]">
                        Download available academic reports.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report ID</TableHead>
                                <TableHead>Report Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead>Generated Date</TableHead>
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
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDownload(report)}
                                                >
                                                    <Download className="h-4 w-4" />
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
                                        No reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </>
    );
}

export default StudentReports;
