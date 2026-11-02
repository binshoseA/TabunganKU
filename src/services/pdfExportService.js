import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { decodeAccountRoute } from '../utils/accountRoutes';

export const exportTransactionsPDF = (transactions, userEmail) => {
  if (!transactions || !transactions.length) {
    throw new Error("Belum ada transaksi untuk diekspor!");
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const W = 210, H = 297, M = 15, contentW = W - M * 2;
  const navy = [11, 21, 42], blue = [37, 99, 235], muted = [100, 116, 139];
  const light = [248, 250, 252], border = [226, 232, 240];
  const green = [16, 185, 129], red = [239, 68, 68], white = [255, 255, 255];

  const money = (value) => "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const dateLabel = (value) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const now = new Date();
  const printedAt = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const sorted = [...transactions].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  });

  const totalIncome = transactions.reduce((sum, tx) => sum + (tx.type === "income" ? Number(tx.amount) || 0 : 0), 0);
  const totalExpense = transactions.reduce((sum, tx) => sum + (tx.type === "expense" ? Number(tx.amount) || 0 : 0), 0);
  const balance = totalIncome - totalExpense;
  const owner = userEmail || "Pengguna TabunganKU";

  // Header Banner
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 64, "F");

  // Logo Accent
  doc.setFillColor(...blue);
  doc.roundedRect(M, 13, 2.5, 11, 1, 1, "F");

  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TabunganKU", M + 6, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 205, 226);
  doc.text("SMART PERSONAL FINANCE TRACKER", M + 6, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text("E-STATEMENT", W - M, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(190, 205, 226);
  doc.text(printedAt, W - M, 24, { align: "right" });

  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Your money, in focus.", M, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(190, 205, 226);
  doc.text("Ringkasan resmi riwayat arus kas dan transaksi finansial Anda.", M, 52);

  // User Section
  doc.setTextColor(...muted);
  doc.setFontSize(7.5);
  doc.text("PEMILIK AKUN", M, 75);

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(doc.splitTextToSize(owner, contentW), M, 81);

  // Balance Card
  const cardY = 90, cardH = 34;
  doc.setFillColor(...navy);
  doc.roundedRect(M, cardY, contentW, cardH, 4, 4, "F");

  doc.setFillColor(...blue);
  doc.roundedRect(M + 5, cardY + 7, 1.5, 19, 0.75, 0.75, "F");

  doc.setTextColor(190, 205, 226);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("SALDO BERSIH (NET BALANCE)", M + 11, cardY + 11);

  doc.setTextColor(...white);
  doc.setFontSize(18);
  doc.text(money(balance), M + 11, cardY + 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(190, 205, 226);
  doc.text(`${transactions.length} transaksi tercatat`, W - M - 6, cardY + 28, { align: "right" });

  // Two summary cards
  const gap = 5, smallW = (contentW - gap) / 2, smallY = 130, smallH = 26;
  const summaryCard = (x, label, amount, color) => {
    doc.setFillColor(...light);
    doc.roundedRect(x, smallY, smallW, smallH, 3, 3, "F");
    doc.setFillColor(...color);
    doc.circle(x + 5, smallY + 7, 1.2, "F");
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(label, x + 9, smallY + 8);
    doc.setTextColor(...color);
    doc.setFontSize(12);
    doc.text(money(amount), x + 5, smallY + 19);
  };

  summaryCard(M, "TOTAL PEMASUKAN", totalIncome, green);
  summaryCard(M + smallW + gap, "TOTAL PENGELUARAN", totalExpense, red);

  // Transactions Table
  const sectionY = 166;
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Riwayat Transaksi", M, sectionY);

  const rows = sorted.map((tx) => {
    const isIncome = tx.type === "income";
    const route = decodeAccountRoute(tx.paymentMethod || tx.payment_method, tx.type);
    const sign = tx.type === 'transfer' ? '↔' : isIncome ? '+' : '-';
    return [
      dateLabel(tx.date),
      String(tx.category || (tx.type === 'transfer' ? 'Pindah Saldo' : 'Lainnya')),
      String(tx.note || '-'),
      `${route.from} → ${route.to}`,
      `${sign} ${money(tx.amount)}`,
    ];
  });

  autoTable(doc, {
    startY: sectionY + 8,
    margin: { left: M, right: M, bottom: 20 },
    head: [["TANGGAL", "KATEGORI", "CATATAN", "DARI → KE", "NOMINAL"]],
    body: rows,
    theme: "plain",
    showHead: "everyPage",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      textColor: navy,
      overflow: "linebreak",
      valign: "middle",
      lineColor: border,
      lineWidth: { bottom: 0.15 }
    },
    headStyles: {
      fillColor: light,
      textColor: muted,
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      lineColor: border,
      lineWidth: { bottom: 0.5 }
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 28 },
      2: { cellWidth: 50 },
      3: { cellWidth: 44 },
      4: { cellWidth: 34, halign: "right" }
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 4) {
        const tx = sorted[data.row.index];
        data.cell.styles.textColor = tx?.type === "income" ? green : tx?.type === "transfer" ? blue : red;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor = muted;
        data.cell.styles.fontSize = 6.5;
      }
    },
    rowPageBreak: "avoid",
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(M, H - 14, W - M, H - 14);
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Generated by TabunganKU", M, H - 9);
    doc.text(`HALAMAN ${page} DARI ${pageCount}`, W - M, H - 9, { align: "right" });
  }

  doc.save(`E-Statement_TabunganKU_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.pdf`);
};

