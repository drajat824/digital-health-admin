import axiosClient from "./axiosClient";

// Backend: authController.js sekarang juga punya getAllUsers & deleteUser.
// CATATAN: file authRoutes.js terbaru tidak diberikan ulang, jadi path di bawah
// ("/auth/users") adalah ASUMSI mengikuti pola REST dari authRoutes.js versi
// sebelumnya (yang mount register/login di bawah /api/auth). Jika path asli di
// backend Anda berbeda, sesuaikan konstanta di bawah ini saja.
const USERS_PATH = "/auth/users";

export const login = (payload) => axiosClient.post("/auth/login", payload);

export const register = (payload) => axiosClient.post("/auth/register", payload);

// getAllUsers mengecualikan admin (WHERE role != 'admin') dan tidak
// mengembalikan password — sesuai authController.getAllUsers.
export const getAllUsers = () => axiosClient.get(USERS_PATH);

export const deleteUser = (id) => axiosClient.delete(`${USERS_PATH}/${id}`);
