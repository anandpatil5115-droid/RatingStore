import client from '../api/client';

export const getAdminDashboard = () => client.get('/admin/dashboard');
