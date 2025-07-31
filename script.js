// Static data for the dashboard
const staticData = {
    // API Keys
    apiKeys: [
        { 
            id: 1,
            key: "sk-****abcd", 
            fullKey: "sk-1234567890abcdef1234567890abcdef",
            created: "2025-07-10", 
            status: "active",
            name: "Production Key",
            hidden: true
        },
        { 
            id: 2,
            key: "sk-****efgh", 
            fullKey: "sk-0987654321efgh0987654321efgh0987",
            created: "2025-07-20", 
            status: "active",
            name: "Development Key",
            hidden: true
        }
    ],
    
    // Usage Stats
    usageStats: {
        requestsToday: 152,
        requestsMonth: 2800,
        pointsUsed: 1266763,
        pointsQuota: 2500000
    },
    
    // Usage Chart (last 7 days)
    chartData: [120, 180, 210, 160, 90, 170, 150],
    chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    
    // Recent Activity
    recentActivity: [
        { time: "13:01", endpoint: "/v1/chat/completions", status: 200, points: 200 },
        { time: "12:45", endpoint: "/v1/chat/completions", status: 401, points: 0 },
        { time: "12:20", endpoint: "/v1/chat/completions", status: 429, points: 0 },
        { time: "12:15", endpoint: "/v1/chat/completions", status: 200, points: 180 },
        { time: "12:10", endpoint: "/v1/models", status: 200, points: 5 },
        { time: "12:05", endpoint: "/v1/chat/completions", status: 200, points: 220 },
        { time: "12:00", endpoint: "/v1/chat/completions", status: 200, points: 150 },
        { time: "11:55", endpoint: "/v1/chat/completions", status: 429, points: 0 },
        { time: "11:50", endpoint: "/v1/chat/completions", status: 200, points: 190 },
        { time: "11:45", endpoint: "/v1/models", status: 200, points: 5 }
    ]
};

// Chart instance
let usageChart;

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    renderApiKeys();
    renderRecentActivity();
    setupEventListeners();
});

// Initialize the usage chart
function initializeChart() {
    const ctx = document.getElementById('usageChart').getContext('2d');
    
    usageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: staticData.chartLabels,
            datasets: [{
                label: 'API Requests',
                data: staticData.chartData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            },
            elements: {
                point: {
                    hoverBackgroundColor: '#1e40af'
                }
            }
        }
    });
}

// Render API keys list
function renderApiKeys() {
    const container = document.getElementById('apiKeysList');
    
    container.innerHTML = staticData.apiKeys.map(key => `
        <div class="api-key-item">
            <div class="api-key-info">
                <div class="api-key-value" id="key-${key.id}">
                    ${key.hidden ? key.key : key.fullKey}
                </div>
                <div class="api-key-meta">
                    ${key.name} • Created ${formatDate(key.created)} • ${key.status}
                </div>
            </div>
            <div class="api-key-actions">
                <button class="btn btn-secondary btn-small" onclick="toggleKeyVisibility(${key.id})">
                    <i class="fas ${key.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    ${key.hidden ? 'Show' : 'Hide'}
                </button>
                <button class="btn btn-secondary btn-small" onclick="copyApiKey(${key.id})">
                    <i class="fas fa-copy"></i>
                    Copy
                </button>
                <button class="btn btn-danger btn-small" onclick="revokeApiKey(${key.id})">
                    <i class="fas fa-trash"></i>
                    Revoke
                </button>
            </div>
        </div>
    `).join('');
}

