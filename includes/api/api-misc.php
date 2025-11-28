<?php
/**
 * API Endpoint: Modul Pendukung (Tasks & Leads)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Misc {

    public function register_routes() {
        // --- TASKS (Checklist Keberangkatan) ---
        register_rest_route('umh/v1', '/tasks', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_tasks'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/tasks', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_task'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/tasks/toggle/(?P<id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'toggle_task'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // --- MARKETING (Leads) ---
        register_rest_route('umh/v1', '/marketing/leads', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_leads'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/marketing/leads', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_lead'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/marketing/leads/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_lead'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    // --- TASKS LOGIC ---

    public function get_tasks($request) {
        global $wpdb;
        $dep_id = $request->get_param('departure_id');
        $where = $dep_id ? $wpdb->prepare("WHERE departure_id = %d", $dep_id) : "";
        
        $tasks = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_departure_tasks $where ORDER BY due_date ASC");
        return rest_ensure_response($tasks);
    }

    public function save_task($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_departure_tasks';

        $data = [
            'departure_id' => intval($params['departure_id']),
            'task_name' => sanitize_text_field($params['task_name']),
            'category' => sanitize_text_field($params['category']),
            'due_date' => sanitize_text_field($params['due_date']),
            'status' => 'pending'
        ];

        $wpdb->insert($table, $data);
        return rest_ensure_response(['success' => true]);
    }

    public function toggle_task($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $params = $request->get_json_params();
        $status = $params['status']; // 'completed' or 'pending'
        
        $wpdb->update(
            $wpdb->prefix . 'umh_departure_tasks', 
            ['status' => $status, 'completed_at' => ($status == 'completed' ? current_time('mysql') : null)], 
            ['id' => $id]
        );
        return rest_ensure_response(['success' => true]);
    }

    // --- MARKETING LOGIC ---

    public function get_leads($request) {
        global $wpdb;
        $status = $request->get_param('status');
        $where = $status ? $wpdb->prepare("WHERE status = %s", $status) : "";
        
        return rest_ensure_response(
            $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_marketing_leads $where ORDER BY created_at DESC")
        );
    }

    public function save_lead($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_marketing_leads';

        $data = [
            'name' => sanitize_text_field($params['name']),
            'phone' => sanitize_text_field($params['phone']),
            'source' => sanitize_text_field($params['source']),
            'interest_level' => sanitize_text_field($params['interest_level']),
            'status' => sanitize_text_field($params['status'] ?? 'new'),
            'notes' => sanitize_textarea_field($params['notes']),
            'next_follow_up' => sanitize_text_field($params['next_follow_up']),
        ];

        if (!empty($params['id'])) {
            $wpdb->update($table, $data, ['id' => $params['id']]);
        } else {
            $wpdb->insert($table, $data);
        }
        return rest_ensure_response(['success' => true]);
    }

    public function delete_lead($request) {
        global $wpdb;
        $wpdb->delete($wpdb->prefix . 'umh_marketing_leads', ['id' => $request->get_param('id')]);
        return rest_ensure_response(['success' => true]);
    }
}