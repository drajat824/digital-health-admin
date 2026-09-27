import axiosClient from "./axiosClient";

// Mapping ke medicationController.js / medicationRoutes.js
// Fields: user_id, generic_name, brand_name, dosage_form, strength, route, meal_relation

export const getMedications = (params = {}) =>
  axiosClient.get("/medications", { params }); // params: { user_id }

export const getMedicationById = (id) => axiosClient.get(`/medications/${id}`);

export const createMedication = (payload) => axiosClient.post("/medications", payload);

export const updateMedication = (id, payload) =>
  axiosClient.put(`/medications/${id}`, payload);

export const deleteMedication = (id) => axiosClient.delete(`/medications/${id}`);

export const ROUTE_OPTIONS = [
  "oral",
  "topical",
  "sublingual",
  "intravenous",
  "intramuscular",
  "subcutaneous",
  "rectal",
  "inhalation",
];

export const MEAL_RELATION_OPTIONS = [
  "before_meal",
  "with_meal",
  "after_meal",
  "any_time",
];
