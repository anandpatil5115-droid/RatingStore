import client from '../api/client';

export const getMe = () => client.get('/users/me');

export const listUsers = (params) => client.get('/users', { params });

export const getUser = (id) => client.get(`/users/${id}`);

export const createUser = (payload) => client.post('/users', payload);
