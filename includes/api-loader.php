<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Fungsi utama untuk menangani request API
 *
 * @param WP_REST_Request $request Objek request dari WP REST API
 * @param string $endpoint Nama endpoint yang diminta (misal: 'jamaah', 'packages')
 * @return WP_REST_Response|WP_Error
 */
function handle_api_endpoint($request, $endpoint)
{
    $file_path = plugin_dir_path(__DIR__) . 'api/api-' . $endpoint . '.php';

    if (!file_exists($file_path)) {
        return new WP_Error('invalid_endpoint', 'File endpoint API tidak ditemukan.', array('status' => 404));
    }

    require_once $file_path;

    $method = $request->get_method();
    $function_name = '';

    // PERBAIKAN: Menambahkan penanganan untuk method 'OPTIONS'
    // Ini adalah preflight request yang dikirim browser sebelum POST/GET
    // Kita harus merespons dengan sukses (204 No Content) agar request aslinya bisa lanjut.
    if ($method === 'OPTIONS') {
        // Cukup kembalikan response sukses kosong (HTTP 204 No Content)
        return new WP_REST_Response(null, 204);
    } 
    else if ($method === 'POST') {
        // Menentukan fungsi yang akan dipanggil berdasarkan parameter 'action'
        // Contoh: 'create_jamaah', 'update_package', dll.
        $action = $request->get_param('action');
        if (!empty($action)) {
            // Nama fungsi: post_create_jamaah, post_update_jamaah
            $function_name = 'post_' . $action; 
        } else {
            // Fallback jika tidak ada action (mungkin tidak terpakai)
            $function_name = 'post_' . $endpoint; // e.g., post_jamaah
        }
    } 
    else if ($method === 'GET') {
        // Menentukan fungsi GET berdasarkan parameter
        $id = $request->get_param('id');
        if (!empty($id)) {
            $function_name = 'get_' . $endpoint . '_by_id'; // e.g., get_jamaah_by_id
        } else {
            $function_name = 'get_all_' . $endpoint; // e.g., get_all_jamaah
        }
    } 
    else {
        // PERBAIKAN: Ini adalah blok yang sebelumnya menangkap 'OPTIONS'
        // Sekarang ini hanya akan menangkap method lain yang tidak didukung (PUT, DELETE, dll.)
        return new WP_Error('invalid_method', 'Metode request tidak valid.', array('status' => 405));
    }

    // Cek apakah fungsi yang ditentukan ada di file yang di-include
    if (function_exists($function_name)) {
        try {
            // Panggil fungsi yang sesuai
            $response = call_user_func($function_name, $request);
            
            // Pastikan response adalah WP_REST_Response
            if (is_wp_error($response)) {
                return $response;
            }
            // Kirim sebagai JSON sukses
            return new WP_REST_Response($response, 200);

        } catch (Exception $e) {
            // Tangani error internal
            return new WP_Error('internal_error', $e->getMessage(), array('status' => 500));
        }
    } else {
        // Fungsi tidak ditemukan
        return new WP_Error('invalid_action', 'Aksi API tidak valid atau fungsi tidak ditemukan: ' . $function_name, array('status' => 404));
    }
}