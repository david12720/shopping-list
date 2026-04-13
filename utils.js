// Pure utility functions for shopping list app

const AppUtils = {
  formatUnit(unit) {
    return unit === "kg" ? 'ק"ג' : "יח'";
  },

  formatAmount(amount, unit) {
    const display = unit === "kg" ? amount : Math.floor(amount);
    return `${display} ${this.formatUnit(unit)}`;
  },

  generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
};

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppUtils;
}
