/* Login page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loadingText = document.getElementById('loadingText');
    const errorMessage = document.getElementById('errorMessage');

    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        setLoading(true);
        hideError();

        try {
            const response = await fetch('auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Show success message and redirect
                showSuccess(`Welcome back, ${data.user.fullName}!`);
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        loginBtn.disabled = loading;
        loginText.style.display = loading ? 'none' : 'inline';
        loadingText.style.display = loading ? 'inline' : 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message';
        errorMessage.style.backgroundColor = '#dcfce7';
        errorMessage.style.borderColor = '#bbf7d0';
        errorMessage.style.color = '#166534';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Demo account quick login buttons
    usernameInput.addEventListener('click', function() {
        if (!this.value) {
            this.placeholder = 'Try: dr.johnson or john.doe';
        }
    });
});*/