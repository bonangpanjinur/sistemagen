<?php
// File: includes/api/api-marketing.php
// Refaktor menggunakan class controller untuk fitur JOIN

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

// --- 1. Controller untuk KAMPANYE (Endpoint: /marketing/campaigns) ---

$campaigns_schema = [
    'name'       => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'type'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'start_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'end_date'   => ['type' => 'string', 'format' => 'date', 'required' => true],
    'budget'     => ['type' => 'number', 'required' => true],
    'status'     => ['type' => 'string', 'required' => false, 'default' => 'planned', 'enum' => ['planned', 'active', 'completed']],
];

$marketing_permissions = [
    'get_items'    => ['owner', 'marketing_staff', 'admin_staff'],
    'get_item'     => ['owner', 'marketing_staff', 'admin_staff'],
    'create_item'  => ['owner', 'marketing_staff'],
    'update_item'  => ['owner', 'marketing_staff'],
    'delete_item'  => ['owner'],
];

new UMH_CRUD_Controller('marketing/campaigns', 'umh_marketing_campaigns', $campaigns_schema, $marketing_permissions, ['name', 'type']);


// --- 2. Controller untuk LEADS (Endpoint: /marketing/leads) ---

class UMH_Marketing_Leads_Controller extends UMH_CRUD_Controller {
    protected function get_base_query() {
        global $wpdb;
        $campaign_table = $wpdb->prefix . 'umh_marketing_campaigns';
        return "SELECT l.*, c.name as campaign_name 
                FROM {$this->table_name} l
                LEFT JOIN {$campaign_table} c ON l.campaign_id = c.id";
    }
}

$leads_schema = [
    'campaign_id'         => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'full_name'           => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'email'               => ['type' => 'string', 'format' => 'email', 'required' => false, 'sanitize_callback' => 'sanitize_email'],
    'phone'               => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'source'              => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'status'              => ['type' => 'string', 'required' => false, 'default' => 'new', 'enum' => ['new', 'contacted', 'qualified', 'unqualified', 'converted']],
    'assigned_to_user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
];

new UMH_Marketing_Leads_Controller('marketing/leads', 'umh_leads', $leads_schema, $marketing_permissions, ['full_name', 'email', 'phone', 'source']);