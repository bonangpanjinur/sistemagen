<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Packages_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        // Schema Validasi
        $schema = [
            'package_name'   => ['type' => 'string', 'required' => true],
            'duration'       => ['type' => 'integer', 'required' => true],
            'departure_city' => ['type' => 'string'],
            'category_id'    => ['type' => 'integer'],
            'sub_category'   => ['type' => 'string'],
            
            // JSON Fields (Array)
            'airlines'       => ['type' => 'array'], 
            'hotels'         => ['type' => 'array'],
            'facilities'     => ['type' => 'array'],
            'promo_types'    => ['type' => 'array'],
            
            // Complex Data
            'dates'          => ['type' => 'array'], // Array of {date, quota}
            'prices'         => ['type' => 'array'], // Array of {room, price}
            
            // Itinerary
            'itinerary_mode' => ['type' => 'string'],
            'itinerary_data' => ['type' => 'array'],
            'itinerary_file_url' => ['type' => 'string'],
            
            'status'         => ['type' => 'string', 'default' => 'draft'],
        ];
        
        parent::__construct('packages', 'umh_packages', $schema, ['get_items' => ['admin_staff', 'marketing_staff'], 'create_item' => ['admin_staff']]);
    }

    // Override Create untuk handle Multi-Table
    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        // 1. Siapkan Data Utama Paket
        $main_data = [
            'package_name'   => $params['package_name'],
            'duration'       => $params['duration'],
            'departure_city' => $params['departure_city'],
            'category_id'    => $params['category_id'] ?? 0,
            'sub_category'   => $params['sub_category'] ?? '',
            'airlines'       => json_encode($params['airlines'] ?? []),
            'hotels'         => json_encode($params['hotels'] ?? []),
            'facilities'     => json_encode($params['facilities'] ?? []),
            'promo_types'    => json_encode($params['promo_types'] ?? []),
            'itinerary_mode' => $params['itinerary_mode'] ?? 'manual',
            'itinerary_file_url' => $params['itinerary_file_url'] ?? '',
            'itinerary_data' => json_encode($params['itinerary_data'] ?? []),
            'status'         => $params['status'] ?? 'draft',
            'created_at'     => current_time('mysql'),
            'updated_at'     => current_time('mysql')
        ];

        $inserted = $wpdb->insert($this->table_name, $main_data);
        if (!$inserted) return new WP_Error('db_error', 'Gagal simpan paket', ['status' => 500]);
        $package_id = $wpdb->insert_id;

        // 2. Simpan Tanggal Keberangkatan (Loop)
        if (!empty($params['dates']) && is_array($params['dates'])) {
            $tbl_dates = $wpdb->prefix . 'umh_package_dates';
            foreach ($params['dates'] as $d) {
                if (!empty($d['date'])) {
                    $wpdb->insert($tbl_dates, [
                        'package_id' => $package_id,
                        'departure_date' => $d['date'],
                        'quota' => $d['quota'] ?? 45,
                        'status' => 'available'
                    ]);
                }
            }
        }

        // 3. Simpan Harga (Loop)
        if (!empty($params['prices']) && is_array($params['prices'])) {
            $tbl_prices = $wpdb->prefix . 'umh_package_prices';
            foreach ($params['prices'] as $p) {
                if (!empty($p['price'])) {
                    $wpdb->insert($tbl_prices, [
                        'package_id' => $package_id,
                        'room_type' => $p['room_type'],
                        'price' => $p['price'],
                        'currency' => $p['currency'] ?? 'IDR'
                    ]);
                }
            }
        }

        return $this->get_item_response($package_id);
    }

    // Helper untuk Ambil Data Lengkap (Join)
    private function get_item_response($id) {
        global $wpdb;
        $pkg = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);
        
        // Decode JSON
        $pkg['airlines'] = json_decode($pkg['airlines']);
        $pkg['hotels'] = json_decode($pkg['hotels']);
        $pkg['facilities'] = json_decode($pkg['facilities']);
        $pkg['promo_types'] = json_decode($pkg['promo_types']);
        $pkg['itinerary_data'] = json_decode($pkg['itinerary_data']);

        // Ambil Relasi Dates
        $pkg['dates'] = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_package_dates WHERE package_id = %d", $id), ARRAY_A);
        
        // Ambil Relasi Prices
        $pkg['prices'] = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_package_prices WHERE package_id = %d", $id), ARRAY_A);

        return rest_ensure_response($pkg);
    }

    // Override Get Items (List)
    public function get_items($request) {
        global $wpdb;
        // Logic sederhana: Ambil semua paket lalu inject harga termurah
        $items = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY created_at DESC", ARRAY_A);
        
        foreach ($items as &$item) {
            // Inject 1 harga sebagai display "Mulai dari..."
            $min_price = $wpdb->get_var($wpdb->prepare("SELECT MIN(price) FROM {$wpdb->prefix}umh_package_prices WHERE package_id = %d", $item['id']));
            $item['start_from'] = $min_price;
            
            // Decode JSON dasar untuk UI
            $item['promo_types'] = json_decode($item['promo_types']);
        }
        return rest_ensure_response($items);
    }
}
new UMH_Packages_API();
?>