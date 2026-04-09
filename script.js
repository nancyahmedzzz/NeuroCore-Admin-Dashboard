// 1. Safe Icon Initialization
function initializeIcons() {
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error("Lucide Icons Error:", error);
    }
}

// 2. Safe Theme Management for Local Environments
window.themeConfig = {
    currentTheme: 'dark'
};

try {
    window.themeConfig.currentTheme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.warn("LocalStorage Blocked. Defaulting theme.");
}

// 3. Global Theme Toggle
window.toggleTheme = function() {
    const htmlElement = document.documentElement;
    window.themeConfig.currentTheme = window.themeConfig.currentTheme === 'dark' ? 'light' : 'dark';
    
    if (window.themeConfig.currentTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    try {
        localStorage.setItem('theme', window.themeConfig.currentTheme);
    } catch (e) {}

    // Update charts if they exist
    if(typeof updateCharts === 'function') {
        updateCharts();
    }
}

// --- Charts Area ---
let salesChartInstance = null;
let categoryPieInstance = null;
let monthlyBarInstance = null;

function getChartColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        text: isDark ? '#94a3b8' : '#64748b', // Slate
        grid: isDark ? '#1e293b' : '#e2e8f0', // Slate
        line: isDark ? '#06b6d4' : '#0ea5e9', // Medical Cyan/Sky 
        lineSecondary: isDark ? '#3b82f6' : '#2563eb', // Blue
        bgOpacity1: isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(14, 165, 233, 0.15)',
        bgOpacity2: isDark ? 'rgba(6, 182, 212, 0)' : 'rgba(14, 165, 233, 0)',
        pieColors: isDark 
            ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#1e293b'] 
            : ['#0ea5e9', '#2563eb', '#8b5cf6', '#e2e8f0']
    };
}

window.initChart = function() {
    if (typeof Chart === 'undefined') {
        return;
    }

    try {
        const colors = getChartColors();
        Chart.defaults.font.family = 'Plus Jakarta Sans';
        Chart.defaults.color = colors.text;

        // Clinical Overview Chart
        const ctxSales = document.getElementById('salesChart');
        if (ctxSales && ctxSales.offsetParent !== null) {
            const grad = ctxSales.getContext('2d').createLinearGradient(0, 0, 0, 300);
            grad.addColorStop(0, colors.bgOpacity1);
            grad.addColorStop(1, colors.bgOpacity2);

            salesChartInstance = new Chart(ctxSales, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    datasets: [{
                        label: 'Successful Procedures',
                        data: [42, 58, 32, 71, 65, 98, 84, 125],
                        borderColor: colors.line,
                        backgroundColor: grad,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: colors.line,
                        pointBorderColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1500, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text } }
                    }
                }
            });
        }

        // Pie Chart (Departments)
        const ctxPie = document.getElementById('categoryPie');
        if (ctxPie && ctxPie.offsetParent !== null) {
            categoryPieInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['Brain Tumors', 'Spinal Fusions', 'Aneurysms', 'Trauma'],
                    datasets: [{ data: [45, 35, 15, 5], backgroundColor: colors.pieColors, borderWidth: 0, hoverOffset: 10 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', animation: { animateScale: true } }
            });
        }

        // Bar Chart (Admissions vs Discharges)
        const ctxBar = document.getElementById('monthlyBar');
        if (ctxBar && ctxBar.offsetParent !== null) {
            monthlyBarInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Admissions', data: [150, 200, 185, 250, 220, 300], backgroundColor: colors.line, borderRadius: 6 },
                        { label: 'Discharges', data: [145, 190, 180, 260, 255, 270], backgroundColor: colors.lineSecondary, borderRadius: 6 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: colors.grid, drawBorder: false } } } }
            });
        }
    } catch (error) {
        console.error("Chart Rendering Error:", error);
    }
};

window.updateCharts = function() {
    if(salesChartInstance) salesChartInstance.destroy();
    if(categoryPieInstance) categoryPieInstance.destroy();
    if(monthlyBarInstance) monthlyBarInstance.destroy();
    setTimeout(window.initChart, 50);
}

// --- Main Init ---
document.addEventListener('DOMContentLoaded', () => {
    initializeIcons();

    const htmlElement = document.documentElement;
    if (window.themeConfig.currentTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    setTimeout(window.initChart, 150);
});

// Sidebar Mobile Toggle
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    
    // Create overlay if not present
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = window.toggleSidebar;
        document.body.appendChild(overlay);
    }

    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }
};
// --- Notifications Logic ---
window.toggleNotifDropdown = function() {
    const dropdown = document.getElementById('notifDropdown');
    const isVisible = dropdown.classList.contains('invisible');
    
    if (isVisible) {
        dropdown.classList.remove('invisible', 'opacity-0', 'translate-y-2');
        dropdown.classList.add('visible', 'opacity-100', 'translate-y-0');
    } else {
        dropdown.classList.add('invisible', 'opacity-0', 'translate-y-2');
        dropdown.classList.remove('visible', 'opacity-100', 'translate-y-0');
    }
};

