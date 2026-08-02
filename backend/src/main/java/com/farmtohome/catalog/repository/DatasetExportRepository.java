package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.dto.export.ExportDataset;
import com.farmtohome.catalog.dto.export.ExportRequest;

public interface DatasetExportRepository {

    ExportDataset fetchDataset(ExportRequest request);
}
