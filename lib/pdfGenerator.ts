import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfData {
  user: any;
  eligibleSchemes: any[];
}

export const generatePDF = ({ user, eligibleSchemes }: PdfData) => {
  const doc = new jsPDF();

  // 1. Header (Blue Background)
  doc.setFillColor(41, 98, 255); // Blue color
  doc.rect(0, 0, 220, 40, "F");
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Sahayak Eligibility Report", 14, 20);
  
  doc.setFontSize(10);
  doc.text("Generated via Sahayak Portal | Valid for Preliminary Verification", 14, 30);

  // 2. User Profile Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("User Profile", 14, 50);
  
  doc.setFontSize(10);
  doc.text(`Age: ${user.age} Years`, 14, 60);
  doc.text(`Gender: ${user.gender}`, 14, 66);
  doc.text(`Category: ${user.caste}`, 14, 72);
  doc.text(`Occupation: ${user.occupation}`, 100, 60);
  doc.text(`State: ${user.state}`, 100, 66);
  doc.text(`Annual Income: Rs. ${user.income}`, 100, 72);

  // 3. Schemes Table
  doc.setFontSize(14);
  doc.text("Eligible Schemes", 14, 90);

  const tableRows = eligibleSchemes.map((scheme) => [
    scheme.scheme_name,
    "Eligible", // Status
    scheme.missing_docs.join(", ") || "None" // Docs Required
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["Scheme Name", "Status", "Documents Required"]],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [41, 98, 255] },
  });

  // 4. Footer Disclaimer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    "Disclaimer: This report is based on the data provided by the user. Final approval is subject to government verification.",
    14,
    finalY
  );
  doc.text("Do not pay any agent for these schemes.", 14, finalY + 6);

  // 5. Save File
  doc.save(`Sahayak_Report_${Date.now()}.pdf`);
};