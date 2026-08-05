# 🌾 Agro-Procure 

Selamat datang di **Agro-Procure**, sebuah platform *Smart Procurement* berbasis Artificial Intelligence yang dirancang khusus untuk mempermudah restoran, hotel, dan bisnis kuliner dalam mencari, menawar, dan mengelola pasokan bahan baku dari para petani/vendor secara otomatis melalui WhatsApp.

Sistem ini didukung oleh **Gemini AI** yang dapat melakukan negosiasi pintar, memahami penawaran sebagian (partial fulfillment), dan mencari alternatif vendor terbaik berdasarkan kedekatan lokasi dan *fulfillment score*.

---

## 📚 Tutorial Penggunaan Lengkap

Ikuti langkah-langkah di bawah ini untuk mulai menggunakan Agro-Procure dari awal hingga berhasil melakukan pemesanan otomatis.

### 1. 🔐 Login & Autentikasi
Sistem ini membatasi akses hanya untuk pengguna yang berwenang.
1. Buka halaman utama aplikasi. Anda akan langsung diarahkan ke halaman **Login**.
2. Masukkan kredensial admin Anda (Email dan Password).
3. Klik tombol **Sign In**.
4. Setelah berhasil login, Anda akan diarahkan ke **Dashboard Utama** yang berisi ringkasan statistik (Total Orders, Active Vendors, dll).

### 2. 📍 Menambahkan Alamat Restoran
Sebelum membuat pesanan, pastikan Anda telah mengatur alamat pengiriman (alamat restoran) agar AI dapat menghitung jarak (distance penalty) untuk memilih vendor terdekat.
1. Pada menu di sebelah kiri (Sidebar), klik **Settings**.
2. Pilih tab **Restaurant Profile**.
3. Di bagian **Addresses**, klik tombol **+ Add New Address**.
4. Isi kelengkapan alamat restoran Anda dengan detail (Jalan, Kota, Provinsi). *Sangat disarankan untuk memasukkan nama provinsi di akhir alamat (misal: "Kota Bogor, Jawa Barat") agar AI lebih akurat.*
5. Centang **"Set as Default Address"** jika ini adalah alamat utama Anda.
6. Klik **Save Changes**.

### 3. 👥 Menambahkan Vendor (Petani/Pemasok)
Anda perlu mendaftarkan vendor yang nantinya akan dihubungi oleh AI untuk negosiasi pasokan.
1. Pada menu navigasi kiri, klik **Vendors**.
2. Anda akan melihat **Vendor Directory**. Klik tombol **+ Add New Vendor** di sudut kanan atas.
3. Isi formulir pendaftaran vendor:
   - **Name**: Nama petani/vendor (contoh: Pak Dengklek).
   - **WhatsApp Number**: Nomor WA yang aktif (wajib diawali `62` atau `08`). AI akan mengirim pesan negosiasi ke nomor ini.
   - **Commodities**: Ketik komoditas yang dijual oleh vendor ini (contoh: `Daging Ayam`, `Bawang Merah`, `Beras`). Tekan *Enter* setiap selesai mengetik satu komoditas.
   - **Address**: Masukkan alamat lengkap vendor (contoh: "Subang, Jawa Barat"). *Ini penting agar sistem bisa menghitung kedekatan lokasi.*
4. Klik **Register Vendor**. Vendor kini akan muncul di direktori Anda dengan status *ACTIVE*.

### 4. 📱 Menautkan WhatsApp Bot
Agar AI dapat mengirim dan membalas pesan ke para vendor, Anda perlu menautkan WhatsApp Anda (sebagai pengirim/bot) ke dalam sistem.
1. Pada menu navigasi kiri, klik **WhatsApp Bot**.
2. Jika bot belum terhubung, Anda akan melihat sebuah **QR Code** di layar.
3. Buka aplikasi WhatsApp di HP Anda (gunakan nomor khusus yang akan dijadikan bot admin).
4. Pilih menu **Tautkan Perangkat (Linked Devices)**.
5. Pindai/Scan **QR Code** yang ada di layar monitor.
6. Tunggu beberapa detik. Status di layar akan berubah menjadi **CONNECTED** dengan warna hijau. Bot Anda kini siap bekerja 24/7!

