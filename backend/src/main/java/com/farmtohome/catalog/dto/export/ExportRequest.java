package com.farmtohome.catalog.dto.export;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExportRequest {

    private String table;
    private List<String> columns = new ArrayList<>();
    private Map<String, Object> filters = new HashMap<>();
    private List<SortRequest> sort = new ArrayList<>();

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public List<String> getColumns() {
        return columns;
    }

    public void setColumns(List<String> columns) {
        this.columns = columns == null ? new ArrayList<>() : columns;
    }

    public Map<String, Object> getFilters() {
        return filters;
    }

    public void setFilters(Map<String, Object> filters) {
        this.filters = filters == null ? new HashMap<>() : filters;
    }

    public List<SortRequest> getSort() {
        return sort;
    }

    public void setSort(List<SortRequest> sort) {
        this.sort = sort == null ? new ArrayList<>() : sort;
    }
}
