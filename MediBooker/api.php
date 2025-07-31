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
    $pdo = new PDO($dsn, $db_username, $db_password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'getDoctors':
                getDoctors($pdo);
                break;
                
            case 'getPatientAppointments':
                $patientId = $_GET['patientId'] ?? '';
                getPatientAppointments($pdo, $patientId);
                break;
                
            case 'getDoctorAppointments':
                $doctorId = $_GET['doctorId'] ?? '';
                getDoctorAppointments($pdo, $doctorId);
                break;
                
            case 'getTimeSlots':
                $doctorId = $_GET['doctorId'] ?? '';
                $date = $_GET['date'] ?? '';
                getTimeSlots($pdo, $doctorId, $date);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'bookAppointment':
                bookAppointment($pdo, $input);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function getDoctors($pdo) {
    $stmt = $pdo->query("SELECT id, username, fullName, email, phone, specialization FROM users WHERE role = 'doctor' ORDER BY fullName");
    $doctors = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'doctors' => $doctors
    ]);
}

function getPatientAppointments($pdo, $patientId) {
    if (empty($patientId)) {
        throw new Exception('Patient ID is required');
    }
    
    $stmt = $pdo->prepare("
        SELECT a.*, u.fullName as doctorName 
        FROM appointments a 
        JOIN users u ON a.doctorId = u.id 
        WHERE a.patientId = ? 
        ORDER BY a.date DESC, a.time DESC
    ");
    $stmt->execute([$patientId]);
    $appointments = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);
}

function getDoctorAppointments($pdo, $doctorId) {
    if (empty($doctorId)) {
        throw new Exception('Doctor ID is required');
    }
    
    $stmt = $pdo->prepare("
        SELECT a.*, u.fullName as patientName 
        FROM appointments a 
        JOIN users u ON a.patientId = u.id 
        WHERE a.doctorId = ? 
        ORDER BY a.date DESC, a.time DESC
    ");
    $stmt->execute([$doctorId]);
    $appointments = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);
}

function getTimeSlots($pdo, $doctorId, $date) {
    if (empty($doctorId) || empty($date)) {
        throw new Exception('Doctor ID and date are required');
    }
    
    // Get booked appointments for the doctor on the specified date
    $stmt = $pdo->prepare("SELECT time FROM appointments WHERE doctorId = ? AND date = ?");
    $stmt->execute([$doctorId, $date]);
    $bookedTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    $slots = [];
    for ($hour = 9; $hour < 17; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $time = sprintf('%02d:%02d', $hour, $minute);
            $slots[] = [
                'time' => $time,
                'available' => !in_array($time, $bookedTimes)
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'slots' => $slots
    ]);
}

function bookAppointment($pdo, $data) {
    $required = ['patientId', 'doctorId', 'date', 'time', 'type'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("$field is required");
        }
    }
    
    // Check if the time slot is still available
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE doctorId = ? AND date = ? AND time = ?");
    $stmt->execute([$data['doctorId'], $data['date'], $data['time']]);
    
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('This time slot is no longer available');
    }
    
    // Generate unique appointment ID
    $appointmentId = 'apt-' . uniqid();
    
    // Insert appointment
    $stmt = $pdo->prepare("
        INSERT INTO appointments (id, patientId, doctorId, date, time, type, notes, status, cost, createdAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $appointmentId,
        $data['patientId'],
        $data['doctorId'],
        $data['date'],
        $data['time'],
        $data['type'],
        $data['notes'] ?? '',
        $data['status'] ?? 'pending',
        150 // Default cost
    ]);
    
    echo json_encode([
        'success' => true,
        'appointmentId' => $appointmentId,
        'message' => 'Appointment booked successfully'
    ]);
}
?>