class PasswordStrength {
  constructor(options = {}) {
    // Default configuration
    const defaults = {
      minLength: 8,
      requireDigit: true,
      requireSpecialChar: true,
      requireUppercase: true,
      onStrengthChange: null, // Callback when strength changes
      onRequirementsMet: null // Callback when all requirements are met
    };

    // Merge options
    this.config = { ...defaults, ...options };
    this.strength = 0;
    this.requirements = {};
  }

  analyze(password) {
    const results = {
      length: password.length >= this.config.minLength,
      digit: !this.config.requireDigit || /[0-9]/.test(password),
      specialChar: !this.config.requireSpecialChar || /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: !this.config.requireUppercase || /[A-Z]/.test(password)
    };

    // Calculate strength (0-100)
    const metRequirements = Object.values(results).filter(Boolean).length;
    const totalRequirements = Object.keys(results).length;
    const newStrength = Math.round((metRequirements / totalRequirements) * 100);

    // Update state
    this.requirements = results;
    this.strength = newStrength;

    // Trigger callbacks
    if (this.config.onStrengthChange) {
      this.config.onStrengthChange(newStrength, results);
    }

    if (metRequirements === totalRequirements && this.config.onRequirementsMet) {
      this.config.onRequirementsMet(password);
    }

    return {
      strength: newStrength,
      requirements: results
    };
  }

  getStrengthLevel() {
    if (this.strength < 40) return 'weak';
    if (this.strength < 70) return 'medium';
    return 'strong';
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PasswordStrength;
} else {
  window.PasswordStrength = PasswordStrength;
}
