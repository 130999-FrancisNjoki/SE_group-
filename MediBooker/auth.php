<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include database configuration
require_once 'config.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username and password are required');
    }
    
    // Connect to database
    $pdo = new PDO($dsn, $db_username, $db_password, $options);
    
    // Check user credentials
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
        exit;
    }
    
    // Return user data (excluding password)
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'fullName' => $user['fullName'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'specialization' => $user['specialization']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>