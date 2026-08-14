import client from '../api/client';

export const submitRating = (storeId, rating) => client.post(`/stores/${storeId}/ratings`, { rating });

export const updateRating = (storeId, rating) => client.put(`/stores/${storeId}/ratings`, { rating });
