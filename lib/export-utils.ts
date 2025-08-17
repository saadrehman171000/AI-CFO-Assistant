// Export utilities for financial reports
export interface ExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'xlsx' | 'csv';
}

export const exportToPDF = async (tableData: any[], options: ExportOptions = {}) => {
  try {
    console.log('Starting PDF export with data:', tableData);
    
    // Dynamic import of jsPDF to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    console.log('jsPDF imported successfully');
    
    const autoTable = (await import('jspdf-autotable')).default;
    console.log('autoTable imported successfully:', typeof autoTable);
    
    const doc = new jsPDF(options.orientation || 'portrait');
    console.log('PDF document created');
    
    // Add title
    if (options.title) {
      doc.setFontSize(20);
      doc.text(options.title, 20, 20);
    }
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Prepare table data - filter out empty section headers
    const cleanData = tableData.filter(row => {
      if (row.isTotal && row.amount === 0) return false; // Skip empty section headers
      return true;
    });
    
    console.log('Clean data for PDF:', cleanData);
    
    const tableHeaders = ['Account', 'Amount ($)'];
    const tableRows = cleanData.map(row => [
      row.account,
      row.amount === 0 && row.isTotal ? '' : `$${Math.abs(row.amount).toLocaleString()}`
    ]);
    
    console.log('Table rows for PDF:', tableRows);
    
    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });
    
    console.log('Table added to PDF');
    
    // Save the PDF
    const filename = options.filename || `financial-report-${Date.now()}.pdf`;
    doc.save(filename);
    
    console.log('PDF saved successfully:', filename);
    return { success: true, filename };
  } catch (error) {
    console.error('PDF export failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      tableData,
      options
    });
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportToExcel = async (tableData: any[], options: ExportOptions = {}) => {
  try {
    console.log('Starting Excel export with data:', tableData);
    
    // Dynamic import of xlsx to avoid SSR issues
    const XLSX = await import('xlsx');
    console.log('XLSX imported successfully');
    
    // Filter out empty section headers and prepare clean data
    const cleanData = tableData.filter(row => {
      if (row.isTotal && row.amount === 0) return false; // Skip empty section headers
      return true;
    });
    
    console.log('Clean data for Excel:', cleanData);
    
    // Prepare worksheet data with proper structure
    const worksheetData = [
      ['Account', 'Amount ($)'], // Header row
      ...cleanData.map(row => [
        row.account,
        row.amount === 0 && row.isTotal ? '' : row.amount
      ])
    ];
    
    console.log('Worksheet data for Excel:', worksheetData);
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 30 }, // Account column width
      { wch: 15 }  // Amount column width
    ];
    worksheet['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Report');
    
    // Generate filename with proper extension
    const filename = options.filename || `financial-report-${Date.now()}.xlsx`;
    
    console.log('Saving Excel file:', filename);
    
    // Save the file
    XLSX.writeFile(workbook, filename);
    
    console.log('Excel file saved successfully:', filename);
    return { success: true, filename };
  } catch (error) {
    console.error('Excel export failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      tableData,
      options
    });
    throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportToCSV = async (tableData: any[], options: ExportOptions = {}) => {
  try {
    // Filter out empty section headers and prepare clean data
    const cleanData = tableData.filter(row => {
      if (row.isTotal && row.amount === 0) return false; // Skip empty section headers
      return true;
    });
    
    // Prepare CSV data
    const csvHeaders = ['Account', 'Amount ($)'];
    const csvRows = cleanData.map(row => [
      row.account,
      row.amount === 0 && row.isTotal ? '' : row.amount
    ]);
    
    // Convert to CSV format
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${options.filename || `financial-report-${Date.now()}`}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return { success: true, filename: `${options.filename || `financial-report-${Date.now()}`}.csv` };
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export CSV');
  }
};

// Helper function to format data for export
export const prepareDataForExport = (tableData: any[], activeTab: number, tabName: string) => {
  return {
    tableData,
    options: {
      filename: `${tabName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: `${tabName} - Financial Report`,
      orientation: 'landscape' as const,
    }
  };
};
