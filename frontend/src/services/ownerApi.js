import client from '../api/client';

export const getOwnerDashboard = () => client.get('/store-owner/dashboard');

export const listStoreRatings = (params) => client.get('/store-owner/ratings', { params });
