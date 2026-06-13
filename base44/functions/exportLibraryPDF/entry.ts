import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [bookmarks, highlights, notes] = await Promise.all([
      base44.entities.Bookmark.list('-created_date', 100),
      base44.entities.UserHighlight.list('-created_date', 100),
      base44.entities.UserNote.list('-created_date', 100),
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const checkPage = (needed = 10) => {
      if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
    };

    const drawLine = (color = [50, 50, 70]) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 4;
    };

    // ── Cover page ──
    doc.setFillColor(6, 8, 15);
    doc.rect(0, 0, pageW, pageH, 'F');

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(251, 191, 36);
    doc.text('VERITAS', pageW / 2, 60, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 220);
    doc.text('Las Sagradas Escrituras — Mi Biblioteca Personal', pageW / 2, 74, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 150);
    doc.text(user.full_name || user.email, pageW / 2, 86, { align: 'center' });
    doc.text(new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), pageW / 2, 93, { align: 'center' });

    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.5);
    doc.line(margin + 30, 100, pageW - margin - 30, 100);

    // Stats summary
    const statsY = 115;
    const statItems = [
      { label: 'Marcadores', count: bookmarks.length },
      { label: 'Resaltados', count: highlights.length },
      { label: 'Notas', count: notes.length },
    ];
    statItems.forEach((s, i) => {
      const sx = margin + 30 + i * 50;
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 245, 255);
      doc.text(String(s.count), sx, statsY, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 150);
      doc.text(s.label, sx, statsY + 7, { align: 'center' });
    });

    doc.addPage();

    // ── Section helper ──
    const sectionTitle = (title, colorR, colorG, colorB) => {
      checkPage(20);
      doc.setFillColor(colorR, colorG, colorB);
      doc.rect(margin, y, contentW, 10, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 4, y + 7);
      y += 14;
    };

    const itemBox = (lines, accentR, accentG, accentB) => {
      const lineH = 5.5;
      const wrappedLines = lines.flatMap((line, index) =>
        doc.splitTextToSize(String(line || ''), contentW - 10).map(text => ({ text, first: index === 0 }))
      );
      const boxH = wrappedLines.length * lineH + 8;
      checkPage(boxH + 4);
      doc.setFillColor(15, 20, 40);
      doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'F');
      doc.setDrawColor(accentR, accentG, accentB);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin, y + boxH);
      doc.setFontSize(9);
      wrappedLines.forEach((line, li) => {
        doc.setFont('helvetica', line.first ? 'bold' : 'normal');
        doc.setTextColor(line.first ? accentR : 190, line.first ? accentG : 190, line.first ? accentB : 200);
        doc.text(line.text, margin + 5, y + 6 + li * lineH);
      });
      y += boxH + 3;
    };

    // ── BOOKMARKS ──
    if (bookmarks.length > 0) {
      sectionTitle('✦ Marcadores de Versículos', 40, 50, 90);
      bookmarks.forEach(bm => {
        itemBox([
          bm.verse_ref || '',
          bm.label || bm.translation || '',
          new Date(bm.created_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }),
        ], 251, 191, 36);
      });
      y += 6;
    }

    // ── HIGHLIGHTS ──
    if (highlights.length > 0) {
      checkPage(20);
      sectionTitle('✦ Versículos Resaltados', 0, 80, 100);
      highlights.forEach(hl => {
        const colorMap = { yellow: [251, 191, 36], cyan: [0, 229, 255], purple: [167, 139, 250], green: [52, 211, 153], red: [248, 113, 113] };
        const [r, g, b] = colorMap[hl.color] || [251, 191, 36];
        itemBox([
          hl.verse_ref || '',
          `Color: ${hl.color || ''}  ·  ${hl.translation || 'KJV'}`,
          new Date(hl.created_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }),
        ], r, g, b);
      });
      y += 6;
    }

    // ── NOTES ──
    if (notes.length > 0) {
      checkPage(20);
      sectionTitle('✦ Notas Personales', 70, 40, 120);
      notes.forEach(note => {
        const noteLines = doc.splitTextToSize(note.note_text || '', contentW - 10);
        const boxH = (3 + noteLines.length) * 6 + 10;
        checkPage(boxH + 6);
        doc.setFillColor(15, 20, 40);
        doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'F');
        doc.setDrawColor(167, 139, 250);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin, y + boxH);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(167, 139, 250);
        doc.text(note.verse_ref || '', margin + 5, y + 7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(190, 190, 200);
        doc.text(noteLines, margin + 5, y + 14);
        const dateStr = new Date(note.created_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' });
        doc.setTextColor(90, 90, 110);
        doc.text(dateStr, margin + 5, y + boxH - 4);
        y += boxH + 4;
      });
    }

    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 2; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 100);
      doc.text(`VERITAS · Las Sagradas Escrituras`, margin, pageH - 8);
      doc.text(`${p} / ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=veritas-biblioteca-${new Date().toISOString().slice(0, 10)}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});