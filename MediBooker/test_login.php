<?php
// Test the login functionality
require_once 'config.php';

// Test credentials
$test_username = 'dr.johnson';
$test_password = 'password123';

// Simulate the auth.php functionality
try {
    $pdo = new PDO('sqlite:medschedule.db');
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$test_username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($test_password, $user['password'])) {
        echo "Login test successful!\n";
        echo "User: " . $user['fullName'] . " (" . $user['role'] . ")\n";
        
        // Test appointment query
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM appointments WHERE doctorId = ?");
        $stmt->execute([$user['id']]);
        $appointments = $stmt->fetch();
        echo "User has " . $appointments['count'] . " appointments\n";
    } else {
        echo "Login test failed!\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>