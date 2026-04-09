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
