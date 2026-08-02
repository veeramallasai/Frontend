package com.farmtohome.catalog.service;

import com.farmtohome.catalog.dto.export.ExportRequest;

public interface ExportService {

    byte[] exportExcel(ExportRequest request);

    byte[] exportCsv(ExportRequest request);

    byte[] exportPdf(ExportRequest request);
}
