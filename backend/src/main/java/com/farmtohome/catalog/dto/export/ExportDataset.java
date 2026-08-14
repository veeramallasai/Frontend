package com.farmtohome.catalog.dto.export;

import java.util.List;

public record ExportDataset(
    String table,
    List<String> columns,
    List<List<Object>> rows
) {
}
