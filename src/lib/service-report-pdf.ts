import { jsPDF } from "jspdf";
import type { MobileJob } from "@/lib/mobile-data";

export function downloadServiceReport(job: MobileJob): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  let y = margin;
  const line = (text: string, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const rows = doc.splitTextToSize(text, 180) as string[];
    for (const row of rows) {
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(row, margin, y);
      y += size * 0.45 + 2;
    }
  };

  line("Telesonic service report", 16, true);
  line(job.id, 12, true);
  line(`Customer: ${job.customerName}`);
  line(`Site: ${job.siteName || job.town} — ${job.siteAddress}`);
  line(`Status: ${job.status}`);
  line(`Technician: ${job.technicianName}`);
  y += 2;
  line("Parts", 13, true);
  for (const part of job.parts || []) {
    line(
      `${part.name} used ${part.qtyUsed}, returned ${part.qtyReturned}` +
        (part.serialNo ? `, serial ${part.serialNo}` : "") +
        (part.pairedComponentSerial ? `, paired ${part.pairedComponentSerial}` : "") +
        (part.installArea ? `, ${part.installArea}` : ""),
    );
  }
  if (!job.parts?.length) line("No parts recorded.");
  y += 2;
  line("Labour", 13, true);
  for (const labour of job.labourLogs || []) {
    line(`${labour.date} ${labour.technicianName}: ${labour.hours} h — ${labour.activityDescription}`);
  }
  if (!job.labourLogs?.length) line("No labour recorded.");
  y += 2;
  line("Completion", 13, true);
  if (job.completion?.refusedToSign) {
    line(`Customer refused to sign. Reason: ${job.completion.refusalReason || "Not stated"}`);
  } else if (job.completion) {
    line(`Signed by ${job.completion.signerName} (${job.completion.signerRole})`);
    line(`Completed ${job.completion.completedAt}. Slip ${job.completion.workSlipNumber}.`);
    if (job.completion.partialCompletion) {
      line(`Partial completion: ${job.completion.partialReason || "Not stated"}`);
    }
    if (job.completion.warrantyTriggered) line("Warranty follow-up requested.");
  } else {
    line("Not completed.");
  }
  const holds = job.holdRequests || [];
  if (holds.length > 0) {
    y += 2;
    line("Holds", 13, true);
    for (const hold of holds) {
      line(`${hold.status}: ${hold.reason}. Resume ${hold.expectedResumeDate || "not set"}.`);
    }
  }
  doc.save(`service-report-${job.id}.pdf`);
}
