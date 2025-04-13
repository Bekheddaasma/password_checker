// password-strength.js
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

  // Initialize password strength checker
  const strengthChecker = new PasswordStrength({
    onStrengthChange: (strength, requirements) => {
      updateCheckboxes(requirements);
      updateStrengthMeter(strength);
    }
  });

  // Initialize UI
  passwordField.disabled = true;
  svgShow.style.display = "none";
  svgHide.style.display = "block";
  copyBtn.style.display = "none";
  clearBtn.style.display = "none";

  // Enable field when clicking
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
  });

  // Copy password
  copyBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!passwordField.value || passwordField.disabled) return;

    navigator.clipboard.writeText(passwordField.value)
      .then(() => showCopyFeedback());
  });

  // Clear password
  clearBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    passwordField.value = "";
    passwordField.focus();
    updateUI();
    strengthChecker.analyze("");
  });

  // Generate password
  generateLink.addEventListener("click", function (e) {
    e.preventDefault();
    generateStrongPassword();
  });

  // Password input handler
  passwordField.addEventListener("input", function () {
    updateUI();
    strengthChecker.analyze(this.value);
  });

  // Helper functions
  function updateUI() {
    const hasValue = passwordField.value.length > 0;
    copyBtn.style.display = hasValue ? "block" : "none";
    clearBtn.style.display = hasValue ? "block" : "none";
  }

  function showCopyFeedback() {
    const feedback = document.createElement("span");
    feedback.className = "copy-feedback";
    feedback.textContent = "Copied!";
    copyBtn.appendChild(feedback);

    setTimeout(() => {
      feedback.style.opacity = "0";
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }

  function updateCheckboxes(requirements) {
    const requirementMap = {
      digit: "digits",
      specialChar: "symbols",
      uppercase: "capital",
      length: "length"
    };

    Object.entries(requirementMap).forEach(([reqKey, checkboxId]) => {
      const checkbox = document.getElementById(checkboxId);
      if (!checkbox) return;

      const isMet = requirements[reqKey];
      checkbox.checked = isMet;

      const parent = checkbox.closest(".rules__checkbox");
      if (parent) {
        const uncheckedIcon = parent.querySelector(".checkbox-icon.unchecked");
        const checkedIcon = parent.querySelector(".checkbox-icon.checked");
        const fullStrengthIcon = parent.querySelector(".checkbox-icon.full-strength");
        const labelText = parent.querySelector(".checkbox-label");

        if (uncheckedIcon) uncheckedIcon.style.display = isMet ? "none" : "block";
        if (checkedIcon) checkedIcon.style.display = isMet ? "block" : "none";
        if (fullStrengthIcon) fullStrengthIcon.style.display = "none";
        if (labelText) labelText.style.color = isMet ? "#4dff88" : "#FF6B6B";
      }
    });
  }

  function updateStrengthMeter(strength) {
    const indicator = document.querySelector(".indicator");
    if (!indicator) return;

    indicator.style.width = `${strength}%`;
    indicator.className = `indicator p-0 m-0 bg-${
      strength < 50 ? "danger" : strength < 75 ? "warning" : "success"
    }`;
  }

  function generateStrongPassword() {
    const chars = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      number: "0123456789",
      special: "!@#$%^&*()"
    };

    let password = [
      getRandomChar(chars.upper),
      getRandomChar(chars.lower),
      getRandomChar(chars.number),
      getRandomChar(chars.special),
      ...Array.from({ length: 8 }, () => getRandomChar(
        chars.upper + chars.lower + chars.number + chars.special
      ))
    ].sort(() => Math.random() - 0.5).join("");

    passwordField.disabled = false;
    passwordField.value = password;
    passwordField.type = "password";
    svgShow.style.display = "none";
    svgHide.style.display = "block";
    updateUI();
    strengthChecker.analyze(password);
  }

  function getRandomChar(charSet) {
    return charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
});
