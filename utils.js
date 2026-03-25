// Pure utility functions for shopping list app

const AppUtils = {
  formatUnit(unit) {
    return unit === "kg" ? 'ק"ג' : "יח'";
  },

  formatAmount(amount, unit) {
    const display = unit === "kg" ? amount : Math.floor(amount);
    return `${display} ${this.formatUnit(unit)}`;
  }
};

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppUtils;
}
