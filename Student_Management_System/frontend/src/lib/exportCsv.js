function escapeCsvValue(value) {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
}

export function exportToCsv(filename, rows, columns) {
    if (!Array.isArray(rows) || rows.length === 0) {
        window.alert("There is no visible data to export.");
        return false;
    }

    const csvRows = [
        columns.map((column) => escapeCsvValue(column.header)).join(","),
        ...rows.map((row) =>
            columns
                .map((column) => {
                    const value = column.value ? column.value(row) : row[column.key];
                    return escapeCsvValue(value);
                })
                .join(",")
        ),
    ];

    const blob = new Blob(["\uFEFF", csvRows.join("\r\n")], {
        type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return true;
}

export function exportVisibleTableToCsv(filename) {
    const table = [...document.querySelectorAll("main table")].find(
        (candidate) => candidate.offsetParent !== null
    );

    if (!table) {
        window.alert("There is no visible table to export.");
        return false;
    }

    const headers = [...table.querySelectorAll("thead th")].map((cell) =>
        cell.textContent.trim()
    );
    const includedIndexes = headers
        .map((header, index) => ({ header, index }))
        .filter(({ header }) => header && header.toLowerCase() !== "action");
    const rows = [...table.querySelectorAll("tbody tr")]
        .map((row) => [...row.querySelectorAll("td")].map((cell) => cell.textContent.trim()))
        .filter((cells) => cells.length > 1);

    return exportToCsv(
        filename,
        rows,
        includedIndexes.map(({ header, index }) => ({
            header,
            value: (row) => row[index],
        }))
    );
}

export function exportRecordToCsv(filename, record) {
    const entries = Object.entries(record).filter(
        ([key]) => !["id", "actions"].includes(key)
    );

    return exportToCsv(
        filename,
        [record],
        entries.map(([key]) => ({
            header: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase()),
            key,
        }))
    );
}
