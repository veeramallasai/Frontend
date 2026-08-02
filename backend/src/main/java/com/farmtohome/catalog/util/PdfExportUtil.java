package com.farmtohome.catalog.util;

import com.farmtohome.catalog.dto.export.ExportDataset;
import com.farmtohome.catalog.exception.ExportException;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;

public final class PdfExportUtil {

    private PdfExportUtil() {
    }

    public static byte[] write(ExportDataset dataset) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font rowFont = new Font(Font.HELVETICA, 9);

            Paragraph title = new Paragraph("Dataset Export - " + dataset.table(), titleFont);
            title.setSpacingAfter(12f);
            document.add(title);

            PdfPTable table = new PdfPTable(Math.max(dataset.columns().size(), 1));
            table.setWidthPercentage(100f);

            for (String column : dataset.columns()) {
                PdfPCell headerCell = new PdfPCell(new Phrase(column, headerFont));
                headerCell.setHorizontalAlignment(Element.ALIGN_LEFT);
                headerCell.setPadding(6f);
                table.addCell(headerCell);
            }

            for (var row : dataset.rows()) {
                for (Object value : row) {
                    PdfPCell dataCell = new PdfPCell(new Phrase(value == null ? "" : String.valueOf(value), rowFont));
                    dataCell.setHorizontalAlignment(Element.ALIGN_LEFT);
                    dataCell.setPadding(5f);
                    table.addCell(dataCell);
                }
            }

            document.add(table);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new ExportException("Failed to generate PDF export", ex);
        }
    }
}
