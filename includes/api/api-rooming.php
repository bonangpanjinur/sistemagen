<?php
/**
 * API Endpoint: Manajemen Rooming List (Operasional)
 * Fitur: Kelola Kamar Hotel & Assign Penumpang
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Rooming {

    public function register_routes() {
        // GET Dashboard Rooming per Keberangkatan
        register_rest_route('umh/v1', '/rooming/(?P<departure_id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_rooming_data'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Buat Kamar Baru
        register_rest_route('umh/v1', '/rooming/rooms', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_room'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // DELETE Hapus Kamar
        register_rest_route('umh/v1', '/rooming/rooms/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_room'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Assign Jemaah ke Kamar (Move Passenger)
        register_rest_route('umh/v1', '/rooming/assign', array(
            'methods' => 'POST',
            'callback' => array($this, 'assign_passenger'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: Ambil Data Kamar + Jemaah (Assigned & Unassigned)
     */
    public function get_rooming_data($request) {
        global $wpdb;
        $dep_id = $request->get_param('departure_id');
        
        $table_rooms = $wpdb->prefix . 'umh_departure_rooms';
        $table_pax = $wpdb->prefix . 'umh_booking_passengers';
        $table_jamaah = $wpdb->prefix . 'umh_jamaah';
        $table_hotel = $wpdb->prefix . 'umh_master_hotels';

        // 1. Ambil Daftar Kamar (Rooms)
        $rooms = $wpdb->get_results($wpdb->prepare(
            "SELECT r.*, h.name as hotel_name, h.city 
             FROM $table_rooms r
             JOIN $table_hotel h ON r.hotel_id = h.id
             WHERE r.departure_id = %d
             ORDER BY h.city DESC, r.room_number ASC",
            $dep_id
        ));

        // 2. Ambil Semua Penumpang di Keberangkatan Ini
        $passengers = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                bp.id, bp.assigned_room_id, bp.room_type as package_room_type,
                j.full_name, j.gender, j.nik
             FROM $table_pax bp
             JOIN {$wpdb->prefix}umh_bookings b ON bp.booking_id = b.id
             JOIN $table_jamaah j ON bp.jamaah_id = j.id
             WHERE b.departure_id = %d AND bp.status = 'active'",
            $dep_id
        ));

        // 3. Mapping Penumpang ke dalam Kamar
        $rooms_map = [];
        foreach ($rooms as $room) {
            $room->occupants = [];
            $rooms_map[$room->id] = $room;
        }

        $unassigned = [];
        
        foreach ($passengers as $pax) {
            if ($pax->assigned_room_id && isset($rooms_map[$pax->assigned_room_id])) {
                $rooms_map[$pax->assigned_room_id]->occupants[] = $pax;
            } else {
                $unassigned[] = $pax;
            }
        }

        return rest_ensure_response([
            'rooms' => array_values($rooms_map),
            'unassigned' => $unassigned
        ]);
    }

    /**
     * POST: Buat Kamar Baru
     */
    public function create_room($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_departure_rooms';

        if (empty($params['departure_id']) || empty($params['hotel_id']) || empty($params['room_number'])) {
            return new WP_Error('missing_data', 'Data tidak lengkap', ['status' => 400]);
        }

        $data = [
            'departure_id' => intval($params['departure_id']),
            'hotel_id' => intval($params['hotel_id']),
            'room_number' => sanitize_text_field($params['room_number']),
            'floor_level' => sanitize_text_field($params['floor_level'] ?? ''),
            'capacity' => intval($params['capacity'] ?? 4), // 4=Quad, 2=Double
            'room_gender' => sanitize_text_field($params['room_gender'] ?? 'family'),
            'notes' => sanitize_textarea_field($params['notes'] ?? '')
        ];

        if ($wpdb->insert($table, $data)) {
            return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
        }
        return new WP_Error('db_error', 'Gagal buat kamar', ['status' => 500]);
    }

    /**
     * DELETE: Hapus Kamar (Lepas Penumpang Dulu)
     */
    public function delete_room($request) {
        global $wpdb;
        $room_id = $request->get_param('id');
        
        // 1. Unassign semua penumpang di kamar ini
        $wpdb->update(
            $wpdb->prefix . 'umh_booking_passengers', 
            ['assigned_room_id' => null], 
            ['assigned_room_id' => $room_id]
        );

        // 2. Hapus Kamar
        $wpdb->delete($wpdb->prefix . 'umh_departure_rooms', ['id' => $room_id]);
        
        return rest_ensure_response(['success' => true]);
    }

    /**
     * POST: Assign Passenger (Drag & Drop Logic)
     */
    public function assign_passenger($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $pax_id = intval($params['passenger_id']);
        $room_id = !empty($params['room_id']) ? intval($params['room_id']) : null; // Null = Unassign (Kick)

        $updated = $wpdb->update(
            $wpdb->prefix . 'umh_booking_passengers',
            ['assigned_room_id' => $room_id],
            ['id' => $pax_id]
        );

        if ($updated !== false) {
            return rest_ensure_response(['success' => true]);
        }
        return new WP_Error('db_error', 'Gagal update status', ['status' => 500]);
    }
}