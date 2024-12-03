interface ReportTemplateColumns {
    [key: string]: { key: string; header: string }[];
}

export const reportTemplateColumns: ReportTemplateColumns = {
    'checkSummary': [
        { key: 'storeName', header: 'Marketplace' },
        { key: 'checkNumber', header: 'Check Number' },
        { key: 'checkDate', header: 'Check Date' },
        { key: 'checkPaid', header: 'Check Paid' },
        { key: 'deductions', header: 'Deductions' },
    ],
    'deductions': [
        { key: 'storeName', header: 'Marketplace' },
        { key: 'invoiceNumber', header: 'Invoice Number' },
        { key: 'poNumber', header: 'PO Number' },
        { key: 'comments', header: 'Comments' },
        { key: 'checkDate', header: 'Check Date' },
        { key: 'checkNumber', header: 'Check Number' },
        { key: 'deductions', header: 'Deductions' },
        { key: 'status', header: 'Status' },
    ],
    'invoices': [
        { key: 'storeName', header: 'Marketplace' },
        { key: 'invoiceNumber', header: 'Invoice Number' },
        { key: 'orderNumber', header: 'Order Number' },
        { key: 'poNumber', header: 'PO Number' },
        { key: 'invoiceDate', header: 'Invoice Date' },
        { key: 'invoiceTotal', header: 'Invoice Total' },
        { key: 'dueDate', header: 'Due Date' },
        { key: 'checkDate', header: 'Check Date' },
        { key: 'checkNumber', header: 'Check Number' },
        { key: 'totalPaid', header: 'Total Paid' },
        { key: 'pending', header: 'Pending' },
        { key: 'commerceHubStatus', header: 'Status' },
        { key: 'commerceHubComment', header: 'Note' },
    ]
}