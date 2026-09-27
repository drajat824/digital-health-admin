import axiosClient from "./axiosClient";

// Mapping ke heartIssueController.js / heartIssueRoutes.js -> /api/hr-issues
// DB enum issue_type HANYA 'TAKIKARDIA' | 'BRADIKARDIA' (bukan 3 nilai seperti
// di komentar Swagger yang menyebut 'Aritmia' — DB adalah sumber kebenaran).

export const getHeartIssues = (params = {}) =>
  axiosClient.get("/hr-issues", { params });
// params: { user_id, date, start_time, end_time, timezone }

export const getHeartIssueById = (id) => axiosClient.get(`/hr-issues/${id}`);
export const createHeartIssue = (payload) => axiosClient.post("/hr-issues", payload);
export const updateHeartIssue = (id, payload) =>
  axiosClient.put(`/hr-issues/${id}`, payload);
export const deleteHeartIssue = (id) => axiosClient.delete(`/hr-issues/${id}`);

export const ISSUE_TYPE_OPTIONS = ["TAKIKARDIA", "BRADIKARDIA"];
