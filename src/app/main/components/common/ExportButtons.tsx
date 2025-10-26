"use client";

import React from "react";
import type { Styles as AutoTableStyles } from "jspdf-autotable";
import { Sheet, FileText, FileSpreadsheet } from "lucide-react";

/* =========================
 *       Types
 * ========================= */
type Column<Row> = {
  header: string;
  key?: keyof Row | string;
  value?: (row: Row, index: number) => unknown;
};

type PdfOptions = {
  title?: string;
  orientation?: "p" | "l";
  tableWidth?: number | "auto" | "wrap";
  columnStyles?: Record<number | string, Partial<AutoTableStyles>>;
};

type Props<Row extends Record<string, unknown>> = {
  data: Row[];
  columns: Column<Row>[];
  filename: string;
  fileBase?: string;
  pdf?: PdfOptions;
  logoDataUrl?: string;
  logoUrl?: string;
  companyName?: string;
  className?: string;
};

/* ฟอนต์ที่จะระบุใน Excel (ต้องมีในเครื่องผู้ใช้) */
const EXCEL_THAI_FONT = "TH Sarabun"; // ถ้าเครื่องคุณมีเฉพาะ "TH Sarabun New" ให้เปลี่ยนเป็นค่านั้น

export default function ExportButtons<Row extends Record<string, unknown>>({
  data,
  columns,
  filename,
  fileBase,
  pdf,
  logoDataUrl,
  logoUrl,
  companyName,
  className,
}: Props<Row>) {
  const headers = React.useMemo(() => columns?.map((c) => c.header) || [], [columns]);

  const rows = React.useMemo(
    () =>
      data.map((row, index) => {
        if (columns && columns.length > 0) {
          return columns.reduce((acc, col) => {
            acc[col.header] = col.key ? row[col.key as keyof Row] : col.value ? col.value(row, index) : "";
            return acc;
          }, {} as Record<string, unknown>);
        }
        // Fallback: export all properties
        return row;
      }),
    [data, columns]
  );

  /* ---------- CSV ---------- */
  const onCSV = React.useCallback(() => {
    if (headers.length === 0 || rows.length === 0) return;

    const csvBody = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvBody], { type: "text/csv;charset=utf-8" });
    const fileName = fileBase || filename;
    downloadBlob(blob, `${fileName}.csv`);
  }, [headers, rows, fileBase, filename]);

  /* ---------- Excel ---------- */
  const onExcel = React.useCallback(async () => {
    if (headers.length === 0 || rows.length === 0) return;

    try {
      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Data", { properties: { defaultRowHeight: 18 } });

      // โลโก้
      let base64: string | undefined;
      let ext: "png" | "jpeg" | undefined;
      if (logoDataUrl) {
        const parsed = dataUrlToBase64AndExt(logoDataUrl);
        base64 = parsed.base64; ext = parsed.ext;
      } else if (logoUrl) {
        const dataUrl = await urlToDataUrl(logoUrl);
        const parsed = dataUrlToBase64AndExt(dataUrl);
        base64 = parsed.base64; ext = parsed.ext;
      }

      const colCount = headers.length;
      ws.columns = Array.from({ length: colCount }, () => ({ width: 18 }));

      let currentRow = 1;
      if (companyName) {
        ws.mergeCells(currentRow, 1, currentRow, colCount);
        const cell = ws.getCell(currentRow, 1);
        cell.value = companyName;
        cell.font = { name: EXCEL_THAI_FONT, bold: true, size: 14 };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        ws.getRow(currentRow).height = 22;
        currentRow++;
      }

      const title = fileBase || filename;
      ws.mergeCells(currentRow, 1, currentRow, colCount);
      const titleCell = ws.getCell(currentRow, 1);
      titleCell.value = title;
      titleCell.font = { name: EXCEL_THAI_FONT, bold: true, size: 12 };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      ws.getRow(currentRow).height = 18;
      currentRow++;

      ws.addRow([]);
      ws.getRow(currentRow).height = 6;
      currentRow++;

      if (base64 && ext) {
        const imageId = wb.addImage({ base64, extension: ext });
        ws.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 40, height: 40 } });
        ws.getRow(1).height = Math.max(ws.getRow(1).height ?? 18, 28);
        ws.getRow(2).height = Math.max(ws.getRow(2).height ?? 18, 20);
      }

      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { name: EXCEL_THAI_FONT, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
        cell.border = thinBorder("FFCCCCCC");
      });

      // Convert rows to array format for Excel
      const excelRows = rows.map((r) => {
        if (Array.isArray(r)) {
          return r.map((x) => (x == null ? "" : String(x)));
        } else if (typeof r === 'object' && r !== null) {
          // If r is an object, extract values based on headers
          return headers.map(header => {
            const value = (r as Record<string, unknown>)[header];
            return value == null ? "" : String(value);
          });
        }
        return [];
      });

      excelRows.forEach((rowData) => {
        const row = ws.addRow(rowData);
        row.eachCell((cell) => {
          cell.font = { name: EXCEL_THAI_FONT };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = thinBorder("FFEEEEEE");
        });
      });

      const buf = await wb.xlsx.writeBuffer();
      const fileName = fileBase || filename;
      downloadBlob(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${fileName}.xlsx`
      );
    } catch (err) {
      console.error("[Export Excel] exceljs failed:", err);
      alert("Export Excel ต้องติดตั้งแพ็กเกจ 'exceljs' ก่อน\n\nติดตั้งด้วย:  npm i exceljs");
    }
  }, [headers, rows, fileBase, filename, companyName, logoDataUrl, logoUrl]);

  /* ---------- PDF ---------- */
  const onPDF = React.useCallback(async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: pdf?.orientation ?? "p", unit: "pt" });

      // ลงทะเบียนฟอนต์ THSarabun เป็นหลัก
      const thaiReady = await registerTHSarabun(doc, {
        regular: "/fonts/THSarabun.ttf",
        bold: "/fonts/THSarabun-Bold.ttf",
        // ถ้าไฟล์ชื่อ New ให้ลองตัวนี้ต่อ, และสุดท้าย fallback NotoSansThai
        altRegular: "/fonts/THSarabunNew-Regular.ttf",
        altBold: "/fonts/THSarabunNew-Bold.ttf",
        fallback: "/fonts/NotoSansThai-Regular.ttf",
      });

      const PDF_FONT = thaiReady ? "THSarabun" : "helvetica";

      doc.setFont(PDF_FONT, "normal");
      doc.setTextColor(0, 0, 0);

      const headerLogo = await loadHeaderLogo(logoDataUrl, logoUrl);

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      const headerTop = 24;
      const headerHeight = 60;
      const footerBottom = 24;
      const footerHeight = 20;
      const marginX = 40;

      // Convert rows to array format for PDF
      const pdfRows = rows.map((r) => {
        if (Array.isArray(r)) {
          return r.map((x) => (x == null ? "" : String(x)));
        } else if (typeof r === 'object' && r !== null) {
          // If r is an object, extract values based on headers
          return headers.map(header => {
            const value = (r as Record<string, unknown>)[header];
            return value == null ? "" : String(value);
          });
        }
        return [];
      });

      autoTable(doc, {
        head: [headers],
        body: pdfRows,
        margin: { top: headerTop + headerHeight, bottom: footerBottom + footerHeight, left: marginX, right: marginX },
        tableWidth: pdf?.tableWidth ?? "auto",
        columnStyles: pdf?.columnStyles,
        styles: {
          font: PDF_FONT,
          fontSize: 11,
          textColor: [0, 0, 0],
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          font: PDF_FONT,
          fontStyle: "bold",
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
        },
        didDrawPage: () => {
          let textX = marginX;
          const textY = headerTop + 14;

          if (headerLogo) {
            try {
              const fmt = pickImageFormat(headerLogo) || "JPEG";
              const h = 36, w = 36;
              doc.addImage(headerLogo, fmt, marginX, headerTop, w, h);
              textX = marginX + w + 10;
            } catch (e) {
              console.warn("[PDF] addImage failed:", e);
            }
          }

          const headerTitle = companyName || pdf?.title || fileBase || filename;
          if (headerTitle) {
            doc.setFont(PDF_FONT, "bold");
            doc.setFontSize(14);
            doc.text(String(headerTitle), textX, textY);
            doc.setFont(PDF_FONT, "normal");
          }

          const pageNumber = doc.getCurrentPageInfo().pageNumber;
          const total = doc.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(`Page ${pageNumber} / ${total}`, pageW - marginX, headerTop + 12, { align: "right" });
          const footerText = fileBase || filename;
          doc.text(footerText, pageW / 2, pageH - footerBottom, { align: "center" });
        },
      });

      const fileName = fileBase || filename;
      doc.save(`${fileName}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Export PDF ต้องติดตั้ง 'jspdf' และ 'jspdf-autotable'\n\nติดตั้งด้วย:  npm i jspdf jspdf-autotable");
    }
  }, [headers, rows, fileBase, filename, pdf, companyName, logoDataUrl, logoUrl]);

  const disabled = data.length === 0;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className || ""}`}>
      {/* Excel */}
      <button
        type="button"
        onClick={onExcel}
        disabled={disabled}
        aria-label="Export Excel"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl p-0.5
                   bg-gradient-to-br from-emerald-400 to-emerald-600
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                   disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-100/60"
      >
        <span className="inline-flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-medium text-emerald-700
                         transition-all duration-200 group-hover:bg-transparent group-hover:text-white">
          <Sheet className="size-4" />
          Excel
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
                   bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                   disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-slate-100/60"
      >
        <span className="inline-flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-medium text-slate-700
                         transition-all duration-200 group-hover:bg-transparent group-hover:text-slate-900">
          <FileSpreadsheet className="size-4" />
          CSV
        </span>
      </button>
    </div>
  );
}

/* =========================
 *       Helpers
 * ========================= */
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

function thinBorder(argb = "FFEEEEEE") {
  return {
    top: { style: "thin" as const, color: { argb } },
    left: { style: "thin" as const, color: { argb } },
    bottom: { style: "thin" as const, color: { argb } },
    right: { style: "thin" as const, color: { argb } },
  };
}

function pickImageFormat(dataUrl: string): "PNG" | "JPEG" | undefined {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "JPEG";
  return undefined;
}

async function urlToDataUrl(url: string): Promise<string> {
  const absolute = url.startsWith("http") ? url : new URL(url, window.location.origin).toString();
  const res = await fetch(absolute, { cache: "no-store" });
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBase64AndExt(dataUrl: string): { base64: string; ext: "png" | "jpeg" | undefined } {
  const ext =
    dataUrl.startsWith("data:image/png")
      ? "png"
      : dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")
      ? "jpeg"
      : undefined;
  const base64 = dataUrl.split(",")[1] ?? "";
  return { base64, ext };
}

/* =========================
 *  THSarabun for jsPDF
 * ========================= */
async function fetchAsBase64Safe(url: string): Promise<string | null> {
  try {
    const abs = url.startsWith("http") ? url : new URL(url, window.location.origin).toString();
    const res = await fetch(abs, { cache: "no-store" });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  } catch {
    return null;
  }
}

/** ลงทะเบียนฟอนต์ THSarabun เป็นชื่อครอบครัว "THSarabun" */
async function registerTHSarabun(
  doc: unknown,
  opts?: {
    regular?: string;
    bold?: string;
    altRegular?: string;
    altBold?: string;
    fallback?: string;
  }
): Promise<boolean> {
  const regular = opts?.regular ?? "/fonts/THSarabun.ttf";
  const bold = opts?.bold ?? "/fonts/THSarabun-Bold.ttf";
  const altRegular = opts?.altRegular ?? "/fonts/THSarabunNew-Regular.ttf";
  const altBold = opts?.altBold ?? "/fonts/THSarabunNew-Bold.ttf";
  const fallback = opts?.fallback ?? "/fonts/NotoSansThai-Regular.ttf";

  let loaded = false;

  // ลอง THSarabun (คลาสสิก)
  let regB64 = await fetchAsBase64Safe(regular);
  if (!regB64) {
    // ลอง THSarabunNew
    regB64 = await fetchAsBase64Safe(altRegular);
  }
  if (!regB64) {
    // fallback NotoSansThai
    regB64 = await fetchAsBase64Safe(fallback);
  }
  if (regB64) {
    // map ชื่อทั้งหมดเป็น THSarabun
    (doc as { addFileToVFS: (name: string, data: string) => void }).addFileToVFS("THSarabun-Regular.ttf", regB64);
    (doc as { addFont: (name: string, family: string, style: string) => void }).addFont("THSarabun-Regular.ttf", "THSarabun", "normal");
    loaded = true;
  }

  // Bold (พยายามตามลำดับเดียวกัน)
  let boldB64 = await fetchAsBase64Safe(bold);
  if (!boldB64) boldB64 = await fetchAsBase64Safe(altBold);
  if (boldB64) {
    (doc as { addFileToVFS: (name: string, data: string) => void }).addFileToVFS("THSarabun-Bold.ttf", boldB64);
    (doc as { addFont: (name: string, family: string, style: string) => void }).addFont("THSarabun-Bold.ttf", "THSarabun", "bold");
  }

  if (loaded) (doc as { setFont: (family: string, style: string) => void }).setFont("THSarabun", "normal");
  return loaded;
}

/* โลโก้เป็น dataURL */
async function loadHeaderLogo(logoDataUrl?: string, logoUrl?: string) {
  if (logoDataUrl && logoDataUrl.startsWith("data:image/")) return logoDataUrl;
  if (!logoUrl) return undefined;
  try {
    return await urlToDataUrl(logoUrl);
  } catch {
    return undefined;
  }
}
