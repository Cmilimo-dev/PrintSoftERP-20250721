import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (elementId: string, fileName: string) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  try {
    // Use html2canvas to render the HTML element to a canvas
    const canvas = await html2canvas(input, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16 // or 'smart'
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const imgWidth = pdfWidth;
    const imgHeight = imgWidth / ratio;

    let position = 0;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save the PDF
    pdf.save(`${fileName}.pdf`);

  } catch (error) {
    console.error("Error exporting to PDF:", error);
  }
};

export const exportToMht = async (elementId: string, fileName: string) => {
  const content = document.getElementById(elementId);
  if (!content) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }
  
  const htmlContent = content.innerHTML;
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        console.warn("Could not read CSS rules from stylesheet:", e);
        return '';
      }
    })
    .join('\n');

  const mhtml = `
MIME-Version: 1.0
Content-Type: multipart/related; boundary="----mht-boundary----"

------mht-boundary----
Content-Type: text/html;
Content-Location: file:///C:/fake/path.html

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${styles}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>

------mht-boundary------
`;

  const blob = new Blob([mhtml], { type: 'message/rfc822' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.mht`;
  a.click();
  URL.revokeObjectURL(url);
};

