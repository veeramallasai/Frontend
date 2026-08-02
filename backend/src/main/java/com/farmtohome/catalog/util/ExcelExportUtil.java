package com.farmtohome.catalog.util;

import com.farmtohome.catalog.dto.export.ExportDataset;
import com.farmtohome.catalog.exception.ExportException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public final class ExcelExportUtil {

    private ExcelExportUtil() {
    }

    public static byte[] write(ExportDataset dataset) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            String sheetName = dataset.table().length() > 31 ? dataset.table().substring(0, 31) : dataset.table();
            XSSFSheet sheet = workbook.createSheet(sheetName);

            CellStyle headerStyle = createHeaderStyle(workbook);
            Row headerRow = sheet.createRow(0);

            for (int columnIndex = 0; columnIndex < dataset.columns().size(); columnIndex++) {
                Cell cell = headerRow.createCell(columnIndex);
                cell.setCellValue(dataset.columns().get(columnIndex));
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (var values : dataset.rows()) {
                Row row = sheet.createRow(rowIndex++);
                for (int columnIndex = 0; columnIndex < values.size(); columnIndex++) {
                    Cell cell = row.createCell(columnIndex);
                    setCellValue(cell, values.get(columnIndex));
                }
            }

            // Keep header visible while scrolling.
            sheet.createFreezePane(0, 1);

            for (int columnIndex = 0; columnIndex < dataset.columns().size(); columnIndex++) {
                sheet.autoSizeColumn(columnIndex);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException ex) {
            throw new ExportException("Failed to generate Excel export", ex);
        }
    }

    private static CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private static void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
            return;
        }

        if (value instanceof Integer intValue) {
            cell.setCellValue(intValue.doubleValue());
            return;
        }

        if (value instanceof Long longValue) {
            cell.setCellValue(longValue.doubleValue());
            return;
        }

        if (value instanceof Double doubleValue) {
            cell.setCellValue(doubleValue);
            return;
        }

        if (value instanceof Float floatValue) {
            cell.setCellValue(floatValue.doubleValue());
            return;
        }

        if (value instanceof BigDecimal decimalValue) {
            cell.setCellValue(decimalValue.doubleValue());
            return;
        }

        if (value instanceof Boolean boolValue) {
            cell.setCellValue(boolValue);
            return;
        }

        if (value instanceof LocalDate localDate) {
            cell.setCellValue(localDate.toString());
            return;
        }

        if (value instanceof LocalDateTime localDateTime) {
            cell.setCellValue(localDateTime.toString());
            return;
        }

        if (value instanceof Timestamp timestamp) {
            cell.setCellValue(timestamp.toString());
            return;
        }

        if (value instanceof Date date) {
            cell.setCellValue(date.toString());
            return;
        }

        cell.setCellValue(String.valueOf(value));
    }
}
