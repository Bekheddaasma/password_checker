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
  const passwordLengthDisplay = document.getElementById("password-length");

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
  });

  // Copy password to clipboard
  copyBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!passwordField.value || passwordField.disabled) return;

    navigator.clipboard
      .writeText(passwordField.value)
      .then(() => {
        // Visual feedback
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
    passwordField.focus();
    updateUI();
    checkPasswordStrength(""); // Update strength meter
  });

  // Generate password
  generateLink.addEventListener("click", function (e) {
    e.preventDefault();
    generateStrongPassword();
  });

  // Update UI state
  function updateUI() {
    const hasValue = passwordField.value.length > 0;
    copyBtn.style.display = hasValue ? "block" : "none";
    clearBtn.style.display = hasValue ? "block" : "none";
    if (passwordLengthDisplay) {
      passwordLengthDisplay.textContent = `${passwordField.value.length}/8`;
    }
  }

  // Generate strong password that meets all requirements
  function generateStrongPassword() {
    const requirements = {
      length: 12, // Minimum length
      upper: true, // Requires uppercase
      lower: true, // Requires lowercase
      number: true, // Requires numbers
      special: true, // Requires special chars
    };

    const chars = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      number: "0123456789",
      special: "!@#$%^&*()",
    };

    let password = "";
    let allChars = "";

    if (requirements.upper) {
      password += getRandomChar(chars.upper);
      allChars += chars.upper;
    }
    if (requirements.lower) {
      password += getRandomChar(chars.lower);
      allChars += chars.lower;
    }
    if (requirements.number) {
      password += getRandomChar(chars.number);
      allChars += chars.number;
    }
    if (requirements.special) {
      password += getRandomChar(chars.special);
      allChars += chars.special;
    }

    for (let i = password.length; i < requirements.length; i++) {
      password += getRandomChar(allChars);
    }

    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    // Update field
    passwordField.disabled = false;
    passwordField.value = password;
    passwordField.type = "password";
    svgShow.style.display = "none";
    svgHide.style.display = "block";
    updateUI();
    checkPasswordStrength(password);
  }

  function getRandomChar(charSet) {
    return charSet.charAt(Math.floor(Math.random() * charSet.length));
  }

  // Password Strength Checker
 function checkPasswordStrength(password) {
   const indicators = {
     digits: /[0-9]/.test(password),
     symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
     capital: /[A-Z]/.test(password),
     length: password.length >= 8,
   };

   // Update checkboxes with SVG icons
   Object.keys(indicators).forEach((key) => {
     const checkbox = document.getElementById(key);
     if (checkbox) {
       const isChecked = indicators[key];
       checkbox.checked = isChecked;

       const parent = checkbox.closest(".rules__checkbox");
       if (parent) {
         const uncheckedIcon = parent.querySelector(".checkbox-icon.unchecked");
         const checkedIcon = parent.querySelector(".checkbox-icon.checked");
         const fullStrengthIcon = parent.querySelector(
           ".checkbox-icon.full-strength"
         );
         const labelText = parent.querySelector(".checkbox-label");

         if (uncheckedIcon)
           uncheckedIcon.style.display = isChecked ? "none" : "block";
         if (checkedIcon)
           checkedIcon.style.display = isChecked ? "block" : "none";
         if (fullStrengthIcon) fullStrengthIcon.style.display = "none";
         if (labelText) {
           labelText.style.color = isChecked ? "#4dff88" : "#FF6B6B";
         }
       }
     }
   });

   // Check if all requirements are met for full strength styling
   const strength = Object.values(indicators).filter(Boolean).length;
   const allMet = strength === Object.keys(indicators).length;

   if (allMet) {
     document.querySelectorAll(".rules__checkbox").forEach((checkbox) => {
       const uncheckedIcon = checkbox.querySelector(".checkbox-icon.unchecked");
       const checkedIcon = checkbox.querySelector(".checkbox-icon.checked");
       const fullStrengthIcon = checkbox.querySelector(
         ".checkbox-icon.full-strength"
       );
       const labelText = checkbox.querySelector(".checkbox-label");

       if (uncheckedIcon) uncheckedIcon.style.display = "none";
       if (checkedIcon) checkedIcon.style.display = "none";
       if (fullStrengthIcon) fullStrengthIcon.style.display = "block";
       if (labelText) {
         labelText.style.color = "#4dff88";
         labelText.style.textDecoration = "none";
       }
     });
   }

   // Rest of your strength meter logic...
   const progress = (strength / Object.keys(indicators).length) * 100;
   const indicator = document.querySelector(".indicator");
   if (indicator) {
     indicator.style.width = `${progress}%`;
     indicator.className = `indicator p-0 m-0 bg-${
       progress < 50 ? "danger" : progress < 75 ? "warning" : "success"
     }`;
   }

   // Update strength text
   const strengthText = document.querySelector(".strength-text");
   if (strengthText) {
     strengthText.textContent =
       progress < 50 ? "Weak" : progress < 75 ? "Medium" : "Strong";
     strengthText.className = `strength-text text-${
       progress < 50 ? "danger" : progress < 75 ? "warning" : "success"
     }`;
   }
 }

  // Initial UI update
  updateUI();

  // Update on input
  passwordField.addEventListener("input", function () {
    updateUI();
    checkPasswordStrength(this.value);
  });
});