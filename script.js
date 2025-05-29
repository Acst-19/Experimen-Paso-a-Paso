
// Rating system functionality
document.addEventListener('DOMContentLoaded', function() {
    const starRatings = document.querySelectorAll('.star-rating');
    const ratings = {};

    // Initialize ratings object
    ['solar', 'battery', 'methane'].forEach(experiment => {
        ratings[experiment] = {
            rating: 0
        };
    });

    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const experiment = rating.dataset.experiment;
        const category = rating.dataset.category;

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                ratings[experiment][category] = value;

                // Update visual feedback
                updateStars(rating, value);
                
                // Update average
                updateAverage(experiment);
                
                // Save to localStorage
                localStorage.setItem('experimentRatings', JSON.stringify(ratings));
            });

            star.addEventListener('mouseenter', function() {
                const value = parseInt(this.dataset.value);
                highlightStars(rating, value);
            });
        });

        rating.addEventListener('mouseleave', function() {
            const currentRating = ratings[experiment][category];
            updateStars(rating, currentRating);
        });
    });

    function updateStars(rating, value) {
        const stars = rating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function highlightStars(rating, value) {
        const stars = rating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.style.color = '#ffd700';
            } else {
                star.style.color = '#e2e8f0';
            }
        });
    }

    function updateAverage(experiment) {
        const exp = ratings[experiment];
        const values = Object.values(exp).filter(v => v > 0);
        
        if (values.length > 0) {
            const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
            document.getElementById(`${experiment}-average`).textContent = `${average}⭐`;
        } else {
            document.getElementById(`${experiment}-average`).textContent = '-';
        }
    }

    // Load saved ratings
    const savedRatings = localStorage.getItem('experimentRatings');
    if (savedRatings) {
        const saved = JSON.parse(savedRatings);
        
        // Merge saved ratings, ensuring compatibility with old format
        Object.keys(saved).forEach(experiment => {
            if (!ratings[experiment]) {
                ratings[experiment] = { rating: 0 };
            }
            
            // Handle old format with multiple categories
            if (typeof saved[experiment] === 'object') {
                if (saved[experiment].rating) {
                    ratings[experiment].rating = saved[experiment].rating;
                } else {
                    // Take average of old categories if they exist
                    const oldValues = Object.values(saved[experiment]).filter(v => v > 0);
                    if (oldValues.length > 0) {
                        ratings[experiment].rating = Math.round(oldValues.reduce((a, b) => a + b, 0) / oldValues.length);
                    }
                }
            }
        });
        
        // Apply saved ratings to UI
        Object.keys(ratings).forEach(experiment => {
            const value = ratings[experiment].rating;
            if (value > 0) {
                const rating = document.querySelector(`[data-experiment="${experiment}"][data-category="rating"]`);
                if (rating) {
                    updateStars(rating, value);
                }
            }
            updateAverage(experiment);
        });
    }

    // Admin panel functionality
    const adminLogin = document.getElementById('admin-login');
    const loginAdminBtn = document.getElementById('login-admin');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminContent = document.getElementById('admin-content');
    const ratingsDisplay = document.getElementById('ratings-display');
    const exportBtn = document.getElementById('export-data');
    const clearBtn = document.getElementById('clear-data');

    // Set your admin password here (in a real app, this should be on the server!)
    const ADMIN_PASSWORD = 'ChicosGuapos123';
    let isAdminLoggedIn = false;

    loginAdminBtn.addEventListener('click', function() {
        const enteredPassword = adminPasswordInput.value;
        
        if (enteredPassword === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            adminLogin.style.display = 'none';
            adminContent.style.display = 'block';
            updateRatingsDisplay();
            
            // Add logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Cerrar Sesión';
            logoutBtn.className = 'admin-button';
            logoutBtn.style.float = 'right';
            logoutBtn.addEventListener('click', function() {
                isAdminLoggedIn = false;
                adminLogin.style.display = 'block';
                adminContent.style.display = 'none';
                adminPasswordInput.value = '';
                logoutBtn.remove();
            });
            adminContent.insertBefore(logoutBtn, adminContent.firstChild);
        } else {
            alert('Contraseña incorrecta. Acceso denegado.');
            adminPasswordInput.value = '';
        }
    });

    // Password toggle functionality
    const togglePasswordBtn = document.getElementById('toggle-password');
    togglePasswordBtn.addEventListener('click', function() {
        if (adminPasswordInput.type === 'password') {
            adminPasswordInput.type = 'text';
            togglePasswordBtn.textContent = '🙈';
        } else {
            adminPasswordInput.type = 'password';
            togglePasswordBtn.textContent = '👁️';
        }
    });

    // Allow login with Enter key
    adminPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginAdminBtn.click();
        }
    });

    function updateRatingsDisplay() {
        const experimentNames = {
            solar: 'El Poder Del Sol En Una Lata',
            battery: 'La Batería De Tierra',
            methane: 'Estufa De Metano'
        };

        // Get all ratings from localStorage to count them properly
        const allRatings = {};
        const savedData = localStorage.getItem('experimentRatings');
        
        // Initialize rating counts
        Object.keys(experimentNames).forEach(exp => {
            allRatings[exp] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
        });

        // Count current user's rating (stored in ratings object)
        Object.keys(ratings).forEach(experiment => {
            const rating = ratings[experiment].rating;
            if (rating > 0) {
                allRatings[experiment][rating] = 1;
                allRatings[experiment].total = 1;
            }
        });

        let html = '<div class="ratings-display">';
        html += '<h4>📊 Estadísticas Detalladas de Calificaciones:</h4>';
        
        Object.keys(experimentNames).forEach(experiment => {
            const counts = allRatings[experiment];
            const totalVotes = counts.total;
            
            html += `
                <div class="experiment-rating">
                    <strong>${experimentNames[experiment]}</strong><br>
                    <div class="rating-stats">
            `;
            
            if (totalVotes > 0) {
                html += `<p><strong>Total de personas que calificaron: ${totalVotes}</strong></p>`;
                html += '<div class="rating-breakdown">';
                
                for (let stars = 5; stars >= 1; stars--) {
                    const count = counts[stars];
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const barWidth = percentage;
                    
                    html += `
                        <div class="rating-bar">
                            <span class="star-label">${stars} ⭐</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${barWidth}%"></div>
                            </div>
                            <span class="rating-count">${count} persona${count !== 1 ? 's' : ''} (${percentage}%)</span>
                        </div>
                    `;
                }
                
                html += '</div>';
                
                // Calculate average
                let totalStars = 0;
                for (let stars = 1; stars <= 5; stars++) {
                    totalStars += stars * counts[stars];
                }
                const average = totalVotes > 0 ? (totalStars / totalVotes).toFixed(1) : 0;
                html += `<p><strong>Calificación promedio: ${average}/5 ${'⭐'.repeat(Math.floor(average))}</strong></p>`;
            } else {
                html += '<p><em>Aún no hay calificaciones para este experimento</em></p>';
            }
            
            html += `
                    </div>
                    <small>Última actualización: ${new Date().toLocaleString()}</small>
                </div>
            `;
        });
        
        html += '</div>';
        ratingsDisplay.innerHTML = html;
    }

    exportBtn.addEventListener('click', function() {
        const data = {
            ratings: ratings,
            exportDate: new Date().toISOString(),
            totalRatings: Object.values(ratings).filter(r => r.rating > 0).length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calificaciones-experimentos-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    clearBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres borrar todas las calificaciones? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('experimentRatings');
            Object.keys(ratings).forEach(experiment => {
                ratings[experiment].rating = 0;
            });
            
            // Reset all star displays
            starRatings.forEach(rating => {
                updateStars(rating, 0);
            });
            
            // Reset averages
            Object.keys(ratings).forEach(experiment => {
                updateAverage(experiment);
            });
            
            updateRatingsDisplay();
            alert('Todas las calificaciones han sido borradas.');
        }
    });
});
