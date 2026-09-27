import axiosClient from "./axiosClient";

// ---- Realtime heart rate: realtimeHeartRateController.js -> /api/hr ----
// UPDATE: backend sekarang mendukung pagination (page, limit) dan
// membungkus response menjadi { data: [...], pagination: {...} }
// (bukan array polos seperti sebelumnya).
export const getRealtimeHeartRates = (params = {}) =>
  axiosClient.get("/hr", { params });
// params: { user_id, date, start_time, end_time, timezone, page, limit }
// response.data = { data: HeartRate[], pagination: { totalItems, totalPages, currentPage, limit } }

export const getRealtimeHeartRateById = (id) => axiosClient.get(`/hr/${id}`);
export const createRealtimeHeartRate = (payload) => axiosClient.post("/hr", payload);
export const updateRealtimeHeartRate = (id, payload) =>
  axiosClient.put(`/hr/${id}`, payload);
export const deleteRealtimeHeartRate = (id) => axiosClient.delete(`/hr/${id}`);

// ---- Aggregated heart rate: heartRateAggregationController.js -> /api/hr-aggregation ----
// Belum ada update untuk endpoint ini — tetap mengembalikan array polos (bukan
// dibungkus { data, pagination }). Jika backend nanti mengubahnya juga,
// sesuaikan pemanggilnya di HeartHealthPage.
export const getHeartRateAggregations = (params = {}) =>
  axiosClient.get("/hr-aggregation", { params });

export const getHeartRateAggregationById = (id) =>
  axiosClient.get(`/hr-aggregation/${id}`);
export const createHeartRateAggregation = (payload) =>
  axiosClient.post("/hr-aggregation", payload);
export const updateHeartRateAggregation = (id, payload) =>
  axiosClient.put(`/hr-aggregation/${id}`, payload);
export const deleteHeartRateAggregation = (id) =>
  axiosClient.delete(`/hr-aggregation/${id}`);
