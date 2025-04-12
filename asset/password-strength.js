document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const passwordField = document.getElementById("passwd");
  const formInputContainer = document.querySelector(".form__input");
  const copyBtn = document.querySelector(".copy-field");
  const clearBtn = document.querySelector(".clear-field");
  const eyeBtn = document.querySelector(".eye-show");
  const svgShow = document.querySelector(".svg-show");
  const svgHide = document.querySelector(".svg-hide");
  const generateLink = document.querySelector(".generate_pwd");

  // Store original password for strength checking
  let originalPassword = '';
  let hashedPassword = '';

  // Initialize
  passwordField.disabled = true;
  svgShow.style.display = "none";
  svgHide.style.display = "block";
  copyBtn.style.display = "none";
  clearBtn.style.display = "none";

  // Enable field when clicking anywhere in form__input (except icons)
  formInputContainer.addEventListener("click", function (e) {
    if (passwordField.disabled && !e.target.closest(".field__icon")) {
      passwordField.disabled = false;
      passwordField.focus();
      updateUI();
      document.querySelector(".field__label").style.display = "none";
    }
  });

  // Toggle password visibility
  eyeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (passwordField.disabled) return;

    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    svgShow.style.display = isPassword ? "block" : "none";
    svgHide.style.display = isPassword ? "none" : "block";
    
    // Show original password when revealed, hashed when hidden
    passwordField.value = isPassword ? originalPassword : hashedPassword;
  });

  // Copy password to clipboard
  copyBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!originalPassword || passwordField.disabled) return;

    navigator.clipboard.writeText(originalPassword)
      .then(() => {
        const feedback = document.createElement("span");
        feedback.className = "copy-feedback";
        feedback.textContent = "Copied!";
        copyBtn.appendChild(feedback);

        setTimeout(() => {
          feedback.style.opacity = "0";
          setTimeout(() => feedback.remove(), 300);
        }, 2000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
      });
  });

  // Clear password field
  clearBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    passwordField.value = "";
    originalPassword = "";
    hashedPassword = "";
    passwordField.focus();
    updateUI();
    checkPasswordStrength("");
  });

  // Generate password
  generateLink.addEventListener("click", function (e) {
    e.preventDefault();
    generateStrongPassword();
  });

  // Update UI state
  function updateUI() {
    const hasValue = originalPassword.length > 0;
    copyBtn.style.display = hasValue ? "block" : "none";
    clearBtn.style.display = hasValue ? "block" : "none";
  }

  // Generate strong password
  function generateStrongPassword() {
    const requirements = {
      length: 12,
      upper: true,
      lower: true,
      number: true,
      special: true,
    };

    const chars = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      number: "0123456789",
      special: "!@#$%^&*()",
    };

    let password = "";
    let allChars = "";

    // Ensure at least one of each required character type
    if (requirements.upper) password += getRandomChar(chars.upper);
    if (requirements.lower) password += getRandomChar(chars.lower);
    if (requirements.number) password += getRandomChar(chars.number);
    if (requirements.special) password += getRandomChar(chars.special);

    // Fill remaining length
    allChars = [chars.upper, chars.lower, chars.number, chars.special].join("");
    for (let i = password.length; i < requirements.length; i++) {
      password += getRandomChar(allChars);
    }

    // Shuffle the password
    password = password.split("").sort(() => 0.5 - Math.random()).join("");

    // Update fields
    passwordField.disabled = false;
    originalPassword = password;
    hashedPassword = hashPassword(password);
    passwordField.value = hashedPassword;
    passwordField.type = "password";
    svgShow.style.display = "none";
    svgHide.style.display = "block";
    updateUI();
    checkPasswordStrength(password);
  }

  // Hash password with SHA-256 and client-side salt
  function hashPassword(password) {
    if (!password) return '';
    
    // Generate a unique client-side salt for each password
    const clientSalt = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    
    // Hash password + salt
    const hashed = sha256(password + clientSalt);
    
    // Store the salt with the hash (format: salt:hash)
    return `${clientSalt}:${hashed}`;
  }

  // Password strength checker (unchanged)
  function checkPasswordStrength(password) {
    const indicators = {
      digits: /[0-9]/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      capital: /[A-Z]/.test(password),
      length: password.length >= 8,
    };

    // Update checkboxes
    Object.keys(indicators).forEach((key) => {
      const checkbox = document.getElementById(key);
      if (checkbox) {
        const isChecked = indicators[key];
        checkbox.checked = isChecked;

        const parent = checkbox.closest(".rules__checkbox");
        if (parent) {
          const uncheckedIcon = parent.querySelector(".checkbox-icon.unchecked");
          const checkedIcon = parent.querySelector(".checkbox-icon.checked");
          const fullStrengthIcon = parent.querySelector(".checkbox-icon.full-strength");
          const labelText = parent.querySelector(".checkbox-label");

          if (uncheckedIcon) uncheckedIcon.style.display = isChecked ? "none" : "block";
          if (checkedIcon) checkedIcon.style.display = isChecked ? "block" : "none";
          if (fullStrengthIcon) fullStrengthIcon.style.display = "none";
          if (labelText) labelText.style.color = isChecked ? "#4dff88" : "#FF6B6B";
        }
      }
    });

    // Update progress bar
    const strength = Object.values(indicators).filter(Boolean).length;
    const progress = (strength / Object.keys(indicators).length) * 100;
    const indicator = document.querySelector(".indicator");
    if (indicator) {
      indicator.style.width = `${progress}%`;
      indicator.className = `indicator p-0 m-0 bg-${
        progress < 50 ? "danger" : progress < 75 ? "warning" : "success"
      }`;
    }
  }

  // Handle input changes
  passwordField.addEventListener("input", function () {
    originalPassword = this.value;
    hashedPassword = hashPassword(originalPassword);
    updateUI();
    checkPasswordStrength(originalPassword);
  });

  // Initial UI update
  updateUI();
});

function getRandomChar(charSet) {
  return charSet.charAt(Math.floor(Math.random() * charSet.length));
}
