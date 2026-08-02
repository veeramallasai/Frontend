package com.farmtohome.catalog.util;

import com.farmtohome.catalog.dto.export.ExportDataset;
import java.nio.charset.StandardCharsets;
import java.util.StringJoiner;

public final class CsvExportUtil {

    private CsvExportUtil() {
    }

    public static byte[] write(ExportDataset dataset) {
        StringBuilder builder = new StringBuilder();

        StringJoiner headerJoiner = new StringJoiner(",");
        for (String column : dataset.columns()) {
            headerJoiner.add(escape(column));
        }
        builder.append(headerJoiner).append('\n');

        for (var row : dataset.rows()) {
            StringJoiner rowJoiner = new StringJoiner(",");
            for (Object value : row) {
                rowJoiner.add(escape(value == null ? "" : String.valueOf(value)));
            }
            builder.append(rowJoiner).append('\n');
        }

        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String escape(String value) {
        boolean mustQuote = value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r");
        String escaped = value.replace("\"", "\"\"");
        return mustQuote ? "\"" + escaped + "\"" : escaped;
    }
}