// Render recent activity table
function renderRecentActivity() {
    const tbody = document.getElementById('activityTableBody');
    
    tbody.innerHTML = staticData.recentActivity.map(activity => `
        <tr>
            <td>${activity.time}</td>
            <td><code>${activity.endpoint}</code></td>
            <td><span class="status-badge status-${activity.status}">${activity.status}</span></td>
            <td>${activity.points}</td>
        </tr>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Create key modal
    const createKeyBtn = document.getElementById('createKeyBtn');
    const modal = document.getElementById('createKeyModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmCreateBtn = document.getElementById('confirmCreateBtn');
    
    createKeyBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });
    
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    confirmCreateBtn.addEventListener('click', () => {
        createNewApiKey();
        modal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // Copy code samples
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);
            copyToClipboard(codeElement.textContent);
        });
    });
}

// Toggle API key visibility
function toggleKeyVisibility(keyId) {
    const key = staticData.apiKeys.find(k => k.id === keyId);
    if (key) {
        key.hidden = !key.hidden;
        renderApiKeys();
    }
}

// Copy API key to clipboard
function copyApiKey(keyId) {
    const key = staticData.apiKeys.find(k => k.id === keyId);
    if (key) {
        copyToClipboard(key.fullKey);
    }
}

// Revoke API key
function revokeApiKey(keyId) {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
        const keyIndex = staticData.apiKeys.findIndex(k => k.id === keyId);
        if (keyIndex !== -1) {
            staticData.apiKeys.splice(keyIndex, 1);
            renderApiKeys();
            showToast('API key revoked successfully');
        }
    }
}

// Create new API key
function createNewApiKey() {
    const keyName = document.getElementById('keyName').value || 'Unnamed Key';
    const permissions = document.getElementById('keyPermissions').value;
    
    // Generate a mock API key
    const newKey = {
        id: Date.now(),
        key: `sk-****${Math.random().toString(36).substr(2, 4)}`,
        fullKey: `sk-${Math.random().toString(36).substr(2, 32)}`,
        created: new Date().toISOString().split('T')[0],
        status: 'active',
        name: keyName,
        hidden: true
    };
    
    staticData.apiKeys.push(newKey);
    renderApiKeys();
    
    // Clear form
    document.getElementById('keyName').value = '';
    document.getElementById('keyPermissions').value = 'read';
    
    showToast('New API key created successfully');
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard');
    } catch (err) {
        showToast('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textArea);
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Simulate real-time updates (optional)
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Update requests today with small random increment
        staticData.usageStats.requestsToday += Math.floor(Math.random() * 3);
        
        // Update the display (you could re-render stats here)
        const requestsTodayElement = document.querySelector('.stat-number');
        if (requestsTodayElement) {
            requestsTodayElement.textContent = staticData.usageStats.requestsToday.toLocaleString();
        }
        
        // Add new activity occasionally
        if (Math.random() < 0.1) { // 10% chance every interval
            const endpoints = ['/v1/chat/completions', '/v1/models'];
            const selectedEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
            const newActivity = {
                time: new Date().toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                endpoint: selectedEndpoint,
                status: Math.random() < 0.8 ? 200 : (Math.random() < 0.5 ? 401 : 429),
                points: selectedEndpoint === '/v1/models' ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 300) + 50
            };
            
            staticData.recentActivity.unshift(newActivity);
            staticData.recentActivity = staticData.recentActivity.slice(0, 10); // Keep only last 10
            renderRecentActivity();
        }
    }, 5000); // Update every 5 seconds
}

// Uncomment the line below to enable real-time simulation
// simulateRealTimeUpdates();

// Handle responsive chart resize
window.addEventListener('resize', () => {
    if (usageChart) {
        usageChart.resize();
    }
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });
    
    // Add loading states for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                }, 1000);
            }
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('createKeyModal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    }
    
    // Ctrl/Cmd + K to focus on create key button
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('createKeyBtn').focus();
    }
});

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Console welcome message
console.log('%c🚀 Poe API Dashboard Loaded Successfully!', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%cDashboard features:', 'color: #64748b; font-size: 14px;');
console.log('• API Key Management with show/hide functionality');
console.log('• Real-time usage analytics and charts');
console.log('• Recent activity monitoring');
console.log('• Code samples with copy functionality');
console.log('• Responsive design for all devices');
console.log('%cEnjoy exploring the dashboard! 🎉', 'color: #10b981; font-size: 14px;');

// Export functions for potential external use
window.PoeApiDashboard = {
    toggleKeyVisibility,
    copyApiKey,
    revokeApiKey,
    createNewApiKey,
    showToast,
    staticData
};