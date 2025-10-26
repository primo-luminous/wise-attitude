// src/app/main/loans/components/LoanExportButtons.tsx
"use client";

import React from "react";
import { Sheet, FileText, FileSpreadsheet } from "lucide-react";

/* =============== ฝังฟอนต์ THSarabun ใน jsPDF =============== */
let _fontsLoaded = false;

function ab2base64(buf: ArrayBuffer) {
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function ensureTHSarabun(doc: {
  addFileToVFS: (name: string, data: string) => void;
  addFont: (name: string, family: string, style: string) => void;
}) {
  if (_fontsLoaded) return;

  const normalUrl = "/fonts/THSarabun.ttf";
  const boldUrl = "/fonts/THSarabun-Bold.ttf";

  // normal
  const resN = await fetch(normalUrl);
  if (!resN.ok) throw new Error(`Cannot load font: ${normalUrl}`);
  const b64N = ab2base64(await resN.arrayBuffer());
  doc.addFileToVFS("THSarabun.ttf", b64N);
  doc.addFont("THSarabun.ttf", "THSarabun", "normal");

  // bold (fallback เป็น normal ถ้าไม่มีไฟล์ bold)
  try {
    const resB = await fetch(boldUrl);
    if (resB.ok) {
      const b64B = ab2base64(await resB.arrayBuffer());
      doc.addFileToVFS("THSarabun-Bold.ttf", b64B);
      doc.addFont("THSarabun-Bold.ttf", "THSarabun", "bold");
    } else {
      doc.addFont("THSarabun.ttf", "THSarabun", "bold");
    }
  } catch {
    doc.addFont("THSarabun.ttf", "THSarabun", "bold");
  }

  _fontsLoaded = true;
}

/* ================== Types ================== */
type LoanItemForExport = {
  id: number;
  sku: string;
  name: string;
  isSerialized: boolean;
  serialNumber?: string | null;
  quantity: number;
  startAt?: string | null;
  dueAt?: string | null;
};

type Props = {
  loanId: number;
  borrower?: { name: string; employeeID: string } | null;
  borrowerPosition?: string | null; // ✅ เพิ่มเพื่อนำไปแสดงตามแบบฟอร์ม
  status: "OPEN" | "CLOSED" | "CANCELLED" | "OVERDUE";
  startDate?: string | null; // ✅ วันที่ยืมในระบบ (ถ้ามีจะใช้ค่านี้เป็นหลัก)
  dueDate?: string | null;
  items: LoanItemForExport[];
  companyName?: string; // ex. "ไวส์ แอททิจูด จำกัด"
};

const EXCEL_THAI_FONT = "THSarabun"; // ผู้เปิดไฟล์ .xlsx ควรมีฟอนต์นี้ในเครื่อง

/* ================== helpers ================== */
const DECLARATIONS = [
  "1. ข้าพเจ้าได้รับทรัพย์สินของบริษัทตามรายการข้างต้นเรียบร้อยแล้ว",
  "2. จะดูแลรักษาทรัพย์สินดังกล่าวเป็นอย่างดี และใช้เพื่อประโยชน์ในการทำงานเท่านั้น",
  "3. จะไม่โอนให้ผู้อื่นหรือใช้ในทางที่ผิดกฎหมายหรือผิดวัตถุประสงค์",
  "4. เมื่อสิ้นสุดการทำงาน หรือเมื่อบริษัทเรียกคืน ข้าพเจ้าจะส่งคืนทรัพย์สินดังกล่าวในสภาพที่เหมาะสม",
  "5. หากทรัพย์สินเกิดการสูญหายหรือเสียหายจากความประมาทของข้าพเจ้า ข้าพเจ้ายินดีรับผิดชอบตามความเหมาะสม",
];

const signatureLeftRole = "(พนักงานผู้รับทรัพย์สิน)";
const signatureRightRole = "(ผู้มอบทรัพย์สิน / ตัวแทนบริษัท)";

function fmtDateYMD(isoLike: string) {
  const d = new Date(isoLike);
  if (Number.isNaN(d.valueOf())) return "-";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function thaiLongDate(isoLike: string) {
  const d = new Date(isoLike);
  if (Number.isNaN(d.valueOf())) return "-";
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  const day = d.getDate();
  const monthName = months[d.getMonth()];
  const yearBE = d.getFullYear() + 543;
  return `${day} ${monthName} ${yearBE}`;
}

function pickBorrowDateISO(
  explicit?: string | null,
  items?: LoanItemForExport[]
): string {
  if (explicit) return explicit;
  const candidates = (items ?? [])
    .map((it) => it.startAt)
    .filter((x): x is string => !!x)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  if (candidates.length > 0) return candidates[0];
  // fallback วันนี้
  return new Date().toISOString();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: unknown) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function LoanExportButtons({
  loanId,
  borrower,
  borrowerPosition,
  status,
  startDate,
  dueDate,
  items,
  companyName = "ไวส์ แอททิจูด จำกัด",
}: Props) {
  const headers = React.useMemo(
    () => ["ลำดับ", "SKU", "ทรัพย์สิน", "โหมด", "จำนวน / SN", "วันที่ยืม", "กำหนดคืน"],
    []
  );

  const rows = React.useMemo(() => {
    return items.map((it, idx) => {
      const mode = it.isSerialized ? "SN" : "จำนวน";
      const qtyOrSN = it.isSerialized ? (it.serialNumber || "-") : String(it.quantity);
      const borrowed = it.startAt ? fmtDateYMD(it.startAt) : "-";
      const due = it.dueAt ? fmtDateYMD(it.dueAt) : "-";
      return [String(idx + 1), it.sku, it.name, mode, qtyOrSN, borrowed, due];
    });
  }, [items]);

  // วันที่ในหัวเอกสาร = วันที่ยืมในระบบ
  const borrowDateISO = React.useMemo(
    () => pickBorrowDateISO(startDate, items),
    [startDate, items]
  );
  const borrowDateThai = React.useMemo(
    () => thaiLongDate(borrowDateISO),
    [borrowDateISO]
  );

  /* =============== Excel (.xlsx ผ่าน exceljs) =============== */
  const onExcel = React.useCallback(async () => {
    try {
      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("การยืม", { properties: { defaultRowHeight: 20 } });

      const colCount = headers.length;
      ws.columns = Array.from({ length: colCount }, () => ({ width: 20 }));


      // หัวเอกสารตามแบบฟอร์ม
      let currentRow = 1;
      
      // หัวข้อหลัก
      ws.mergeCells(currentRow, 1, currentRow, colCount);
      const titleCell = ws.getCell(currentRow, 1);
      titleCell.value = `แบบฟอร์มการรับทรัพย์สินของบริษัท ${companyName}`;
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { name: EXCEL_THAI_FONT, size: 16, bold: true };
      currentRow++;

      // วันที่
      ws.mergeCells(currentRow, 1, currentRow, colCount);
      const dateCell = ws.getCell(currentRow, 1);
      dateCell.value = `วันที่: ${borrowDateThai}`;
      dateCell.alignment = { horizontal: "left", vertical: "middle" };
      dateCell.font = { name: EXCEL_THAI_FONT, size: 12 };
      currentRow++;

      // ชื่อพนักงาน
      ws.mergeCells(currentRow, 1, currentRow, colCount);
      const nameCell = ws.getCell(currentRow, 1);
      nameCell.value = `ชื่อพนักงาน: ${borrower ? `${borrower.employeeID} — ${borrower.name}` : "-"}`;
      nameCell.alignment = { horizontal: "left", vertical: "middle" };
      nameCell.font = { name: EXCEL_THAI_FONT, size: 12 };
      currentRow++;

      // ตำแหน่ง
      ws.mergeCells(currentRow, 1, currentRow, colCount);
      const positionCell = ws.getCell(currentRow, 1);
      positionCell.value = `ตำแหน่ง: ${borrowerPosition ?? "-"}`;
      positionCell.alignment = { horizontal: "left", vertical: "middle" };
      positionCell.font = { name: EXCEL_THAI_FONT, size: 12 };
      currentRow++;

      // เว้นบรรทัด
      currentRow++;

      // ข้อความอธิบาย
      ws.mergeCells(currentRow, 1, currentRow, colCount);
      const descCell = ws.getCell(currentRow, 1);
      descCell.value = `ด้วยบริษัทได้มอบหมายทรัพย์สินดังต่อไปนี้ให้แก่พนักงาน เพื่อใช้ในการปฏิบัติงาน`;
      descCell.alignment = { horizontal: "left", vertical: "middle" };
      descCell.font = { name: EXCEL_THAI_FONT, size: 12 };
      currentRow++;

      // เว้นบรรทัด
      currentRow++;

      // หัวตาราง
      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { name: EXCEL_THAI_FONT, bold: true, size: 12 };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
        cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
      });

      // ข้อมูลตาราง
      rows.forEach((rowData) => {
        const row = ws.addRow(rowData);
        row.eachCell((cell) => {
          cell.font = { name: EXCEL_THAI_FONT, size: 12 };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FFEEEEEE" } },
            left: { style: "thin", color: { argb: "FFEEEEEE" } },
            bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
            right: { style: "thin", color: { argb: "FFEEEEEE" } },
          };
        });
      });

      // เว้นบรรทัด
      ws.addRow([]);
      
      // ข้อความรับรอง
      ws.mergeCells(currentRow + 1, 1, currentRow + 1, colCount);
      const certCell = ws.getCell(currentRow + 1, 1);
      certCell.value = "ข้าพเจ้าขอรับรองว่า";
      certCell.alignment = { horizontal: "left", vertical: "middle" };
      certCell.font = { name: EXCEL_THAI_FONT, size: 12, bold: true };
      
      // ข้อความรับรองแต่ละข้อ
      DECLARATIONS.forEach((line, index) => {
        ws.mergeCells(currentRow + 2 + index, 1, currentRow + 2 + index, colCount);
        const lineCell = ws.getCell(currentRow + 2 + index, 1);
        lineCell.value = line;
        lineCell.alignment = { horizontal: "left", vertical: "middle" };
        lineCell.font = { name: EXCEL_THAI_FONT, size: 12 };
      });

      ws.addRow([]);
      // ลายเซ็น 2 ฝั่ง
      // ซ้าย: คอลัมน์ 1-3, ขวา: คอลัมน์ 5-7
      const sigRow1 = ws.addRow(["", "", "", "", "", "", ""]);
      ws.mergeCells(sigRow1.number, 1, sigRow1.number, 3);
      ws.mergeCells(sigRow1.number, 5, sigRow1.number, 7);
      ws.getCell(sigRow1.number, 1).value = "ลงชื่อ: ______________________________";
      ws.getCell(sigRow1.number, 5).value = "ลงชื่อ: ______________________________";
      [1, 5].forEach((col) => {
        const c = ws.getCell(sigRow1.number, col);
        c.font = { name: EXCEL_THAI_FONT, size: 12 };
        c.alignment = { horizontal: "center", vertical: "middle" };
      });

      const sigRow2 = ws.addRow(["", "", "", "", "", "", ""]);
      ws.mergeCells(sigRow2.number, 1, sigRow2.number, 3);
      ws.mergeCells(sigRow2.number, 5, sigRow2.number, 7);
      ws.getCell(sigRow2.number, 1).value = signatureLeftRole;
      ws.getCell(sigRow2.number, 5).value = signatureRightRole;
      [1, 5].forEach((col) => {
        const c = ws.getCell(sigRow2.number, col);
        c.font = { name: EXCEL_THAI_FONT, size: 12 };
        c.alignment = { horizontal: "center", vertical: "middle" };
      });

      const sigRow3 = ws.addRow(["", "", "", "", "", "", ""]);
      ws.mergeCells(sigRow3.number, 1, sigRow3.number, 3);
      ws.mergeCells(sigRow3.number, 5, sigRow3.number, 7);
      ws.getCell(sigRow3.number, 1).value = "วันที่: ……………………………";
      ws.getCell(sigRow3.number, 5).value = "วันที่: ……………………………";
      [1, 5].forEach((col) => {
        const c = ws.getCell(sigRow3.number, col);
        c.font = { name: EXCEL_THAI_FONT, size: 12 };
        c.alignment = { horizontal: "center", vertical: "middle" };
      });

      const buf = await wb.xlsx.writeBuffer();
      downloadBlob(
        new Blob([buf], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `การยืม-${loanId}.xlsx`
      );
    } catch (error) {
      console.error("Excel export error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel");
    }
  }, [headers, rows, loanId, borrower, borrowerPosition, borrowDateThai, companyName]);

  /* =============== CSV =============== */
  const onCSV = React.useCallback(() => {
    // พาดหัว + เมทาดาต้าแบบไฟล์ข้อความก่อน ตามด้วยตารางเดิม
    const meta: string[][] = [
      ["แบบฟอร์มการรับทรัพย์สินของบริษัท", companyName],
      ["วันที่", borrowDateThai],
      ["ชื่อพนักงาน", borrower ? `${borrower.employeeID} — ${borrower.name}` : "-"],
      ["ตำแหน่ง", borrowerPosition ?? "-"],
      [],
    ];

    const data: string[][] = [
      headers,
      ...rows,
      [],
      ["ข้าพเจ้าขอรับรองว่า"],
      ...DECLARATIONS.map((d) => [d]),
      [],
      ["ลงชื่อ: ______________________________", "", "", "", "ลงชื่อ: ______________________________"],
      [signatureLeftRole, "", "", "", signatureRightRole],
      ["วันที่: ……………………………", "", "", "", "วันที่: ……………………………"],
    ];

    const lines = [...meta, ...data]
      .map((arr) => arr.map(escapeCSV).join(","))
      .join("\r\n");

    // ใส่ BOM เพื่อกันภาษาเพี้ยนตอนเปิดใน Excel
    const blob = new Blob(["\uFEFF" + lines], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `การยืม-${loanId}.csv`);
  }, [headers, rows, loanId, borrower, borrowerPosition, borrowDateThai, companyName]);

  /* =============== PDF (ฝัง THSarabun ด้วย jsPDF + autotable) =============== */
  const onPDF = React.useCallback(async () => {
    try {
      const jsPDFns: { jsPDF?: unknown; default?: unknown } = await import("jspdf");
      const JsPDFCtor = jsPDFns.jsPDF || jsPDFns.default;
      if (!JsPDFCtor) throw new Error("Cannot resolve jsPDF constructor");

      const atMod: { default?: unknown; autoTable?: unknown } = await import("jspdf-autotable");
      const autoTable = (atMod.default || atMod.autoTable || atMod) as (doc: unknown, options: unknown) => void;
      if (typeof autoTable !== "function") throw new Error("Cannot resolve jspdf-autotable");

      const doc = new (JsPDFCtor as new (options?: { orientation?: string; unit?: string; format?: string }) => {
        addFileToVFS: (name: string, data: string) => void;
        addFont: (name: string, family: string, style: string) => void;
        addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => void;
        setFont: (font: string, style: string) => void;
        setFontSize: (size: number) => void;
        setTextColor: (r: number, g: number, b: number) => void;
        text: (text: string, x: number, y: number, options?: { align?: string }) => void;
        line: (x1: number, y1: number, x2: number, y2: number) => void;
        internal: {
          pageSize: {
            getWidth: () => number;
            getHeight: () => number;
          };
        };
        getNumberOfPages: () => number;
        setPage: (page: number) => void;
        lastAutoTable: { finalY: number };
        save: (filename: string) => void;
      })({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      // ลงฟอนต์ THSarabun
      try {
        await ensureTHSarabun(doc);
        doc.setFont("THSarabun", "normal");
      } catch (e) {
        console.warn("[PDF] THSarabun load failed:", e);
      }
      doc.setTextColor(0, 0, 0);

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 40;
      const top = 28;


      // เตรียม header block ตามแบบฟอร์ม
      const headerLines = [
        { text: `แบบฟอร์มการรับทรัพย์สินของบริษัท ${companyName}`, size: 14, bold: true, center: true },
        { text: `วันที่: ${borrowDateThai}`, size: 12, bold: false, center: false },
        { text: `ชื่อพนักงาน: ${borrower ? `${borrower.employeeID} — ${borrower.name}` : "-"}`, size: 12, bold: false, center: false },
        { text: `ตำแหน่ง: ${borrowerPosition ?? "-"}`, size: 12, bold: false, center: false },
        { text: ``, size: 8, bold: false, center: false },
        { text: `ด้วยบริษัทได้มอบหมายทรัพย์สินดังต่อไปนี้ให้แก่พนักงาน เพื่อใช้ในการปฏิบัติงาน`, size: 12, bold: false, center: false },
      ];

      let cursorY = top;
      headerLines.forEach((l, i) => {
        doc.setFont("THSarabun", l.bold ? "bold" : "normal");
        doc.setFontSize(l.size);
        if (l.center) {
          doc.text(l.text, pageW / 2, cursorY, { align: "center" });
        } else {
          doc.text(l.text, marginX, cursorY);
        }
        cursorY += i === 0 ? 20 : 18;
      });

      const tableTop = cursorY + 10;

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: tableTop,
        styles: {
          font: "THSarabun",
          fontStyle: "normal",
          fontSize: 11,
          textColor: [0, 0, 0],
          halign: "center",
          valign: "middle",
          cellPadding: 5,
        },
        headStyles: {
          font: "THSarabun",
          fontStyle: "bold",
          fontSize: 11,
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
        },
        margin: { left: marginX, right: marginX, bottom: 120 },
        tableWidth: "auto",
      });

      // ไปหน้าสุดท้ายสำหรับ ข้อความรับรอง + ลายเซ็น
      const totalPages = doc.getNumberOfPages();
      doc.setPage(totalPages);
      doc.setFont("THSarabun", "bold");
      doc.setFontSize(12);
      let y = doc.lastAutoTable.finalY + 18;
      if (!y || y < 200) y = 200;

      doc.text("ข้าพเจ้าขอรับรองว่า", marginX, y);
      y += 16;

      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);
      DECLARATIONS.forEach((line) => {
        doc.text(line, marginX, y);
        y += 16;
      });

      // ลายเซ็น 2 ฝั่ง (ตามแบบฟอร์ม)
      const sigY = Math.min(y + 24, pageH - 90);
      const sigW = 220;
      const leftX1 = marginX;
      const leftX2 = leftX1 + sigW;
      const rightX2 = pageW - marginX;
      const rightX1 = rightX2 - sigW;

      // เส้นลงชื่อ
      doc.line(leftX1, sigY, leftX2, sigY);
      doc.line(rightX1, sigY, rightX2, sigY);

      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);
      doc.text("ลงชื่อ:", leftX1, sigY - 4);
      doc.text("ลงชื่อ:", rightX1, sigY - 4);

      // บทบาท
      doc.text(signatureLeftRole, leftX1, sigY + 16);
      doc.text(signatureRightRole, rightX1, sigY + 16);

      // วันที่
      doc.text("วันที่: ……………………………", leftX1, sigY + 32);
      doc.text("วันที่: ……………………………", rightX1, sigY + 32);

      doc.save(`การยืม-${loanId}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกไฟล์ PDF");
    }
  }, [headers, rows, loanId, borrower, borrowerPosition, borrowDateThai, companyName]);

  const disabled = items.length === 0;

  return (
    <div className="flex items-center gap-2">
      {/* Excel */}
      <button
        type="button"
        onClick={onExcel}
        disabled={disabled}
        aria-label="Export Excel (.xlsx)"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl p-0.5
             bg-gradient-to-br from-emerald-400 to-emerald-600
             focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white
             disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-100/60"
      >
        <span
          className="inline-flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-medium text-emerald-700
               transition-all duration-200 group-hover:bg-transparent group-hover:text-white"
        >
          <Sheet className="size-4" />
          Excel (.xlsx)
        </span>
      </button>

      {/* PDF */}
      <button
        type="button"
        onClick={onPDF}
        disabled={disabled}
        aria-label="Export PDF"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl p-0.5
             bg-gradient-to-br from-rose-500 to-red-600
             focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white
             disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-rose-100/60"
      >
        <span className="inline-flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-medium text-rose-700
                   transition-all duration-200 group-hover:bg-transparent group-hover:text-white">
          <FileText className="size-4" />
          PDF
        </span>
      </button>

      {/* CSV */}
      <button
        type="button"
        onClick={onCSV}
        disabled={disabled}
        aria-label="Export CSV"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl p-0.5
             bg-gradient-to-br from-sky-400 to-blue-600
             focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white
             disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-sky-100/60"
      >
        <span className="inline-flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-medium text-sky-700
                   transition-all duration-200 group-hover:bg-transparent group-hover:text-white">
          <FileSpreadsheet className="size-4" />
          CSV
        </span>
      </button>
    </div>
  );
}
