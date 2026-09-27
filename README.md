# Digital Health — Admin Dashboard

Admin dashboard (ReactJS + Vite) untuk **Digital Health**. Dokumen ini mencakup versi
**revisi ke-2**: Manajemen User pakai endpoint asli (list + delete), struktur navigasi
`Manajemen User → pilih user → Manajemen Medis` (4 sub-halaman per user_id), API
heart rate realtime & medication schedule mengikuti kontrak backend terbaru,
`periodic_checks` dihapus total, dan 2 fitur baru: **Demografi** & **Dokumen Rekam
Medis (upload file)**.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Letakkan model 3D di `public/models/heart.glb`.

---

## Ringkasan Perubahan di Revisi Ini

### 1. Manajemen User (dulu: derivasi dari data lain -> sekarang: endpoint asli)
- `GET` daftar user & `DELETE` user sekarang pakai `authController.getAllUsers` /
  `deleteUser`. **Catatan penting**: `authRoutes.js` versi terbaru tidak
  disertakan dalam revisi ini, jadi path endpoint (`/api/auth/users`,
  `/api/auth/users/:id`) di `src/api/authApi.js` adalah **asumsi** mengikuti pola
  REST dari `authRoutes.js` versi sebelumnya. **Sesuaikan `USERS_PATH` di
  `src/api/authApi.js` jika path asli backend Anda berbeda.**
- `getAllUsers` mengecualikan akun admin (`WHERE role != 'admin'`) dan tidak
  mengirim password — form "Tambah User" tetap pakai `POST /api/auth/register`
  (tidak berubah).
- Delete user disertai confirmation dialog.

### 2. Medication Schedule — PUT terbaru
- `updateSchedule` di backend sekarang menerima update **menyeluruh**:
  `medication_id`, `schedule_date`, `status`, `takenAt`, `late` — bukan cuma
  `status` seperti sebelumnya. Field yang tidak dikirim dipertahankan nilai
  lamanya oleh backend.
- Form edit jadwal di halaman **Obat & Jadwal** sekarang menyediakan semua field
  tersebut (bukan cuma dropdown status seperti revisi sebelumnya).

### 3. Struktur navigasi: Manajemen User -> Manajemen Medis
```
/admin/users                              -> daftar user (list + delete)
/admin/users/:userId                      -> detail user + kartu menu Manajemen Medis
/admin/users/:userId/medical              -> layout tab, redirect ke heart-health
/admin/users/:userId/medical/heart-health -> Kesehatan Jantung
/admin/users/:userId/medical/medications  -> Obat & Jadwal
/admin/users/:userId/medical/health-records -> Rekam Kesehatan (demografi + dokumen)
/admin/users/:userId/medical/heart-model  -> Model 3D Jantung (read-only)
```
Seluruh request di 4 sub-halaman tersebut memakai `user_id` dari URL — admin
tidak bisa melihat data user lain secara tidak sengaja.
Karena backend tidak punya `GET /api/auth/users/:id` (single), detail user
diambil dari state navigasi (dikirim saat klik dari list) dengan fallback
mengambil `getAllUsers()` lalu memfilter, jika halaman dibuka langsung/direfresh
(lihat `src/hooks/useUserRecord.js`).

### 4. Dashboard — grafik dipisah
Heart Rate Realtime dan Heart Rate Agregasi sekarang jadi **2 chart terpisah**,
tidak lagi digabung. Total user di kartu statistik sekarang **data asli** dari
`GET /api/auth/users` (sebelumnya cuma estimasi).

### 5. `periodic_checks` — dihapus total
Sesuai instruksi, seluruh implementasi periodic check dihapus: `periodicCheckApi.js`,
halaman, dan referensinya di Dashboard/README versi sebelumnya. Fungsinya kini
digantikan oleh fitur **Demografi** (lebih lengkap: ada gender, usia, BMI, dll).

### 6. Heart Rate Realtime — response berubah (pagination)
`GET /api/hr` sekarang mengembalikan:
```json
{ "data": [...], "pagination": { "totalItems": 0, "totalPages": 0, "currentPage": 1, "limit": 30 } }
```
(sebelumnya array polos). Frontend disesuaikan (`src/api/heartRateApi.js`,
dipakai di `HeartHealthPage.jsx` & `Dashboard.jsx`) untuk membaca `res.data.data`
dan `res.data.pagination`, plus kontrol halaman Sebelumnya/Berikutnya di halaman
Kesehatan Jantung.
**`GET /api/hr-aggregation` belum diberi update serupa** — masih diperlakukan
sebagai array polos. Jika backend mengubahnya juga nanti, sesuaikan
`getHeartRateAggregations` pemanggilnya.

