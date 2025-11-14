<?php
/**
 * File utilitas untuk plugin Umroh Manager.
 *
 * Catatan: Ini adalah file yang dibuat untuk memperbaiki error TypeError.
 * Fungsi asli 'umh_check_api_permission' telah diperbaiki.
 *
 * UPDATE 2:
 * Menambahkan fungsi 'umh_is_super_admin()' yang hilang
 * (yang menyebabkan "Call to undefined function" error di file lain).
 * Logika pemeriksaan super admin dipindahkan ke fungsi baru ini.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! function_exists( 'umh_is_super_admin' ) ) {
	/**
	 * Memeriksa apakah pengguna saat ini adalah Super Admin.
	 * Fungsi ini dibuat untuk memperbaiki error "Call to undefined function umh_is_super_admin()"
	 *
	 * @return bool True jika super admin, false jika bukan.
	 */
	function umh_is_super_admin() {
		// 1. Periksa izin standar Administrator WordPress ('manage_options')
		// Ini adalah cara standar dan terbaik.
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		// 2. Periksa PENGGUNA SAAT INI (Workaround/Jalan Lain)
		$user = wp_get_current_user();
		
		if ( $user && $user->ID != 0 ) {
			// Ambil SEMUA role/peran yang dimiliki pengguna ini
			$roles = (array) $user->roles;
			
			// Periksa apakah 'super_admin' ATAU 'administrator' ada di dalam daftar role pengguna
			if ( in_array( 'super_admin', $roles, true ) || in_array( 'administrator', $roles, true ) ) {
				return true; // Izinkan jika role-nya super_admin atau administrator
			}
		}

		// 3. Jika tidak ada izin di atas, tolak.
		return false;
	}
}


/**
 * Memeriksa izin API untuk endpoint kustom Umroh Manager.
 *
 * PERBAIKAN:
 * Sekarang menggunakan fungsi 'umh_is_super_admin' yang baru
 * untuk memusatkan logika pemeriksaan izin.
 *
 * @param WP_REST_Request|mixed $request Object request dari WordPress REST API.
 * @return bool|WP_Error True jika diizinkan, false atau WP_Error jika ditolak.
 */
function umh_check_api_permission( $request ) {
    
    // Memanggil fungsi pemeriksaan super admin yang terpusat.
    return umh_is_super_admin();

}

// CATATAN PENTING:
// File ini sekarang mendefinisikan 'umh_is_super_admin()'
// yang seharusnya memperbaiki error fatal di 'umroh-manager-hybrid.php'.

?>