import axios from 'axios';
import { io } from 'socket.io-client';
export const API_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/$/,'');
const requestInterceptor = axios.interceptors.request.use(config => {
  if (String(config.url).startsWith('http://localhost:5001/api/')) config.url = config.url.replace('http://localhost:5001', API_URL);
  if (!String(config.url).startsWith(API_URL + '/api/')) return config;
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const institute = localStorage.getItem('instituteScope');
  const detail = /\/auth\/students\/\d+/.test(config.url);
  const excluded = detail || /\/api\/(institutes|auth\/(login|change-initial-password|me|admins))/.test(config.url);
  if (user?.role === 'superadmin' && institute && !excluded) {
    config.params = { institute_id: config.data?.institute_id || institute, ...config.params };
    const plainBody = config.data && Object.getPrototypeOf(config.data) === Object.prototype;
    if (plainBody && !config.data.institute_id) config.data = { ...config.data, institute_id: institute };
  }
  return config;
});
const responseInterceptor = axios.interceptors.response.use(response => response, error => {
  const own = String(error.config?.url).startsWith(API_URL + '/api/');
  const publicAuth = /\/auth\/(login|change-initial-password)$/.test(error.config?.url || '');
  if (own && !publicAuth && localStorage.getItem('token') && (error.response?.status === 401 || error.response?.data?.code === 'ACCOUNT_SUSPENDED')) {
    sessionStorage.setItem('loginNotice', error.response?.data?.error || 'Please sign in again.');
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('instituteScope');
    window.location.assign('/login');
  }
  return Promise.reject(error);
});
if (import.meta.hot) import.meta.hot.dispose(() => {
  axios.interceptors.request.eject(requestInterceptor);
  axios.interceptors.response.eject(responseInterceptor);
});
export const api = {
  get: (path, config) => axios.get(API_URL + '/api' + path, config),
  post: (path, body, config) => axios.post(API_URL + '/api' + path, body, config),
  put: (path, body, config) => axios.put(API_URL + '/api' + path, body, config),
  delete: path => axios.delete(API_URL + '/api' + path),
};
export function connectSocket() {
  const socket = io(API_URL || window.location.origin, { auth: callback => callback({ token: localStorage.getItem('token') }) });
  socket.on('disconnect', reason => {
    if (reason === 'io server disconnect') api.get('/auth/me').then(() => socket.connect()).catch(() => {});
  });
  socket.on('connect_error', error => {
    if (error.data?.code === 'ACCOUNT_SUSPENDED') api.get('/auth/me').catch(() => {});
  });
  return socket;
}
export async function downloadReport(type, params = {}) {
  const { data } = await api.get('/reports/' + type + '.pdf', { params, responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'smartbus-' + type + '.pdf'; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