### 7. Fitur baru: Demografi
`src/api/demographicApi.js` + bagian atas halaman **Rekam Kesehatan**. CRUD penuh
sesuai `demographicController.js`/`demographicRoutes.js` — field: `check_date`,
`date_of_birth`, `gender` (Male/Female), `age`, `height`, `weight`, `bmi`,
`blood_sugar?`, `cholesterol?`. Form otomatis menghitung BMI dari TB/BB saat
kedua field itu diisi (bisa diedit manual).

### 8. Fitur baru: Dokumen Rekam Medis (upload file)
`src/api/medicalRecordApi.js` + bagian bawah halaman **Rekam Kesehatan**. CRUD
dengan **3 file opsional** per entri: `lab_result`, `medical_image`, `diagnosis`
(multipart/form-data ke `POST`/`PUT /api/medical-records`, sesuai Multer di
backend). Link "Lihat File" memakai `GET /api/medical-records/view?path=...`.

**Catatan teknis penting**: link "Lihat File" dibuka langsung sebagai `<a href>`
ke URL backend (tab baru), **bukan** lewat axios — sehingga tidak membawa header
`Authorization` dari localStorage. Ini aman untuk saat ini karena tidak ada
middleware auth pada route manapun yang diberikan (lihat gap #2 di bawah), tapi
jika backend menambahkan proteksi token khusus di endpoint `/view` nanti, link
ini perlu diganti jadi `fetch` manual + header Authorization +
`URL.createObjectURL`.

Saat edit, jika field file dibiarkan kosong, file lama **dipertahankan** (sesuai
perilaku `updateMedicalRecord` di backend) — bukan terhapus.

---

## Gap Backend yang Masih Berlaku

| # | Gap | Status | Dampak |
|---|-----|--------|--------|
| 1 | `authRoutes.js` terbaru tidak diberikan | Baru | Path `GET/DELETE /api/auth/users(/:id)` di `authApi.js` adalah asumsi — verifikasi & sesuaikan jika berbeda. |
| 2 | Tidak ada middleware auth/role-check di route manapun | Masih berlaku | Proteksi admin murni di sisi client. Endpoint API sebenarnya masih bisa diakses tanpa token. |
| 3 | Tidak ada `GET /api/auth/users/:id` (single) | Baru | Detail user diambil dari state navigasi + fallback filter dari list; jika user dihapus lewat sesi lain, halaman detail bisa gagal load. |
| 4 | `medical_records` — tidak ada endpoint hapus file fisik terpisah | Baru | Delete record hanya hapus baris DB; file lama bisa tertinggal di server. |
| 5 | `heart_rates_aggregation` belum ikut diberi pagination | Baru | Chart Agregasi di-cap tampilkan 30 data terbaru di sisi frontend (tidak true pagination). |
| 6 | `heart_issues.issue_type` enum hanya `TAKIKARDIA`/`BRADIKARDIA` | Masih berlaku | Tidak berubah dari revisi sebelumnya. |
| 7 | `medications`/`medication_schedules` CASCADE delete | Tidak berubah | Hapus obat akan ikut menghapus jadwal terkait (FK CASCADE) — sudah diberi peringatan di confirmation dialog. |

---

## Struktur Proyek (setelah revisi)

```
src/
  api/
    authApi.js                 # login, register, getAllUsers, deleteUser
    heartRateApi.js             # realtime (paginated) + aggregation
    heartIssueApi.js
    medicationApi.js
    medicationScheduleApi.js    # PUT sekarang full update
    demographicApi.js           # BARU
    medicalRecordApi.js         # BARU (multipart file upload)
  hooks/
    useUserRecord.js            # BARU - resolve user by id (state atau fallback fetch)
  components/
    layout/
      AdminLayout.jsx
      MedicalLayout.jsx         # BARU - tab nav 4 sub-halaman medis per user
      Sidebar.jsx, Topbar.jsx
    common/                     # Modal, ConfirmDialog, States, UI primitives
    Heart3DViewer.jsx
  pages/
    Auth/Login.jsx
    Dashboard.jsx                # grafik realtime & agregasi terpisah
    Users/
      UsersList.jsx              # BARU - list asli + delete
      UserDetail.jsx             # BARU - profil + menu Manajemen Medis
    Medical/
      HeartHealthPage.jsx         # BARU
      MedicationsSchedulePage.jsx # BARU
      HealthRecordsPage.jsx       # BARU - demografi + dokumen rekam medis
      HeartModelSubPage.jsx       # BARU
    Profile/ProfilePage.jsx
```

Halaman/fitur lama yang **dihapus** di revisi ini: `pages/Patients/*`,
`pages/Medications/*` (berdiri sendiri), `pages/MedicationSchedules/*` (berdiri
sendiri), `pages/HeartRate/*` (berdiri sendiri), `pages/HeartIssues/*` (berdiri
sendiri), `pages/PeriodicChecks/*`, `pages/HeartModel/*` (berdiri sendiri),
`components/common/CrudPageShell.jsx`, `components/common/DataTable.jsx` (tidak
lagi dipakai). Semua fungsinya sudah dipindah/diganti oleh struktur nested di
atas.
