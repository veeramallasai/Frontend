import axios from 'axios';

const defaultExportBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://farmtohome-production-ca90.up.railway.app/api/v1').replace(/\/v1\/?$/, '');
const exportApi = axios.create({
  baseURL: import.meta.env.VITE_EXPORT_API_BASE_URL || (defaultExportBaseUrl ? `${defaultExportBaseUrl}/api` : 'https://farmtohome-production-ca90.up.railway.app/api'),
  timeout: 60000,
});

exportApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

const mimeByFormat = {
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  pdf: 'application/pdf',
};

const extensionByFormat = {
  excel: 'xlsx',
  csv: 'csv',
  pdf: 'pdf',
};

const getDateStamp = () => {
  const parts = new Intl.DateTimeFormat('en-CA', DATE_FORMAT_OPTIONS).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}_${month}_${day}`;
};

const getFallbackFileName = (table, format) => {
  const safeTable = (table || 'dataset').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `${safeTable}_${getDateStamp()}.${extensionByFormat[format]}`;
};

const getFileNameFromHeaders = (headers) => {
  const contentDisposition = headers?.['content-disposition'];
  if (!contentDisposition) {
    return null;
  }

  const match = /filename\*?=(?:UTF-8''|"?)([^";]+)/i.exec(contentDisposition);
  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1].replace(/"/g, '').trim());
};

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const exportService = {
  async exportDataset({ format, table, columns = [], filters = {}, sort = [] }) {
    const response = await exportApi.post(
      `/export/${format}`,
      {
        table,
        columns,
        filters,
        sort,
      },
      {
        responseType: 'blob',
      }
    );

    const contentType = response.headers['content-type'] || mimeByFormat[format];
    const blob = new Blob([response.data], { type: contentType });
    const fallbackFileName = getFallbackFileName(table, format);
    const fileName = getFileNameFromHeaders(response.headers) || fallbackFileName;

    downloadBlob(blob, fileName);
  },
};
