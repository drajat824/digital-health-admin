import axiosClient from "./axiosClient";

// Mapping ke medicationScheduleController.js / medicationScheduleRoutes.js
// GET all melakukan JOIN ke medications, jadi row hasil sudah berisi
// generic_name, brand_name, dosage_form, strength, route, meal_relation, user_id.

export const getSchedules = (params = {}) =>
  axiosClient.get("/medication-schedules", { params });
// params: { user_id, schedule_date, start_date, end_date, status, timezone }

export const getScheduleById = (id) =>
  axiosClient.get(`/medication-schedules/${id}`);

export const createSchedule = (payload) =>
  axiosClient.post("/medication-schedules", payload);
// payload: { medication_id, schedule_date, status?, takenAt?, late? }

// UPDATE (backend terbaru): PUT sekarang mendukung update MENYELURUH —
// medication_id, schedule_date, status, takenAt, late. Field yang tidak
// dikirim akan dipertahankan nilai lamanya oleh backend (partial update
// didukung di sisi server), jadi payload boleh berisi subset field saja.
export const updateSchedule = (id, payload) =>
  axiosClient.put(`/medication-schedules/${id}`, payload);

export const deleteSchedule = (id) =>
  axiosClient.delete(`/medication-schedules/${id}`);

export const STATUS_OPTIONS = ["pending", "taken", "missed"];