### 5. 🛒 Membuat Pesanan & Memulai Negosiasi AI
Sekarang saatnya menyuruh AI bekerja mencari pasokan bahan baku.
1. Pada menu navigasi kiri, klik **Orders**.
2. Klik tombol **+ Create Order** di kanan atas.
3. Isi detail kebutuhan Anda:
   - **Item Name**: Nama barang (contoh: `Daging Ayam`). *Pastikan nama ini cocok dengan komoditas yang dimiliki vendor.*
   - **Total Quantity**: Jumlah yang dibutuhkan (contoh: `125`).
   - **Unit**: Satuan ukur (contoh: `Ekor` atau `Kg`).
   - **Max Price (HET)**: Harga maksimal per satuan (Harga Eceran Tertinggi) yang bersedia Anda bayar. AI tidak akan menyetujui jika harga vendor di atas ini.
   - **Delivery Address**: Pilih alamat restoran yang telah Anda buat di langkah 2.
4. Klik **Create Order**.
5. Anda akan diarahkan ke halaman **Order Details**. Status pesanan saat ini adalah `DRAFT`.
6. Untuk menyuruh AI mulai bekerja, klik tombol **"Cari Vendor (AI)"** berwarna biru.
7. AI akan secara pintar mensortir vendor berdasarkan komoditas, jarak, dan skor. AI lalu akan **mengirim pesan WhatsApp** ke vendor peringkat pertama secara otomatis. Status akan berubah menjadi `On Negotiation`.

### 6. 🤖 Cara Kerja AI dalam Negosiasi (Otomatis)
Setelah pesan terkirim, Anda cukup bersantai dan membiarkan AI yang membalas WhatsApp vendor.
- **Kasus 1 (Diterima Penuh)**: Jika vendor membalas menyanggupi seluruh pesanan (contoh: "Iya saya sanggup 125 ekor harganya 50.000"), AI akan langsung menyetujuinya, mengabarkan vendor bahwa pesanan deal, dan status di Dashboard berubah menjadi `ACCEPTED`.
- **Kasus 2 (Diterima Sebagian / Kemahalan)**: Jika vendor hanya sanggup sebagian (contoh: "Saya cuma ada 75 ekor harganya 70.000"), AI akan merespons vendor: *"Baik, penawaran sebagian sejumlah 75 sedang kami teruskan ke manajemen untuk ditinjau."* 
  - Status vendor ini di Dashboard menjadi `NEEDS_REVIEW` (Butuh Keputusan Anda: *Deal* atau *Batal*).
  - **Sistem akan langsung mencari vendor peringkat kedua** untuk menutupi sisa kekurangan (50 ekor) dan langsung menge-chat vendor kedua secara otomatis!

> ⚠️ **Catatan Penting (Waktu Respons AI):** 
> AI mungkin membutuhkan waktu beberapa saat (sekitar **5 hingga 15 menit**) untuk merespons pesan vendor. Hal ini sangat normal dan disebabkan oleh beberapa faktor:
> 1. AI (Gemini) harus "berpikir" dan menyusun kalimat balasan yang natural serta sesuai dengan konteks percakapan.
> 2. Keterbatasan server *free-tier* pada Vercel/Railway yang terkadang mengalami *Cold Start* (server tidur saat tidak ada request) sehingga butuh waktu ekstra untuk bangun.
> Mohon untuk tidak mengirim pesan berulang-ulang, sistem pasti akan merespons setelah AI selesai berpikir.

### 7. 🚚 Pengiriman & Penyelesaian Pesanan
Setelah negosiasi selesai dan Anda mendapatkan vendor yang tepat:
1. Di halaman Order Details, jika status sudah `ACCEPTED`, Anda dapat mengubah statusnya ke tahap selanjutnya.
2. Klik tombol **"Update to On Delivery"** ketika vendor mengonfirmasi bahwa barang sedang dikirim.
3. Setelah barang tiba di restoran dan dicek kelengkapannya, klik tombol **"Mark as Completed"**.
4. Selesai! Pesanan telah sukses dipenuhi. Skor performa vendor akan otomatis meningkat jika transaksi lancar.

---

*Terima kasih telah menggunakan Agro-Procure. Smart procurement starts here!* 🚀
