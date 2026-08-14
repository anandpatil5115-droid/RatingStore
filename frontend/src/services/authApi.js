import client from '../api/client';

export const registerApi = (payload) => client.post('/auth/register', payload);
export const loginApi = (email, password) => client.post('/auth/login', { email, password });
export const logoutApi = () => client.post('/auth/logout');
export const changePasswordApi = (payload) => client.put('/auth/password', payload);
