// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Redirect to login if not authenticated
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    init();

    function init() {
        // Set user info
        document.getElementById('userFullName').textContent = currentUser.fullName;

        // Set up event listeners
        setupEventListeners();

        // Load initial data
        loadDashboardData();

        // Set initial view based on user role
        if (currentUser.role === 'doctor') {
            switchToDoctorView();
        } else {
            switchToPatientView();
        }
    }

    function setupEventListeners() {
        // View toggle buttons
        document.getElementById('patientViewBtn').addEventListener('click', switchToPatientView);
        document.getElementById('doctorViewBtn').addEventListener('click', switchToDoctorView);

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', logout);

        // Booking form
        document.getElementById('bookingForm').addEventListener('submit', handleBookAppointment);
        document.getElementById('doctorSelect').addEventListener('change', handleDoctorChange);
        document.getElementById('appointmentDate').addEventListener('change', handleDateChange);

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').min = today;
    }

    function switchToPatientView() {
        document.getElementById('patientViewBtn').classList.add('active');
        document.getElementById('doctorViewBtn').classList.remove('active');
        document.getElementById('patientDashboard').style.display = 'block';
        document.getElementById('doctorDashboard').style.display = 'none';
        
        loadPatientData();
    }

    function switchToDoctorView() {
        document.getElementById('doctorViewBtn').classList.add('active');
        document.getElementById('patientViewBtn').classList.remove('active');
        document.getElementById('doctorDashboard').style.display = 'block';
        document.getElementById('patientDashboard').style.display = 'none';
        
        loadDoctorData();
    }

    async function loadDashboardData() {
        try {
            // Load doctors for patient booking
            const doctorsResponse = await fetch('api.php?action=getDoctors');
            const doctorsData = await doctorsResponse.json();
            
            if (doctorsData.success) {
                populateDoctorSelect(doctorsData.doctors);
                document.getElementById('totalDoctors').textContent = doctorsData.doctors.length;
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async function loadPatientData() {
        try {
            // Load patient appointments
            const appointmentsResponse = await fetch(`api.php?action=getPatientAppointments&patientId=${currentUser.id}`);
            const appointmentsData = await appointmentsResponse.json();
            
            if (appointmentsData.success) {
                displayPatientAppointments(appointmentsData.appointments);
                
                // Update upcoming appointments count
                const upcoming = appointmentsData.appointments.filter(apt => 
                    new Date(apt.date + ' ' + apt.time) > new Date()
                ).length;
                document.getElementById('upcomingAppointments').textContent = upcoming;
            }
        } catch (error) {
            console.error('Error loading patient data:', error);
        }
    }

    async function loadDoctorData() {
        try {
            // Load doctor appointments
            const appointmentsResponse = await fetch(`api.php?action=getDoctorAppointments&doctorId=${currentUser.id}`);
            const appointmentsData = await appointmentsResponse.json();
            
            if (appointmentsData.success) {
                displayDoctorAppointments(appointmentsData.appointments);
                
                // Update statistics
                const today = new Date().toISOString().split('T')[0];
                const todayAppointments = appointmentsData.appointments.filter(apt => apt.date === today).length;
                document.getElementById('todayAppointments').textContent = todayAppointments;
                
                const uniquePatients = new Set(appointmentsData.appointments.map(apt => apt.patientId)).size;
                document.getElementById('totalPatients').textContent = uniquePatients;
                
                // Calculate monthly earnings
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const monthlyEarnings = appointmentsData.appointments
                    .filter(apt => {
                        const aptDate = new Date(apt.date);
                        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
                    })
                    .reduce((total, apt) => total + (apt.cost || 150), 0);
                
                document.getElementById('monthlyEarnings').textContent = `$${monthlyEarnings}`;
            }
        } catch (error) {
            console.error('Error loading doctor data:', error);
        }
    }

    function populateDoctorSelect(doctors) {
        const select = document.getElementById('doctorSelect');
        select.innerHTML = '<option value="">Choose a doctor...</option>';
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.fullName} - ${doctor.specialization}`;
            select.appendChild(option);
        });
    }

    async function handleDoctorChange() {
        const doctorId = document.getElementById('doctorSelect').value;
        const date = document.getElementById('appointmentDate').value;
        
        if (doctorId && date) {
            await loadTimeSlots(doctorId, date);
        } else {
            document.getElementById('timeSlots').innerHTML = '';
        }
    }

    async function handleDateChange() {
        const doctorId = document.getElementById('doctorSelect').value;
        const date = document.getElementById('appointmentDate').value;
        
        if (doctorId && date) {
            await loadTimeSlots(doctorId, date);
        } else {
            document.getElementById('timeSlots').innerHTML = '';
        }
    }

    async function loadTimeSlots(doctorId, date) {
        try {
            const response = await fetch(`api.php?action=getTimeSlots&doctorId=${doctorId}&date=${date}`);
            const data = await response.json();
            
            if (data.success) {
                displayTimeSlots(data.slots);
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
        }
    }

    function displayTimeSlots(slots) {
        const container = document.getElementById('timeSlots');
        container.innerHTML = '';
        
        slots.forEach(slot => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `time-slot ${slot.available ? '' : 'booked'}`;
            button.textContent = slot.time;
            button.disabled = !slot.available;
            
            if (slot.available) {
                button.addEventListener('click', function() {
                    // Remove previous selection
                    container.querySelectorAll('.time-slot').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    // Select this slot
                    this.classList.add('selected');
                });
            }
            
            container.appendChild(button);
        });
    }

    async function handleBookAppointment(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const selectedTimeSlot = document.querySelector('.time-slot.selected');
        
        if (!selectedTimeSlot) {
            showToast('Please select a time slot', 'error');
            return;
        }
        
        const appointmentData = {
            patientId: currentUser.id,
            doctorId: document.getElementById('doctorSelect').value,
            date: document.getElementById('appointmentDate').value,
            time: selectedTimeSlot.textContent,
            type: document.getElementById('appointmentType').value,
            notes: document.getElementById('appointmentNotes').value,
            status: 'pending'
        };

        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'bookAppointment',
                    ...appointmentData
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Appointment booked successfully!');
                
                // Reset form
                e.target.reset();
                document.getElementById('timeSlots').innerHTML = '';
                
                // Reload patient data
                loadPatientData();
            } else {
                showToast(data.message || 'Failed to book appointment', 'error');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            showToast('Unable to book appointment. Please try again.', 'error');
        }
    }

    function displayPatientAppointments(appointments) {
        const container = document.getElementById('patientAppointments');
        
        if (appointments.length === 0) {
            container.innerHTML = '<p>No appointments found.</p>';
            return;
        }
        
        container.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-time">${apt.date} at ${apt.time}</div>
                    <div class="appointment-status status-${apt.status}">${apt.status}</div>
                </div>
                <div class="appointment-details">
                    <strong>Dr. ${apt.doctorName}</strong> - ${apt.type}<br>
                    ${apt.notes ? `Notes: ${apt.notes}` : ''}
                </div>
            </div>
        `).join('');
    }

    function displayDoctorAppointments(appointments) {
        const container = document.getElementById('doctorAppointments');
        
        if (appointments.length === 0) {
            container.innerHTML = '<p>No appointments scheduled.</p>';
            return;
        }
        
        container.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-time">${apt.date} at ${apt.time}</div>
                    <div class="appointment-status status-${apt.status}">${apt.status}</div>
                </div>
                <div class="appointment-details">
                    <strong>${apt.patientName}</strong> - ${apt.type}<br>
                    ${apt.notes ? `Notes: ${apt.notes}` : ''}
                </div>
            </div>
        `).join('');
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});