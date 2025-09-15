import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Dynamic PDF Generator Utility
 * Provides flexible and reusable PDF generation functionality
 */
class PDFGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.pageHeight = 280; // A4 page height minus margins
    this.margin = 20;
  }

  /**
   * Initialize a new PDF document
   * @param {string} orientation - 'portrait' or 'landscape'
   * @param {string} unit - 'mm', 'pt', 'in'
   * @param {string} format - 'a4', 'letter', etc.
   */
  init(orientation = "portrait", unit = "mm", format = "a4") {
    this.doc = new jsPDF(orientation, unit, format);
    this.currentY = 20;
    return this;
  }

  /**
   * Add a header with company branding
   * @param {Object} options - Header configuration
   */
  addHeader(options = {}) {
    const {
      title = "DHA Water Services Report",
      subtitle = "Defence Housing Authority Services – Karachi",
      address = "174/B, QASIM STREET-1, KHAYABAN-E-SHUJAAT, PHASE-VIII, KARACHI",
      phone = "Phone: 111-111-895 / 35250061",
      email = "Email: info@dhaservices.com",
      showLogo = false,
      logoPath = null,
    } = options;

    // Main title
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.doc.internal.pageSize.width / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 15;

    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      subtitle,
      this.doc.internal.pageSize.width / 2,
      this.currentY,
      { align: "center" }
    );
    this.currentY += 10;

    // Address
    this.doc.setFontSize(10);
    this.doc.text(
      address,
      this.doc.internal.pageSize.width / 2,
      this.currentY,
      { align: "center" }
    );
    this.currentY += 8;

    // Contact info
    this.doc.text(phone, this.doc.internal.pageSize.width / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 6;
    this.doc.text(email, this.doc.internal.pageSize.width / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 15;

    // Add a line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.currentY,
      this.doc.internal.pageSize.width - this.margin,
      this.currentY
    );
    this.currentY += 10;

    return this;
  }

  /**
   * Add a section title
   * @param {string} title - Section title
   * @param {number} fontSize - Font size (default: 14)
   */
  addSectionTitle(title, fontSize = 14) {
    this.checkPageBreak(20);
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 12;
    return this;
  }

  /**
   * Add key-value pairs in a formatted layout
   * @param {Array} data - Array of {key, value} objects
   * @param {Object} options - Formatting options
   */
  addKeyValueSection(data, options = {}) {
    const { columns = 2, keyWidth = 50, fontSize = 10, spacing = 10 } = options;

    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", "normal");

    const itemsPerRow = columns;
    const columnWidth =
      (this.doc.internal.pageSize.width - 2 * this.margin) / itemsPerRow;

    for (let i = 0; i < data.length; i += itemsPerRow) {
      this.checkPageBreak(15);

      for (let j = 0; j < itemsPerRow && i + j < data.length; j++) {
        const item = data[i + j];
        const x = this.margin + j * columnWidth;
        
        // Calculate available width for value text
        const valueX = x + keyWidth;
        const availableWidth = columnWidth - keyWidth - 5; // 5mm padding

        // Key (bold)
        this.doc.setFont("helvetica", "bold");
        this.doc.text(`${item.key}:`, x, this.currentY);

        // Value (normal) - with text wrapping if needed
        this.doc.setFont("helvetica", "normal");
        const valueText = String(item.value || "N/A");
        
        // Split long text if it exceeds available width
        const textWidth = this.doc.getTextWidth(valueText);
        if (textWidth > availableWidth) {
          const lines = this.doc.splitTextToSize(valueText, availableWidth);
          this.doc.text(lines, valueX, this.currentY);
        } else {
          this.doc.text(valueText, valueX, this.currentY);
        }
      }

      this.currentY += spacing;
    }

    this.currentY += 5;
    return this;
  }

  /**
   * Add a dynamic table with customizable styling
   * @param {Object} tableConfig - Table configuration
   */
  addTable(tableConfig) {
    const {
      headers,
      data,
      title = null,
      theme = "grid",
      headerStyles = {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles = { fontSize: 9 },
      columnStyles = {},
      showFooter = false,
      footerData = null,
      alternateRowColors = true,
    } = tableConfig;

    this.checkPageBreak(40);

    if (title) {
      this.addSectionTitle(title, 12);
    }

    const tableOptions = {
      startY: this.currentY,
      head: [headers],
      body: data,
      theme,
      headStyles: headerStyles,
      bodyStyles: bodyStyles,
      columnStyles,
      margin: { left: this.margin, right: this.margin },
      didDrawPage: (data) => {
        this.currentY = data.cursor.y;
      },
    };

    if (alternateRowColors) {
      tableOptions.alternateRowStyles = { fillColor: [245, 245, 245] };
    }

    autoTable(this.doc, tableOptions);
    this.currentY = this.doc.lastAutoTable.finalY + 10;

    // Add footer row if specified
    if (showFooter && footerData) {
      autoTable(this.doc, {
        startY: this.currentY - 10,
        body: [footerData],
        theme: "plain",
        styles: { fontStyle: "bold", fillColor: [230, 230, 230] },
        margin: { left: this.margin, right: this.margin },
      });
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    return this;
  }

  /**
   * Add summary statistics in a card layout
   * @param {Array} stats - Array of {label, value, color} objects
   */
  addSummaryCards(stats) {
    this.checkPageBreak(30);

    const cardsPerRow = 3;
    const cardWidth =
      (this.doc.internal.pageSize.width - 2 * this.margin - 20) / cardsPerRow;
    const cardHeight = 25;

    for (let i = 0; i < stats.length; i += cardsPerRow) {
      this.checkPageBreak(cardHeight + 10);

      for (let j = 0; j < cardsPerRow && i + j < stats.length; j++) {
        const stat = stats[i + j];
        const x = this.margin + j * (cardWidth + 10);

        // Draw card background
        const color = stat.color || [240, 240, 240];
        if (Array.isArray(color)) {
          this.doc.setFillColor(color[0], color[1], color[2]);
        } else {
          this.doc.setFillColor(color);
        }
        this.doc.rect(x, this.currentY, cardWidth, cardHeight, "F");

        // Draw border
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(x, this.currentY, cardWidth, cardHeight);

        // Add text
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(stat.label, x + 5, this.currentY + 8);

        this.doc.setFontSize(14);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(String(stat.value), x + 5, this.currentY + 18);
      }

      this.currentY += cardHeight + 15;
    }

    return this;
  }

  /**
   * Add a footer with generation timestamp and page numbers
   * @param {Object} options - Footer options
   */
  addFooter(options = {}) {
    const {
      showTimestamp = true,
      showPageNumbers = true,
      customText = null,
      fontSize = 8,
    } = options;

    const pageCount = this.doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(fontSize);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(100, 100, 100);

      const footerY = this.doc.internal.pageSize.height - 15;

      if (showTimestamp) {
        const timestamp = `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
        this.doc.text(timestamp, this.margin, footerY);
      }

      if (showPageNumbers) {
        const pageText = `Page ${i} of ${pageCount}`;
        this.doc.text(
          pageText,
          this.doc.internal.pageSize.width - this.margin,
          footerY,
          { align: "right" }
        );
      }

      if (customText) {
        this.doc.text(
          customText,
          this.doc.internal.pageSize.width / 2,
          footerY,
          { align: "center" }
        );
      }
    }

    return this;
  }

  /**
   * Check if we need a page break and add one if necessary
   * @param {number} requiredSpace - Space needed for next content
   */
  checkPageBreak(requiredSpace = 20) {
    if (this.currentY + requiredSpace > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  /**
   * Add custom text with formatting
   * @param {string} text - Text to add
   * @param {Object} options - Text formatting options
   */
  addText(text, options = {}) {
    const {
      fontSize = 10,
      fontStyle = "normal",
      align = "left",
      color = [0, 0, 0],
      x = this.margin,
      spacing = 8,
    } = options;

    this.checkPageBreak(15);

    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", fontStyle);
    this.doc.setTextColor(...color);

    if (align === "center") {
      this.doc.text(text, this.doc.internal.pageSize.width / 2, this.currentY, {
        align: "center",
      });
    } else if (align === "right") {
      this.doc.text(
        text,
        this.doc.internal.pageSize.width - this.margin,
        this.currentY,
        { align: "right" }
      );
    } else {
      this.doc.text(text, x, this.currentY);
    }

    this.currentY += spacing;
    return this;
  }



  /**
   * Add signature blocks for document approval
   * @param {Array} signatures - Array of signature objects
   * @param {Object} options - Formatting options
   */
  addSignatureBlocks(signatures, options = {}) {
    const {
      columns = 2,
      marginTop = 20,
      blockHeight = 30,
      blockWidth = 80,
    } = options;

    this.currentY += marginTop;

    const pageWidth = this.doc.internal.pageSize.width;
    const totalWidth = columns * blockWidth;
    const spacing = (pageWidth - totalWidth - 40) / (columns - 1);

    signatures.forEach((signature, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x = 20 + col * (blockWidth + spacing);
      const y = this.currentY + row * (blockHeight + 10);

      // Title
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(signature.title, x, y);

      // Signature line
      this.doc.line(x, y + 15, x + blockWidth - 10, y + 15);

      // Name (if provided)
      if (signature.name && signature.name !== "_____________") {
        this.doc.setFontSize(9);
        this.doc.text(signature.name, x, y + 25);
      }
    });

    const rows = Math.ceil(signatures.length / columns);
    this.currentY += rows * (blockHeight + 10);

    return this;
  }

  /**
   * Save the PDF with a given filename
   * @param {string} filename - Name of the file to save
   */
  save(filename) {
    if (!this.doc) {
      throw new Error("PDF document not initialized. Call init() first.");
    }
    this.doc.save(filename);
    return this;
  }

  /**
   * Get the PDF as a blob for further processing
   * @returns {Blob} PDF blob
   */
  getBlob() {
    if (!this.doc) {
      throw new Error("PDF document not initialized. Call init() first.");
    }
    return this.doc.output("blob");
  }

  /**
   * Get the PDF as a data URL
   * @returns {string} PDF data URL
   */
  getDataURL() {
    if (!this.doc) {
      throw new Error("PDF document not initialized. Call init() first.");
    }
    return this.doc.output("dataurlstring");
  }
}

// Export a factory function for creating new PDF generators
export const createPDFGenerator = () => new PDFGenerator();

// Export some common PDF templates
export const PDFTemplates = {
  /**
   * Generate a delivery report PDF
   * @param {Object} data - Report data
   * @param {Object} options - Template options
   */
  deliveryReport: (data, options = {}) => {
    const pdf = createPDFGenerator().init();

    // Header
    pdf.addHeader({
      title: data.title || "Delivery Report",
      ...options.header,
    });

    // Summary stats
    if (data.summary) {
      pdf.addSummaryCards(data.summary);
    }

    // Key information
    if (data.keyInfo) {
      pdf.addKeyValueSection(data.keyInfo, { columns: 2 });
    }

    // Main data table
    if (data.tableData) {
      pdf.addTable({
        title: data.tableTitle || "Delivery Details",
        headers: data.headers,
        data: data.tableData,
        ...options.table,
      });
    }

    // Additional tables
    if (data.additionalTables) {
      data.additionalTables.forEach((table) => {
        pdf.addTable(table);
      });
    }

    // Footer
    pdf.addFooter(options.footer);

    return pdf;
  },

  /**
   * Generate a summary report PDF
   * @param {Object} data - Report data
   * @param {Object} options - Template options
   */
  summaryReport: (data, options = {}) => {
    const pdf = createPDFGenerator().init();

    pdf.addHeader({
      title: data.title || "Summary Report",
      ...options.header,
    });

    // Key metrics
    if (data.metrics) {
      pdf.addSectionTitle("Key Metrics");
      pdf.addSummaryCards(data.metrics);
    }

    // Breakdown sections
    if (data.breakdowns) {
      data.breakdowns.forEach((breakdown) => {
        pdf.addSectionTitle(breakdown.title);
        if (breakdown.type === "table") {
          pdf.addTable(breakdown.data);
        } else if (breakdown.type === "keyValue") {
          pdf.addKeyValueSection(breakdown.data);
        }
      });
    }

    pdf.addFooter(options.footer);

    return pdf;
  },
};

export default PDFGenerator;
