import axiosClient from "./axiosClient";

// Mapping ke demographicController.js / demographicRoutes.js -> /api/demographic
// Fields: user_id, check_date, date_of_birth, gender(Male|Female), age,
// height(cm), weight(kg), bmi, blood_sugar?(mg/dL), cholesterol?(mg/dL)
// GET all melakukan LEFT JOIN ke users, jadi row berisi juga field "name".

export const getDemographics = (params = {}) =>
  axiosClient.get("/demographic", { params });
// params: { user_id, date, start_date, end_date }

export const getDemographicById = (id) => axiosClient.get(`/demographic/${id}`);
export const createDemographic = (payload) => axiosClient.post("/demographic", payload);
export const updateDemographic = (id, payload) =>
  axiosClient.put(`/demographic/${id}`, payload);
export const deleteDemographic = (id) => axiosClient.delete(`/demographic/${id}`);

export const GENDER_OPTIONS = ["Male", "Female"];
