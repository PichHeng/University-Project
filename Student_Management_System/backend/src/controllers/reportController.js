import db from "../config/db.js";

export async function getReportLogs(req, res) {
    try {
        const params = [];
        let scope = "";
        if (req.user.role !== "admin") { scope = "WHERE r.generated_by = ?"; params.push(req.user.user_id); }
        const [rows] = await db.query(
            `SELECT r.report_id AS reportId, r.report_type AS reportType,
                    r.file_format AS fileFormat, r.file_name AS fileName,
                    r.generated_at AS generatedAt, u.username AS generatedBy
             FROM report_logs r
             LEFT JOIN users u ON u.user_id = r.generated_by
             ${scope}
             ORDER BY r.generated_at DESC`, params
        );
        return res.json({ success: true, message: "Report history loaded successfully", data: rows });
    } catch (error) {
        console.error("Get report logs error:", error);
        return res.status(500).json({ success: false, message: "Failed to load report history" });
    }
}

export async function createReportLog(req, res) {
    const { reportType, fileFormat, fileName = null } = req.body;
    if (!reportType?.trim() || !["pdf", "excel"].includes(fileFormat)) {
        return res.status(400).json({ success: false, message: "Report type and valid file format are required." });
    }
    try {
        const [result] = await db.query(
            `INSERT INTO report_logs (generated_by, report_type, file_format, file_name)
             VALUES (?, ?, ?, ?)`,
            [req.user.user_id, reportType.trim(), fileFormat, fileName]
        );
        return res.status(201).json({ success: true, message: "Report logged successfully", data: { reportId: result.insertId } });
    } catch (error) {
        console.error("Create report log error:", error);
        return res.status(500).json({ success: false, message: "Failed to log report" });
    }
}
