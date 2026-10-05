import axiosClient from "./axiosClient";

// Mapping ke medicalRecordController.js / medicalRecordRoutes.js -> /api/medical-records
// Endpoint ini pakai multipart/form-data (Multer) dengan 3 field file opsional:
// lab_result, medical_image, diagnosis. Field lain: user_id, check_date.
// GET all melakukan LEFT JOIN ke users (field "name" ikut, tapi kita tetap
// filter/scope by user_id di halaman per-pasien).

export const getMedicalRecords = (params = {}) =>
  axiosClient.get("/medical-records", { params });
// params: { user_id, date, start_time, end_time, timezone }

export const getMedicalRecordById = (id) => axiosClient.get(`/medical-records/${id}`);

// files: { lab_result?: File, medical_image?: File, diagnosis?: File }
const buildFormData = ({ user_id, check_date, files = {} }) => {
  const fd = new FormData();
  fd.append("user_id", user_id);
  if (check_date) fd.append("check_date", check_date);
  if (files.lab_result) fd.append("lab_result", files.lab_result);
  if (files.medical_image) fd.append("medical_image", files.medical_image);
  if (files.diagnosis) fd.append("diagnosis", files.diagnosis);
  return fd;
};

// Content-Type multipart + boundary di-set OTOMATIS oleh axios karena kita
// mengirim instance FormData (lihat catatan di axiosClient.js) — jangan
// set header Content-Type manual di sini.
export const createMedicalRecord = ({ user_id, check_date, files }) =>
  axiosClient.post("/medical-records", buildFormData({ user_id, check_date, files }));

// PENTING: sesuai medicalRecordController.updateMedicalRecord, file yang tidak
// disertakan pada update akan TETAP menggunakan file lama (tidak terhapus).
export const updateMedicalRecord = (id, { user_id, check_date, files }) =>
  axiosClient.put(`/medical-records/${id}`, buildFormData({ user_id, check_date, files }));

export const deleteMedicalRecord = (id) => axiosClient.delete(`/medical-records/${id}`);

// Backend menyimpan path relatif seperti "../file/1/lab_result-xxx.pdf" dan
// menyajikannya lewat GET /api/medical-records/view?path=<path>.
// Catatan: endpoint ini dibuka langsung di tab baru (bukan lewat axios), jadi
// TIDAK membawa header Authorization dari localStorage. Ini aman untuk saat
// ini karena tidak ada middleware auth pada route yang diberikan, tapi jika
// backend menambahkan proteksi token di endpoint ini nanti, link ini perlu
// diubah menjadi fetch dengan header Authorization lalu di-blob-kan.
export const getFileViewUrl = (filePath) => {
  const base = (import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "");
  return `${base}/medical-records/view?path=${encodeURIComponent(filePath)}`;
};
