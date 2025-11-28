<?php
/**
 * Template untuk merender React App
 * Tidak perlu HTML/Head/Body tag karena ini di-load di dalam environment admin WP.
 * CSS di assets/css/admin-style.css akan menyembunyikan UI WP lainnya.
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- Root Element untuk React -->
<div id="umroh-manager-root">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f4f6;">
        <!-- Loading State awal sebelum React mount -->
        <div style="text-align: center;">
            <svg class="animate-spin" style="height: 3rem; width: 3rem; color: #3b82f6; margin-bottom: 1rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p style="font-family: sans-serif; color: #6b7280;">Memuat Sistem...</p>
        </div>
    </div>
</div>