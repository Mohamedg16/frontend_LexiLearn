import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Reusable utility to export data to PDF using jsPDF and jsPDF-AutoTable.
 * 
 * @param {Object} options - Export options
 * @param {string} options.title - Header title for the PDF
 * @param {string[]} options.headers - Array of column headers
 * @param {Array[]} options.data - 2D array of data rows
 * @param {string} options.fileName - Output file name
 * @param {number} [options.statusColumnIndex] - Index of the status column to highlight red if 'UNPAID'
 */
export const exportToPDF = ({ title, headers, data, fileName, statusColumnIndex = -1 }) => {
    const doc = new jsPDF();

    // AdminX Branding
    doc.setFontSize(24);
    doc.setTextColor(239, 68, 68); // text-red-500
    doc.setFont('helvetica', 'bold');
    doc.text('AdminX', 14, 20);

    // Page Title
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55); // text-gray-800
    doc.text(title, 14, 30);

    // Metadata/Date
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // text-gray-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    // Divider
    doc.setDrawColor(229, 231, 235); // border-gray-200
    doc.line(14, 42, 196, 42);

    doc.autoTable({
        head: [headers],
        body: data,
        startY: 48,
        theme: 'grid',
        headStyles: {
            fillColor: [17, 24, 39], // text-gray-900 / dark theme header
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 5
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [55, 65, 81], // text-gray-700
            cellPadding: 5
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251], // bg-gray-50
        },
        didParseCell: (data) => {
            if (data.section === 'body' && statusColumnIndex !== -1 && data.column.index === statusColumnIndex) {
                const status = data.cell.raw ? data.cell.raw.toString().toUpperCase() : '';
                if (status === 'UNPAID' || status === 'DUES UNPAID' || status === 'PENDING' || status === 'OFFLINE' || status === 'INACTIVE') {
                    data.cell.styles.textColor = [220, 38, 38]; // text-red-600
                    data.cell.styles.fontStyle = 'bold';
                } else if (status === 'PAID' || status === 'AUTHENTICATED' || status === 'ACTIVE' || status === 'ONLINE') {
                    data.cell.styles.textColor = [16, 185, 129]; // text-emerald-500
                }
            }
        },
        margin: { top: 48 },
    });

    // Footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(fileName);
};
