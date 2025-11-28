<?php
// Pastikan file ini hanya diakses melalui WordPress
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- 
    FIXED: ID diubah menjadi "umh-app-root" agar sesuai dengan src/index.jsx 
    Added 'tailwind-scope' class for safer styling if needed later.
-->
<div id="umh-app-root" class="umh-wrap tailwind-scope">
    <!-- 
        React akan merender aplikasi di sini.
        Teks di bawah ini akan hilang begitu React berhasil loading.
    -->
    <div style="padding: 20px; text-align: center;">
        <h2>Memuat Sistem Agen...</h2>
        <p>Jika loading tidak selesai, pastikan Anda telah menjalankan `npm run build`.</p>
    </div>
</div>