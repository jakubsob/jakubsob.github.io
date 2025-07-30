// Global search state management
window.globalSearch = {
  isOpen: false,
  callbacks: [],

  open() {
    this.isOpen = true;
    this.callbacks.forEach(callback => callback(true));
  },

  close() {
    this.isOpen = false;
    this.callbacks.forEach(callback => callback(false));
  },

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  subscribe(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
};

// Global keyboard shortcut
document.addEventListener("keydown", function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    window.globalSearch.open();
  }
});
