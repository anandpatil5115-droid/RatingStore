import client from '../api/client';

export const listStores = (params) => client.get('/stores', { params });

export const getStore = (id) => client.get(`/stores/${id}`);

export const createStore = (payload) => client.post('/stores', payload);
