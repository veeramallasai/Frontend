package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.dto.export.ExportRequest;
import com.farmtohome.catalog.service.ExportService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy_MM_dd");

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcelByTable(@RequestParam String table) {
        ExportRequest request = createSimpleRequest(table);
        return buildResponse(
            exportService.exportExcel(request),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            buildFileName(table, "xlsx")
        );
    }

    @PostMapping("/excel")
    public ResponseEntity<byte[]> exportExcel(@RequestBody ExportRequest request) {
        return buildResponse(
            exportService.exportExcel(request),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            buildFileName(request.getTable(), "xlsx")
        );
    }

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsvByTable(@RequestParam String table) {
        ExportRequest request = createSimpleRequest(table);
        return buildResponse(exportService.exportCsv(request), "text/csv", buildFileName(table, "csv"));
    }

    @PostMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestBody ExportRequest request) {
        return buildResponse(exportService.exportCsv(request), "text/csv", buildFileName(request.getTable(), "csv"));
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdfByTable(@RequestParam String table) {
        ExportRequest request = createSimpleRequest(table);
        return buildResponse(exportService.exportPdf(request), MediaType.APPLICATION_PDF_VALUE, buildFileName(table, "pdf"));
    }

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody ExportRequest request) {
        return buildResponse(
            exportService.exportPdf(request),
            MediaType.APPLICATION_PDF_VALUE,
            buildFileName(request.getTable(), "pdf")
        );
    }

    private ExportRequest createSimpleRequest(String table) {
        ExportRequest request = new ExportRequest();
        request.setTable(table);
        request.setColumns(List.of());
        return request;
    }

    private ResponseEntity<byte[]> buildResponse(byte[] payload, String contentType, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        headers.setCacheControl("no-cache, no-store, must-revalidate");

        return ResponseEntity.ok()
            .headers(headers)
            .contentLength(payload.length)
            .body(payload);
    }

    private String buildFileName(String table, String extension) {
        String safeTable = table == null || table.isBlank() ? "dataset" : table.trim().toLowerCase();
        String date = LocalDate.now().format(FILE_DATE_FORMAT);
        return safeTable + "_" + date + "." + extension;
    }
}
