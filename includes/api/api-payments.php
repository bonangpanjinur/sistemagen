<?php
/**
 * API endpoints for payments
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class UMH_Payments_API_Controller extends UMH_CRUD_Controller {
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_payments';
        $this->resource_name = 'payment';
        $this->fields = [
            'jamaah_id' => ['type' => 'int', 'required' => true],
            'amount' => ['type' => 'float', 'required' => true],
            'payment_date' => ['type' => 'date', 'required' => true],
            'payment_method' => ['type' => 'string', 'required' => false, 'default' => 'cash'],
            'status' => ['type' => 'string', 'required' => false, 'default' => 'pending'],
            'notes' => ['type' => 'text', 'required' => false],
            'created_at' => ['type' => 'datetime', 'readonly' => true],
            'updated_at' => ['type' => 'datetime', 'readonly' => true],
            'created_by' => ['type' => 'int', 'readonly' => true],
        ];
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/' . $this->resource_name . 's', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_items'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => 'umh_create_payment', // Custom callback for transaction
                'permission_callback' => 'umh_is_user_authorized',
            ],
        ]);

        register_rest_route('umh/v1', '/' . $this->resource_name . 's/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_item'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => 'umh_update_payment', // Custom callback for transaction
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => 'umh_delete_payment', // Custom callback for transaction
                'permission_callback' => 'umh_is_user_authorized',
            ],
        ]);
    }

    // Override get_base_query to include jamaah name
    protected function get_base_query() {
        global $wpdb;
        $payments_table = $this->table_name;
        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        
        return "SELECT p.*, j.full_name as jamaah_name 
                FROM {$payments_table} p
                LEFT JOIN {$jamaah_table} j ON p.jamaah_id = j.id";
    }

    // Override get_item_by_id to include jamaah name
    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE p.id = %d", $id);
        return $wpdb->get_row($query);
    }
    
    // Override get_searchable_columns
    protected function get_searchable_columns() {
        return ['jamaah_name', 'payment_method', 'status', 'notes'];
    }
    
    // Override prepare_item_for_db to add created_by
    public function prepare_item_for_db($request, $is_update = false) {
        $data = parent::prepare_item_for_db($request, $is_update);
        if (is_wp_error($data)) {
            return $data;
        }
        
        if (!$is_update) {
            $data['created_by'] = get_current_user_id();
        }
        return $data;
    }
}

// Register routes
add_action('rest_api_init', function () {
    $controller = new UMH_Payments_API_Controller();
    $controller->register_routes();
});


/**
 * Custom CREATE payment function to include transaction
 */
function umh_create_payment($request) {
    global $wpdb;
    $controller = new UMH_Payments_API_Controller();
    $data = $controller->prepare_item_for_db($request);

    if (is_wp_error($data)) {
        return $data;
    }

    // Mulai Transaksi
    $wpdb->query('START TRANSACTION');

    // 1. Insert Payment
    $result = $wpdb->insert($controller->table_name, $data);
    $new_id = $wpdb->insert_id;

    if ($result === false) {
        $wpdb->query('ROLLBACK'); // Batalkan jika gagal
        return new WP_Error('db_error', 'Gagal menyimpan payment.', ['status' => 500]);
    }

    // 2. Update Saldo Jamaah
    $balance_updated = umh_update_jamaah_balance($data['jamaah_id']);

    if ($balance_updated === false) {
        $wpdb->query('ROLLBACK'); // Batalkan jika gagal
        return new WP_Error('db_error', 'Gagal mengupdate saldo jemaah.', ['status' => 500]);
    }

    // Sukses
    $wpdb->query('COMMIT');

    $new_payment = $controller->get_item_by_id($new_id);
    return new WP_REST_Response($new_payment, 201);
}

/**
 * Custom UPDATE payment function to include transaction
 */
function umh_update_payment($request) {
    global $wpdb;
    $id = (int) $request['id'];
    $controller = new UMH_Payments_API_Controller();
    
    // Ambil data lama untuk tahu jamaah_id lama
    $old_payment = $wpdb->get_row($wpdb->prepare("SELECT jamaah_id FROM {$controller->table_name} WHERE id = %d", $id));
    if (!$old_payment) {
        return new WP_Error('not_found', 'Payment not found.', ['status' => 404]);
    }
    $old_jamaah_id = $old_payment->jamaah_id;

    $data = $controller->prepare_item_for_db($request, true);
    if (is_wp_error($data)) {
        return $data;
    }
    
    if (empty($data)) {
         return new WP_Error('no_data', 'No data provided to update', ['status' => 400]);
    }

    // Mulai Transaksi
    $wpdb->query('START TRANSACTION');
    
    // 1. Update Payment
    $result = $wpdb->update($controller->table_name, $data, ['id' => $id]);

    if ($result === false) {
        $wpdb->query('ROLLBACK');
        return new WP_Error('db_error', 'Gagal mengupdate payment.', ['status' => 500]);
    }

    // 2. Update Saldo Jamaah Lama
    $balance_updated = umh_update_jamaah_balance($old_jamaah_id);
    if ($balance_updated === false) {
        $wpdb->query('ROLLBACK');
        return new WP_Error('db_error', 'Gagal mengupdate saldo jemaah lama.', ['status' => 500]);
    }

    // 3. Jika jamaah_id berubah, update juga saldo jamaah baru
    $new_jamaah_id = isset($data['jamaah_id']) ? $data['jamaah_id'] : $old_jamaah_id;
    if ($new_jamaah_id != $old_jamaah_id) {
        $new_balance_updated = umh_update_jamaah_balance($new_jamaah_id);
        if ($new_balance_updated === false) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('db_error', 'Gagal mengupdate saldo jemaah baru.', ['status' => 500]);
        }
    }

    // Sukses
    $wpdb->query('COMMIT');

    $updated_payment = $controller->get_item_by_id($id);
    return new WP_REST_Response($updated_payment, 200);
}

