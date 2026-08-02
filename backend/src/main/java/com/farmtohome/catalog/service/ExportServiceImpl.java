package com.farmtohome.catalog.service;

import com.farmtohome.catalog.dto.export.ExportDataset;
import com.farmtohome.catalog.dto.export.ExportRequest;
import com.farmtohome.catalog.exception.ExportException;
import com.farmtohome.catalog.repository.DatasetExportRepository;
import com.farmtohome.catalog.util.CsvExportUtil;
import com.farmtohome.catalog.util.ExcelExportUtil;
import com.farmtohome.catalog.util.PdfExportUtil;
import org.springframework.stereotype.Service;

@Service
public class ExportServiceImpl implements ExportService {

    private final DatasetExportRepository datasetExportRepository;

    public ExportServiceImpl(DatasetExportRepository datasetExportRepository) {
        this.datasetExportRepository = datasetExportRepository;
    }

    @Override
    public byte[] exportExcel(ExportRequest request) {
        ExportDataset dataset = loadDataset(request);
        return ExcelExportUtil.write(dataset);
    }

    @Override
    public byte[] exportCsv(ExportRequest request) {
        ExportDataset dataset = loadDataset(request);
        return CsvExportUtil.write(dataset);
    }

    @Override
    public byte[] exportPdf(ExportRequest request) {
        ExportDataset dataset = loadDataset(request);
        return PdfExportUtil.write(dataset);
    }

    private ExportDataset loadDataset(ExportRequest request) {
        if (request == null || request.getTable() == null || request.getTable().isBlank()) {
            throw new ExportException("Table name is required for export");
        }
        return datasetExportRepository.fetchDataset(request);
    }
}
