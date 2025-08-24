// Export utilities for financial reports
export interface ExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'xlsx' | 'csv';
}

// Helper function to load image as base64
const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to load logo image:', error);
    return '';
  }
};

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
    
    // Load and add logo
    try {
      const logoBase64 = await loadImageAsBase64('/ai_cfo_logo.png');
      if (logoBase64) {
        // Add logo at top right corner
        const logoWidth = 50;
        const logoHeight = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(logoBase64, 'PNG', pageWidth - logoWidth - 20, 10, logoWidth, logoHeight);
        console.log('Logo added successfully');
      }
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
    }

    // Add title
    if (options.title) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(options.title, 20, 25);
    }
    
    // Add subtitle/company name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('AI CFO Assistant - Intelligent Financial Analysis', 20, 35);

    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 45);

    // Reset text color for table
    doc.setTextColor(0);
    
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
    
    // Calculate footer height to ensure table doesn't overlap
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerHeight = 30; // Reserve space for footer (25px + 5px margin)
    const tableEndY = pageHeight - footerHeight;

    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 55,
      margin: { bottom: footerHeight },
      pageBreak: 'auto',
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
      didDrawPage: (data) => {
        // Add footer to each page
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Save current text settings
        const currentFontSize = doc.getFontSize();
        const currentTextColor = doc.getTextColor();
        const currentFont = doc.getFont();

        // Footer line
        doc.setDrawColor(200);
        doc.setLineWidth(0.5);
        doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');

        // Left side - Company info
        doc.text('AI CFO Assistant | Powered by Advanced Financial Analytics', 20, pageHeight - 18);
        doc.text('This report is generated automatically using AI-powered analysis', 20, pageHeight - 12);

        // Right side - Page number
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 40,
          pageHeight - 15,
          { align: 'right' }
        );

        // Disclaimer
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(
          'This report is for informational purposes only. Please consult with a qualified financial advisor for investment decisions.',
          20,
          pageHeight - 6
        );

        // Restore original text settings for table content
        doc.setFontSize(currentFontSize);
        doc.setTextColor(currentTextColor);
        doc.setFont(currentFont.fontName, currentFont.fontStyle);
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
