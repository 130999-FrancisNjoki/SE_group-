# Medical Appointment Scheduling System

## How to Run the Application

The application has been rebuilt using HTML, CSS, PHP, and JavaScript. To run it:

1. **Start the PHP server:**
   ```bash
   php -S 0.0.0.0:3000
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000/
   ```

3. **Login with demo accounts:**
   - **Doctor:** dr.johnson / password123
   - **Patient:** john.doe / password123

## Features

- **Patient Dashboard:** Book appointments, view upcoming appointments, basic statistics
- **Doctor Dashboard:** Manage schedule, view patient appointments, earnings overview
- **Real-time booking:** AJAX-powered appointment booking with conflict prevention
- **Responsive design:** Works on all device sizes
- **Secure authentication:** Password hashing with PHP PDO prepared statements

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** PHP 8.2
- **Database:** SQLite with PDO
- **Icons:** Font Awesome
- **Styling:** Custom responsive CSS

## Database

The SQLite database is automatically created with demo users and sample appointments on first run.

## Files Structure

- `index.html` - Login page
- `dashboard.html` - Main application dashboard
- `auth.php` - Authentication endpoint
- `api.php` - REST API endpoints
- `config.php` - Database setup and configuration
- `styles.css` - Application styling
- `script.js` - Login page JavaScript
- `dashboard.js` - Dashboard functionality