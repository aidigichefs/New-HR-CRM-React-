const rawApiBase = import.meta.env.VITE_API_BASE_URL || '/hr/new-api';

export const API_BASE_URL = rawApiBase.replace(/\/+$/, '');
export const CRM_BASE_URL = API_BASE_URL.replace(/\/new-api$/, '');

export function apiUrl(path) {
    return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

export function crmAssetUrl(path) {
    return `${CRM_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
