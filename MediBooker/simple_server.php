<?php
// Simple router to handle the PHP application
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Handle static files
if ($path === '/' || $path === '/index.html') {
    include 'index.html';
    exit;
}

if ($path === '/dashboard.html') {
    include 'dashboard.html';
    exit;
}

if ($path === '/styles.css') {
    header('Content-Type: text/css');
    include 'styles.css';
    exit;
}

if ($path === '/script.js') {
    header('Content-Type: application/javascript');
    include 'script.js';
    exit;
}

if ($path === '/dashboard.js') {
    header('Content-Type: application/javascript');
    include 'dashboard.js';
    exit;
}

// Handle API endpoints
if ($path === '/auth.php') {
    include 'auth.php';
    exit;
}

if ($path === '/api.php') {
    include 'api.php';
    exit;
}

// Default: serve index.html
include 'index.html';
?>