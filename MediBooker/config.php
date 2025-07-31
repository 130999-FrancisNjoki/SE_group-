<?php
// Database configuration - Using SQLite for simplicity
$dbname = 'medschedule.db';

// DSN (Data Source Name) for SQLite
$dsn = "sqlite:$dbname";

// PDO options
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

// Create database and tables if they don't exist
try {
    // Connect to SQLite database (creates file if it doesn't exist)
    $pdo = new PDO($dsn, null, null, $options);
    
    // Create users table (SQLite syntax)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('patient', 'doctor')),
            fullName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            specialization TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create appointments table (SQLite syntax)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            patientId TEXT NOT NULL,
            doctorId TEXT NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('consultation', 'follow-up', 'emergency')),
            notes TEXT,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
            cost REAL DEFAULT 150.00,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patientId) REFERENCES users(id),
            FOREIGN KEY (doctorId) REFERENCES users(id),
            UNIQUE(doctorId, date, time)
        )
    ");
    
    // Insert demo users if they don't exist
    $demo_users = [
        [
            'id' => 'doctor-1',
            'username' => 'dr.johnson',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'doctor',
            'fullName' => 'Dr. Sarah Johnson',
            'email' => 'sarah.johnson@medschedule.com',
            'phone' => '+1-555-0101',
            'specialization' => 'Cardiologist'
        ],
        [
            'id' => 'doctor-2',
            'username' => 'dr.smith',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'doctor',
            'fullName' => 'Dr. Michael Smith',
            'email' => 'michael.smith@medschedule.com',
            'phone' => '+1-555-0102',
            'specialization' => 'Neurologist'
        ],
        [
            'id' => 'patient-1',
            'username' => 'john.doe',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'patient',
            'fullName' => 'John Doe',
            'email' => 'john.doe@email.com',
            'phone' => '+1-555-0201',
            'specialization' => null
        ],
        [
            'id' => 'patient-2',
            'username' => 'jane.smith',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'patient',
            'fullName' => 'Jane Smith',
            'email' => 'jane.smith@email.com',
            'phone' => '+1-555-0202',
            'specialization' => null
        ]
    ];
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    
    foreach ($demo_users as $user) {
        $stmt->execute([$user['username']]);
        if ($stmt->fetchColumn() == 0) {
            $insert_stmt = $pdo->prepare("
                INSERT INTO users (id, username, password, role, fullName, email, phone, specialization) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insert_stmt->execute([
                $user['id'],
                $user['username'],
                $user['password'],
                $user['role'],
                $user['fullName'],
                $user['email'],
                $user['phone'],
                $user['specialization']
            ]);
        }
    }
    
    // Insert demo appointments if none exist
    $stmt = $pdo->query("SELECT COUNT(*) FROM appointments");
    if ($stmt->fetchColumn() == 0) {
        $demo_appointments = [
            [
                'id' => 'apt-1',
                'patientId' => 'patient-1',
                'doctorId' => 'doctor-1',
                'date' => date('Y-m-d', strtotime('+1 day')),
                'time' => '10:00:00',
                'type' => 'consultation',
                'notes' => 'Routine checkup',
                'status' => 'confirmed'
            ],
            [
                'id' => 'apt-2',
                'patientId' => 'patient-2',
                'doctorId' => 'doctor-2',
                'date' => date('Y-m-d', strtotime('+2 days')),
                'time' => '14:30:00',
                'type' => 'follow-up',
                'notes' => 'Follow-up for previous consultation',
                'status' => 'pending'
            ]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO appointments (id, patientId, doctorId, date, time, type, notes, status, cost) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($demo_appointments as $apt) {
            $stmt->execute([
                $apt['id'],
                $apt['patientId'],
                $apt['doctorId'],
                $apt['date'],
                $apt['time'],
                $apt['type'],
                $apt['notes'],
                $apt['status'],
                150.00
            ]);
        }
    }
    
} catch (PDOException $e) {
    error_log("Database setup error: " . $e->getMessage());
}
?>