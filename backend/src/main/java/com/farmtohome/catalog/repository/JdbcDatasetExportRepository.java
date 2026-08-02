package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.dto.export.ExportDataset;
import com.farmtohome.catalog.dto.export.ExportRequest;
import com.farmtohome.catalog.dto.export.SortRequest;
import com.farmtohome.catalog.exception.ExportException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDatasetExportRepository implements DatasetExportRepository {

    private static final Pattern SAFE_IDENTIFIER = Pattern.compile("^[A-Za-z_][A-Za-z0-9_]*$");

    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public JdbcDatasetExportRepository(NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @Override
    public ExportDataset fetchDataset(ExportRequest request) {
        String table = normalizeIdentifier(request.getTable(), "Table name is required");
        ensureTableExists(table);

        List<String> availableColumns = fetchTableColumns(table);
        if (availableColumns.isEmpty()) {
            throw new ExportException("No columns found for table: " + table);
        }

        List<String> selectedColumns = resolveSelectedColumns(request.getColumns(), availableColumns);
        String selectClause = selectedColumns.stream().map(this::quote).reduce((a, b) -> a + ", " + b).orElse("*");

        MapSqlParameterSource params = new MapSqlParameterSource();
        StringBuilder sql = new StringBuilder("SELECT ").append(selectClause).append(" FROM ").append(quote(table));

        String whereClause = buildWhereClause(request.getFilters(), availableColumns, params);
        if (!whereClause.isBlank()) {
            sql.append(" WHERE ").append(whereClause);
        }

        String orderClause = buildOrderClause(request.getSort(), availableColumns);
        if (!orderClause.isBlank()) {
            sql.append(" ORDER BY ").append(orderClause);
        }

        List<Map<String, Object>> rawRows = namedJdbcTemplate.queryForList(sql.toString(), params);
        List<List<Object>> rows = mapRows(rawRows, selectedColumns);

        return new ExportDataset(table, selectedColumns, rows);
    }

    private List<List<Object>> mapRows(List<Map<String, Object>> rawRows, List<String> selectedColumns) {
        List<List<Object>> rows = new ArrayList<>();
        for (Map<String, Object> rawRow : rawRows) {
            Map<String, Object> caseInsensitive = new LinkedHashMap<>();
            rawRow.forEach((k, v) -> caseInsensitive.put(k.toLowerCase(Locale.ROOT), v));

            List<Object> row = new ArrayList<>(selectedColumns.size());
            for (String column : selectedColumns) {
                row.add(caseInsensitive.get(column.toLowerCase(Locale.ROOT)));
            }
            rows.add(row);
        }
        return rows;
    }

    private String buildWhereClause(
        Map<String, Object> filters,
        List<String> availableColumns,
        MapSqlParameterSource params
    ) {
        if (filters == null || filters.isEmpty()) {
            return "";
        }

        List<String> parts = new ArrayList<>();
        int index = 0;

        for (Map.Entry<String, Object> entry : filters.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }

            String column = normalizeIdentifier(entry.getKey(), "Invalid filter column");
            ensureColumnExists(column, availableColumns);

            String paramName = "f" + index;
            Object value = entry.getValue();

            if (value instanceof Collection<?> collection) {
                if (collection.isEmpty()) {
                    index++;
                    continue;
                }
                parts.add(quote(column) + " IN (:" + paramName + ")");
                params.addValue(paramName, collection);
            } else {
                parts.add(quote(column) + " = :" + paramName);
                params.addValue(paramName, value);
            }

            index++;
        }

        return String.join(" AND ", parts);
    }

    private String buildOrderClause(List<SortRequest> sortRequests, List<String> availableColumns) {
        if (sortRequests == null || sortRequests.isEmpty()) {
            return "";
        }

        List<String> orderParts = new ArrayList<>();
        for (SortRequest sortRequest : sortRequests) {
            if (sortRequest == null || sortRequest.column() == null || sortRequest.column().isBlank()) {
                continue;
            }

            String column = normalizeIdentifier(sortRequest.column(), "Invalid sort column");
            ensureColumnExists(column, availableColumns);

            String direction = "DESC".equalsIgnoreCase(sortRequest.direction()) ? "DESC" : "ASC";
            orderParts.add(quote(column) + " " + direction);
        }

        return String.join(", ", orderParts);
    }

    private List<String> resolveSelectedColumns(List<String> requestedColumns, List<String> availableColumns) {
        if (requestedColumns == null || requestedColumns.isEmpty()) {
            return availableColumns;
        }

        List<String> resolved = new ArrayList<>();
        for (String requested : requestedColumns) {
            String column = normalizeIdentifier(requested, "Invalid column in selection");
            ensureColumnExists(column, availableColumns);
            resolved.add(column);
        }

        return resolved;
    }

    private void ensureTableExists(String table) {
        Integer count = namedJdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = :table
            """,
            new MapSqlParameterSource("table", table.toLowerCase(Locale.ROOT)),
            Integer.class
        );

        if (count == null || count == 0) {
            throw new ExportException("Table not found: " + table);
        }
    }

    private List<String> fetchTableColumns(String table) {
        return namedJdbcTemplate.queryForList(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = :table
            ORDER BY ordinal_position
            """,
            new MapSqlParameterSource("table", table.toLowerCase(Locale.ROOT)),
            String.class
        );
    }

    private void ensureColumnExists(String column, List<String> availableColumns) {
        boolean exists = availableColumns.stream().anyMatch(c -> c.equalsIgnoreCase(column));
        if (!exists) {
            throw new ExportException("Column not found in table: " + column);
        }
    }

    private String normalizeIdentifier(String identifier, String errorMessage) {
        String normalized = Objects.requireNonNullElse(identifier, "").trim();
        if (!SAFE_IDENTIFIER.matcher(normalized).matches()) {
            throw new ExportException(errorMessage + ": " + identifier);
        }
        return normalized;
    }

    private String quote(String identifier) {
        return "\"" + identifier + "\"";
    }
}