/**
 * Custom DELETE payment function to include transaction
 */
function umh_delete_payment($request) {
    global $wpdb;
    $id = (int) $request['id'];
    $controller = new UMH_Payments_API_Controller();

    // Ambil data lama untuk tahu jamaah_id
    $payment = $wpdb->get_row($wpdb->prepare("SELECT jamaah_id FROM {$controller->table_name} WHERE id = %d", $id));
    if (!$payment) {
        return new WP_Error('not_found', 'Payment not found.', ['status' => 404]);
    }
    $jamaah_id = $payment->jamaah_id;

    // Mulai Transaksi
    $wpdb->query('START TRANSACTION');

    // 1. Delete Payment
    $result = $wpdb->delete($controller->table_name, ['id' => $id]);

    if ($result === false) {
        $wpdb->query('ROLLBACK');
        return new WP_Error('db_error', 'Gagal menghapus payment.', ['status' => 500]);
    }
    
    if ($result === 0) {
        $wpdb->query('ROLLBACK');
        return new WP_Error('not_found', 'Payment not found.', ['status' => 404]);
    }

    // 2. Update Saldo Jamaah
    $balance_updated = umh_update_jamaah_balance($jamaah_id);
    if ($balance_updated === false) {
        $wpdb->query('ROLLBACK');
        return new WP_Error('db_error', 'Gagal mengupdate saldo jemaah.', ['status' => 500]);
    }

    // Sukses
    $wpdb->query('COMMIT');

    return new WP_REST_Response(true, 204); // No Content
}


/**
 * Recalculate and update jamaah balance
 * Dipanggil SETELAH payment di insert/update/delete
 * @return bool True on success, false on failure.
 */
function umh_update_jamaah_balance($jamaah_id) {
    global $wpdb;
    
    if (empty($jamaah_id)) {
        return false;
    }

    $jamaah_table = $wpdb->prefix . 'umh_jamaah';
    $packages_table = $wpdb->prefix . 'umh_packages';
    $prices_table = $wpdb->prefix . 'umh_package_prices';
    $payments_table = $wpdb->prefix . 'umh_payments';

    // Hitung total tagihan (harga paket + harga kamar)
    $total_price_query = $wpdb->prepare(
        "SELECT p.base_price + COALESCE(pp.price, 0)
         FROM {$jamaah_table} j
         LEFT JOIN {$packages_table} p ON j.package_id = p.id
         LEFT JOIN {$prices_table} pp ON j.room_type = pp.room_type AND pp.package_id = p.id
         WHERE j.id = %d",
        $jamaah_id
    );
    $total_price = (float) $wpdb->get_var($total_price_query);

    // Hitung total bayar (hanya yang 'confirmed')
    $total_paid = (float) $wpdb->get_var($wpdb->prepare(
        "SELECT COALESCE(SUM(amount), 0) 
         FROM {$payments_table} 
         WHERE jamaah_id = %d AND status = 'confirmed'", 
        $jamaah_id
    ));
    
    $remaining_balance = $total_price - $total_paid;
    
    // Tentukan payment_status
    $payment_status = 'belum_lunas';
    if ($total_price <= 0) {
        $payment_status = 'pending'; // Belum ada tagihan
    } elseif ($remaining_balance <= 0) {
        $payment_status = 'lunas';
    }

    // Update tabel jamaah
    $result = $wpdb->update(
        $jamaah_table,
        [
            'total_price' => $total_price,
            'total_paid' => $total_paid,
            'remaining_balance' => $remaining_balance,
            'payment_status' => $payment_status,
        ],
        ['id' => $jamaah_id],
        [
            '%f', // total_price
            '%f', // total_paid
            '%f', // remaining_balance
            '%s', // payment_status
        ],
        ['%d'] // where id
    );

    // Mengembalikan status sukses/gagal untuk transaksi
    return ($result !== false);
}