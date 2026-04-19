// js/utils.js
window.RRDCH_UTILS = {
    showToast: function(message, type = 'success') {
        let toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast";
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.background = type === 'success' ? '#22c55e' : (type === 'error' ? '#ef4444' : '#3b82f6');
        toast.style.display = "block";
        
        setTimeout(() => toast.style.display = "none", 3000);
    },
    
    showElement: function(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    },

    hideElement: function(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    },

    saveToStorage: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    getFromStorage: function(key, defaultValue = null) {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
    }
};