window.openNotifDrawer = function() {
    // Close dropdown first
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.add('invisible', 'opacity-0', 'translate-y-2');
    
    const overlay = document.getElementById('notifDrawerOverlay');
    const drawer = document.getElementById('notifDrawer');
    
    overlay.classList.remove('invisible', 'opacity-0');
    overlay.classList.add('visible', 'opacity-100');
    
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
};

window.closeNotifDrawer = function() {
    const overlay = document.getElementById('notifDrawerOverlay');
    const drawer = document.getElementById('notifDrawer');
    
    overlay.classList.add('invisible', 'opacity-0');
    overlay.classList.remove('visible', 'opacity-100');
    
    drawer.classList.add('translate-x-full');
    drawer.classList.remove('translate-x-0');
};

window.markAllAsRead = function() {
    const badge = document.getElementById('notifBadge');
    if (badge) badge.classList.add('hidden');
    
    const drawerList = document.getElementById('notifDrawerList');
    const dropdownList = document.getElementById('notifDropdownList');
    
    const emptyState = `
        <div class="flex flex-col items-center justify-center h-64 text-center p-6 anima-fade-in">
            <div class="w-16 h-16 bg-[var(--btn-success)]/10 text-[var(--btn-success)] rounded-full flex items-center justify-center mb-4">
                <i data-lucide="check-check" class="w-8 h-8"></i>
            </div>
            <h3 class="font-bold text-main">All caught up!</h3>
            <p class="text-xs text-sec mt-2">No new notifications at the moment.</p>
        </div>
    `;
    
    if (drawerList) drawerList.innerHTML = emptyState;
    if (dropdownList) {
        dropdownList.innerHTML = `
            <div class="p-8 text-center">
                <p class="text-sm text-sec font-medium">No new notifications</p>
            </div>
        `;
    }
    
    initializeIcons();
};

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const btn = document.getElementById('notifBtn');
    
    if (dropdown && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.add('invisible', 'opacity-0', 'translate-y-2');
        dropdown.classList.remove('visible', 'opacity-100', 'translate-y-0');
    }
});

// --- Add Patient Modal Logic ---
window.openAddPatientModal = function() {
    const modal = document.getElementById('addPatientModal');
    const content = modal.querySelector('div:nth-child(2)');
    
    modal.classList.remove('invisible', 'opacity-0');
    modal.classList.add('visible', 'opacity-100');
    
    content.classList.remove('scale-95');
    content.classList.add('scale-100');
};

window.closeAddPatientModal = function() {
    const modal = document.getElementById('addPatientModal');
    const content = modal.querySelector('div:nth-child(2)');
    
    modal.classList.add('invisible', 'opacity-0');
    modal.classList.remove('visible', 'opacity-100');
    
    content.classList.add('scale-95');
    content.classList.remove('scale-100');
};

// Form Processing
document.addEventListener('DOMContentLoaded', () => {
    const addPatientForm = document.getElementById('addPatientForm');
    if (addPatientForm) {
        addPatientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const submitLoader = document.getElementById('submitLoader');
            const submitText = submitBtn.querySelector('span');
            
            // Show Loading
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';
            submitLoader.classList.remove('hidden');
            submitText.innerText = 'Processing...';
            
            setTimeout(() => {
                const formData = new FormData(addPatientForm);
                const name = formData.get('name');
                const mrn = formData.get('mrn');
                const diag = formData.get('diag');
                const doc = formData.get('doc');
                const status = formData.get('status');
                
                // Get badge class
                let badgeClass = 'badge-available';
                if (status === 'Critical') badgeClass = 'badge-critical';
                if (status === 'ICU') badgeClass = 'badge-critical';
                if (status === 'Observation') badgeClass = 'badge-pending';
                if (status === 'Stable') badgeClass = 'badge-available';
                
                const tableBody = document.getElementById('patientsTableBody');
                if (tableBody) {
                    const newRow = document.createElement('tr');
                    newRow.className = "table-row cursor-pointer group bg-green-50/50 dark:bg-green-900/10 transition-all duration-1000";
                    newRow.innerHTML = `
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E88E5&color=fff&rounded=true" class="w-10 h-10 rounded-full group-hover:scale-105 transition-transform" />
                                <div>
                                    <p class="font-bold text-main">${name}</p>
                                    <p class="text-xs text-sec mt-0.5">${mrn}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 font-bold text-main">${diag}</td>
                        <td class="px-6 py-4 text-sec">${doc}</td>
                        <td class="px-6 py-4">
                            <span class="badge ${badgeClass}">${status}</span>
                        </td>
                    `;
                    
                    tableBody.prepend(newRow);
                    
                    // Re-init icons 
                    initializeIcons();
                    
                    // Remove highlight after 2s
                    setTimeout(() => {
                        newRow.classList.remove('bg-green-50/50', 'dark:bg-green-900/10');
                    }, 2000);
                }
                
                // Reset and Close
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitLoader.classList.add('hidden');
                submitText.innerText = 'Confirm Admission';
                addPatientForm.reset();
                closeAddPatientModal();
                
            }, 1000);
        });
    }
});

// Update Icons on various events
window.addEventListener('load', initializeIcons);
