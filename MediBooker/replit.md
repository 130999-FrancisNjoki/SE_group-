# Medical Appointment Scheduling Application

## Overview

This is a full-stack medical appointment scheduling application built with traditional web technologies. The system allows patients to book appointments with doctors and enables doctors to manage their schedules. The application features a clean, medical-themed UI with role-based dashboards, real-time appointment management, and booking conflict prevention. Technology stack has been changed from React/Node.js to HTML, CSS, PHP, and JavaScript as per user requirements.

## User Preferences

Preferred communication style: Simple, everyday language.
Technology preference: HTML, CSS, PHP, and JavaScript

## System Architecture

The application follows a traditional web architecture with clear separation of concerns:

### Frontend Architecture
- **Structure**: Pure HTML5 with semantic markup
- **Styling**: Custom CSS with modern design patterns and responsive layout
- **Interactivity**: Vanilla JavaScript with modern ES6+ features
- **Icons**: Font Awesome for consistent iconography
- **State Management**: localStorage for client-side authentication state
- **AJAX**: Fetch API for server communication

### Backend Architecture
- **Language**: PHP 8.2 with modern syntax and features
- **Database**: MySQL 8.0 with PDO for secure database operations
- **API Design**: RESTful endpoints with JSON responses
- **Authentication**: Server-side validation with password hashing
- **Session Management**: localStorage-based authentication (demo purposes)

### Database Layer
- **MySQL Database**: Relational database with proper normalization
- **PDO Integration**: Secure prepared statements for all database operations
- **Auto-setup**: Database and tables created automatically on first run

## Key Components

### Database Schema
- **Users Table**: Stores both patients and doctors with role-based fields and secure password hashing
- **Appointments Table**: Links patients to doctors with scheduling details and conflict prevention
- **Demo Data**: Pre-populated with sample users and appointments for testing

### Authentication System
- PHP-based login validation with password hashing
- Role-based access control (patient/doctor views)
- localStorage-based session management for demo purposes

### Dashboard Views
- **Patient Dashboard**: Appointment booking interface, upcoming appointments display, basic statistics
- **Doctor Dashboard**: Schedule management, patient appointments, earnings overview
- **Dual Role Support**: JavaScript-powered view switching between patient and doctor interfaces

### Appointment Management
- Real-time time slot availability checking with MySQL conflict prevention
- AJAX-powered appointment booking without page refreshes
- Appointment type categorization (consultation, follow-up, emergency)
- Patient notes and appointment details tracking
- Visual time slot selection (available, booked, selected states)

## Data Flow

1. **Authentication**: User submits credentials → PHP validates against MySQL → User data stored in localStorage → Dashboard loads
2. **Appointment Booking**: Patient selects doctor/time → AJAX checks availability → PHP validates and stores → Success response updates UI
3. **Schedule Management**: Doctor views appointments via API calls → PHP queries MySQL → JSON response renders appointment list
4. **Real-time Updates**: JavaScript periodically refreshes data via API endpoints

## External Dependencies

### Frontend Libraries
- **Font Awesome**: Comprehensive icon library for UI elements
- **Modern CSS**: Custom responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript**: ES6+ features for modern browser compatibility

### Backend Infrastructure
- **PHP 8.2**: Modern PHP with strong typing and security features
- **MySQL 8.0**: Reliable relational database with full ACID compliance
- **PDO**: PHP Data Objects for secure database operations

### Development Tools
- **PHP Built-in Server**: Development server for local testing
- **MySQL**: Database server for persistent data storage

## Deployment Strategy

### Development
- PHP built-in development server for local testing
- MySQL database with automatic setup and demo data
- Real-time file changes without build steps

### Production Deployment
- Standard LAMP stack (Linux, Apache, MySQL, PHP)
- Static HTML/CSS/JS files served directly
- PHP files processed server-side
- MySQL database for data persistence

### Database Management
- Automatic database and table creation on first run
- Demo users and appointments pre-populated
- PDO prepared statements for security
- Password hashing with PHP's built-in functions

### Architecture Benefits
1. **Simplicity**: Traditional web technologies for easy understanding and maintenance
2. **Performance**: Minimal overhead with direct server-side processing
3. **Compatibility**: Works on any standard web hosting environment
4. **Security**: PDO prepared statements prevent SQL injection attacks
5. **Maintainability**: Clear separation between presentation, logic, and data layers

## Recent Changes (January 2025)

✓ Completely rebuilt application using HTML, CSS, PHP, and JavaScript per user request
✓ Replaced React/Node.js/TypeScript stack with traditional web technologies
✓ Implemented MySQL database with PDO for secure data operations
✓ Created responsive CSS design with modern layout techniques
✓ Built vanilla JavaScript for dynamic interactions and AJAX communication
✓ Maintained all core functionality: authentication, appointment booking, role-based dashboards
✓ Added automatic database setup with demo users and sample data
✓ Preserved medical-themed UI design and user experience

The application now uses traditional web technologies while maintaining the same functionality and user experience as the previous React-based version. All features including patient/doctor dashboards, appointment booking, and schedule management are fully operational.