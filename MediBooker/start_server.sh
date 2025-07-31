#!/bin/bash
echo "Starting PHP Medical Appointment Scheduling Application..."
echo "Setting up database..."
php config.php
echo "Starting PHP server on port 3000..."
php -S 0.0.0.0:3000
