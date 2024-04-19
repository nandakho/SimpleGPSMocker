# SGM - Simple GPS Mocker
> [!NOTE]
> [Read in English](README.md)
## Apa Ini?
Sebuah apps untuk mengedalikan koordinat GPS Android menggunakan Developer Mock GPS via ADB dengan bantuan [Appium](https://github.com/appium/io.appium.settings)
## Cara Kerja
- Frontend menampilkan peta dengan library Leaflet  
*Catatan: Pengaturan frontend dapat diubah langsung di `./src/app/home/home.page.ts` bagian variabel `settings`*
- Backend dijalankan, secara default di `localhost` port `8888`
- Frontend mengirim command ke backend via POST Request ke `localhost:8888`
- Backend menghubungi ADB Server berisi command untuk set koordinat baru
## Variabel Settings
### appiumId:
Default: `'io.appium.settings'`  
APPID dari aplikasi Appium. Jika Appium dibuild menggunakan custom APPID, silahkan diganti di sini
### offsetKeypress
Default: `0.00001`  
Seberapa jauh offset latitude/longitude saat jalan-jalan pakai keyboard (WASD)
### adbInterval
Default: `2000`  
Interval dalam milisecond. Jika ADB command terpanggil sebelum interval selesai, maka command akan dihiraukan, dan dipanggil kembali setelah interval selesai
### apiUrl
Default: `'http://localhost:8888/adb'`  
Alamat API backend yang terkoneksi dengan ADB server
## Requirements
### Android
- ADB debugging di developer setting sudah aktif, **tidak memerlukan ROOT**
- Terhubung ke PC menggunakan kabel data atau via local network
- Sudah mengizinkan adb debugging ke PC
- Terinstall [Appium](https://github.com/appium/io.appium.settings) dan sudah disetting permissionnya
### PC
- ADB Server aktif
- Web Browser (Didevelop dan diuji dengan Chrome v123)
- Pastikan android sudah terbaca di ADB Server dengan command `adb devices`
## Jalankan
- Install requirements dengan `npm i` di root directory project: `./` dan juga di directory backend: `./backend`
- Pastikan berada di root directory project `./` dan jalankan `npm run all` untuk menjalankan Frontend & Backend  
*Catatan: Command ini dibuat untuk Windows, apabila menggunakan OS lain, harap diadjust sendiri lah ya*
## Kendali
- Klik Kiri (Mouse) di peta: memindahkan lokasi GPS ke koordinat yang diklik
- WASD (Keyboard) di peta: jalan-jalan seperti kendali di game-game pada umumnya gitu
- Tombol `Import Locations` (Kiri Atas): memuat titik koordinat lokasi dari file `.json` (lihat bagian [Location JSON](#location-json) untuk informasi lebih lengkap)
- Position (Kiri Bawah): menampilkan koordinat saat ini, klik untuk reset kamera/view/zoom
## Location JSON
Memuat titik-titik lokasi untuk ditampilkan di peta  
Arahkan cursor ke titik lokasi untuk menampilkan nama lokasinya  
JSON memiliki format seperti ini atau gunakan file [sample_location.json](sample_location.json) sebagai contoh:
```
[
    {
        "name": "Monumen Nasional",
        "lat": -6.1753924,
        "lng": 106.8271528
    },
    {
        "name": "Lokasi kedua",
        "lat": 0,
        "lng": 0
    },
    ...
    {
        "name": "Lokasi terakhir",
        "lat": 0,
        "lng": 0
    }
]
```