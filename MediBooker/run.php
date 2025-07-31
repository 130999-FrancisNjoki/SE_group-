<?php
// Initialize database and start server
require_once 'config.php';

echo "Medical Appointment Scheduling System\n";
echo "====================================\n";
echo "Database initialized successfully with demo data.\n";
echo "Demo accounts:\n";
echo "- Doctor: dr.johnson / password123\n";
echo "- Patient: john.doe / password123\n";
echo "\nStarting PHP server on http://0.0.0.0:5000\n";
echo "Open your browser and navigate to the application.\n\n";

// Start the PHP built-in server
shell_exec("php -S 0.0.0.0:5000 > /dev/null 2>&1 &");
echo "Server started successfully!\n";
?>