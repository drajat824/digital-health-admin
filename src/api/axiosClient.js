import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const axiosClient = axios.create({
  baseURL,
});
// CATATAN: sengaja TIDAK set default header Content-Type di sini.
// Axios otomatis memakai "application/json" untuk payload object biasa, dan
// otomatis memakai "multipart/form-data; boundary=..." saat payload berupa
// FormData (dipakai medicalRecordApi.js untuk upload file). Memaksa
// Content-Type "multipart/form-data" secara manual akan menghilangkan
// boundary dan membuat parsing Multer di backend gagal.

// Lampirkan JWT dari login (authController.js) ke setiap request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("dh_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend mengembalikan { error: "..." } atau { message: "..." } pada error
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dh_admin_token");
      localStorage.removeItem("dh_admin_user");
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan pada server";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
