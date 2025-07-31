<?php
// Simple PHP development server setup
$host = '0.0.0.0';
$port = 8000;

// Start MySQL service (if needed)
echo "Starting services...\n";

// Initialize database
require_once 'config.php';
echo "Database initialized successfully.\n";

echo "Starting PHP development server on http://$host:$port\n";
echo "Open your browser and go to: http://localhost:$port\n";
echo "Demo accounts:\n";
echo "- Doctor: dr.johnson / password123\n";
echo "- Patient: john.doe / password123\n";

// Start the built-in PHP server
exec("php -S $host:$port");
?>