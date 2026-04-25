// Todo List Life Dashboard - Main Application Logic

// ============================================================================
// Storage Helper Functions
// ============================================================================

/**
 * Display a non-intrusive warning message to the user
 * @param {string} message - The warning message to display
 */
function showStorageWarning(message) {
  const warningElement = document.getElementById("storageWarning");
  const messageElement = document.getElementById("storageWarningMessage");
  const closeButton = document.getElementById("storageWarningClose");

  if (!warningElement || !messageElement) {
    return;
  }

  messageElement.textContent = message;
  warningElement.style.display = "flex";

  // Auto-hide after 10 seconds
  const autoHideTimeout = setTimeout(() => {
    hideStorageWarning();
  }, 10000);

  // Close button handler
  if (closeButton) {
    closeButton.onclick = () => {
      clearTimeout(autoHideTimeout);
      hideStorageWarning();
    };
  }
}

/**
 * Hide the storage warning message
 */
function hideStorageWarning() {
  const warningElement = document.getElementById("storageWarning");
  if (warningElement) {
    warningElement.style.display = "none";
  }
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {*} data - The data to save (will be JSON stringified)
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage (key: "${key}"):`, error);

    // Handle quota exceeded or disabled storage gracefully
    if (error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded. Data was not saved.");
      showStorageWarning(
        "⚠️ Storage quota exceeded. Your changes will not be saved. Please free up space or clear old data.",
      );
    } else if (error.name === "SecurityError") {
      console.error(
        "localStorage is disabled or unavailable. Data was not saved.",
      );
      showStorageWarning(
        "⚠️ Storage is unavailable. Your changes will not be saved. Please check your browser settings.",
      );
    } else {
      // Generic storage error
      showStorageWarning(
        "⚠️ Unable to save your changes. Your data will only be available during this session.",
      );
    }
  }
}

/**
 * Load data from localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - The fallback value if loading fails
 * @returns {*} The parsed data or defaultValue
 */
function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    if (data === null) {
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load from localStorage (key: "${key}"):`, error);

    // Clear corrupted data to prevent repeated errors
    try {
      localStorage.removeItem(key);
      console.error(`Corrupted data cleared for key: "${key}"`);
      showStorageWarning(
        "⚠️ Corrupted data was found and cleared. Starting with a fresh state.",
      );
    } catch (clearError) {
      console.error(`Failed to clear corrupted data for key: "${key}"`);
    }

    return defaultValue;
  }
}

// Application initialization
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme first
  ThemeManager.init();
  // Initialize all components
  GreetingDisplay.init();
  FocusTimer.init();
  TaskList.init();
  QuickLinksPanel.init();
});

// ============================================================================
// Theme Manager Component
// ============================================================================
const ThemeManager = {
  storageKey: "dashboard_theme",
  currentTheme: "light",

  init() {
    // Load saved theme or default to light
    this.currentTheme = loadFromStorage(this.storageKey, "light");
    this.applyTheme(this.currentTheme);
    this.attachEventListeners();
  },

  attachEventListeners() {
    const toggleButton = document.getElementById("themeToggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => this.toggleTheme());
    }
  },

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(this.currentTheme);
    saveToStorage(this.storageKey, this.currentTheme);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggleButton = document.getElementById("themeToggle");
    if (toggleButton) {
      toggleButton.textContent = theme === "light" ? "🌙" : "☀️";
      toggleButton.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode",
      );
    }
  },
};

// ============================================================================
// Greeting Display Component
// ============================================================================
const GreetingDisplay = {
  storageKey: "dashboard_username",
  userName: "",

  init() {
    this.userName = loadFromStorage(this.storageKey, "");
    this.updateTime();
    // Update time every second
    setInterval(() => this.updateTime(), 1000);
    this.attachEventListeners();
  },

  attachEventListeners() {
    const editButton = document.getElementById("greetingEditBtn");
    if (editButton) {
      editButton.addEventListener("click", () => this.showNameModal());
    }
  },

  showNameModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h3>Customize Your Name</h3>
        <input 
          type="text" 
          id="nameInput" 
          class="modal-input" 
          placeholder="Enter your name (optional)"
          value="${this.escapeHtml(this.userName)}"
          maxlength="50"
        />
        <div class="modal-actions">
          <button class="btn btn-secondary" id="cancelNameBtn">Cancel</button>
          <button class="btn btn-primary" id="saveNameBtn">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const nameInput = document.getElementById("nameInput");
    const saveBtn = document.getElementById("saveNameBtn");
    const cancelBtn = document.getElementById("cancelNameBtn");

    // Focus input
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }

    // Save handler
    const saveName = () => {
      if (nameInput) {
        this.userName = nameInput.value.trim();
        saveToStorage(this.storageKey, this.userName);
        this.updateTime();
      }
      modal.remove();
    };

    // Cancel handler
    const cancel = () => {
      modal.remove();
    };

    if (saveBtn) {
      saveBtn.addEventListener("click", saveName);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", cancel);
    }

    // Enter key to save
    if (nameInput) {
      nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveName();
        }
      });
    }

    // Click outside to cancel
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        cancel();
      }
    });
  },

  updateTime() {
    const now = new Date();
    const timeElement = document.getElementById("currentTime");
    const dateElement = document.getElementById("currentDate");
    const greetingElement = document.getElementById("greetingMessage");

    if (timeElement) {
      timeElement.textContent = this.formatTime(now);
    }
    if (dateElement) {
      dateElement.textContent = this.formatDate(now);
    }
    if (greetingElement) {
      const greeting = this.getGreeting(now.getHours());
      const nameText = this.userName ? `, ${this.userName}` : "";

      // Find or create the greeting text node
      let textNode = greetingElement.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode("");
        greetingElement.insertBefore(textNode, greetingElement.firstChild);
      }
      textNode.textContent = `${greeting}${nameText}\n          `;
    }
  },

  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss} ${period}`;
  },

  formatDate(date) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNumber = date.getDate();

    return `${dayName}, ${monthName} ${dayNumber}`;
  },

  getGreeting(hour) {
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

// ============================================================================
// Focus Timer Component
// ============================================================================
const FocusTimer = {
  totalSeconds: 1500, // 25 minutes
  remainingSeconds: 1500,
  isRunning: false,
  intervalId: null,
  storageKey: "dashboard_timer_duration",

  init() {
    // Load custom timer duration if set
    this.totalSeconds = loadFromStorage(this.storageKey, 1500);
    this.remainingSeconds = this.totalSeconds;
    this.render();
    this.attachEventListeners();
  },

  attachEventListeners() {
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const resetButton = document.getElementById("resetButton");
    const settingsButton = document.getElementById("timerSettingsBtn");

    if (startButton) {
      startButton.addEventListener("click", () => this.start());
    }
    if (stopButton) {
      stopButton.addEventListener("click", () => this.stop());
    }
    if (resetButton) {
      resetButton.addEventListener("click", () => this.reset());
    }
    if (settingsButton) {
      settingsButton.addEventListener("click", () => this.showSettingsModal());
    }
  },

  showSettingsModal() {
    const currentMinutes = Math.floor(this.totalSeconds / 60);

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h3>Timer Settings</h3>
        <label for="timerMinutesInput" style="display: block; margin-bottom: 8px; color: var(--color-text-secondary); font-size: 0.875rem;">
          Duration (minutes):
        </label>
        <input 
          type="number" 
          id="timerMinutesInput" 
          class="modal-input" 
          placeholder="Enter minutes (1-120)"
          value="${currentMinutes}"
          min="1"
          max="120"
        />
        <div class="modal-actions">
          <button class="btn btn-secondary" id="cancelTimerBtn">Cancel</button>
          <button class="btn btn-primary" id="saveTimerBtn">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const minutesInput = document.getElementById("timerMinutesInput");
    const saveBtn = document.getElementById("saveTimerBtn");
    const cancelBtn = document.getElementById("cancelTimerBtn");

    // Focus input
    if (minutesInput) {
      minutesInput.focus();
      minutesInput.select();
    }

    // Save handler
    const saveSettings = () => {
      if (minutesInput) {
        const minutes = parseInt(minutesInput.value, 10);
        if (minutes >= 1 && minutes <= 120) {
          this.totalSeconds = minutes * 60;
          this.remainingSeconds = this.totalSeconds;
          saveToStorage(this.storageKey, this.totalSeconds);
          this.render();
        }
      }
      modal.remove();
    };

    // Cancel handler
    const cancel = () => {
      modal.remove();
    };

    if (saveBtn) {
      saveBtn.addEventListener("click", saveSettings);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", cancel);
    }

    // Enter key to save
    if (minutesInput) {
      minutesInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveSettings();
        }
      });
    }

    // Click outside to cancel
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        cancel();
      }
    });
  },

  start() {
    // Prevent multiple simultaneous intervals
    if (this.isRunning) return;

    // Prevent starting if already at 00:00
    if (this.remainingSeconds === 0) return;

    // Clear any existing interval as a safety measure
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.render();
  },

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.render();
  },

  reset() {
    this.stop();
    this.remainingSeconds = this.totalSeconds;
    this.render();
  },

  tick() {
    // Ensure timer stops at 00:00 without going negative
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.render();
    }

    // Auto-stop when reaching 00:00
    if (this.remainingSeconds === 0) {
      this.stop();
    }
  },

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  },

  render() {
    const displayElement = document.getElementById("timerDisplay");
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const resetButton = document.getElementById("resetButton");

    if (displayElement) {
      displayElement.textContent = this.formatTime(this.remainingSeconds);
    }

    // Disable buttons during state transitions to prevent race conditions
    if (startButton) {
      // Disable start button when running or when timer is at 00:00
      startButton.disabled = this.isRunning || this.remainingSeconds === 0;
    }
    if (stopButton) {
      stopButton.disabled = !this.isRunning;
    }
    if (resetButton) {
      // Disable reset button when running to prevent state conflicts
      resetButton.disabled = this.isRunning;
    }
  },
};

// ============================================================================
// Task List Component
// ============================================================================
const TaskList = {
  tasks: [],
  storageKey: "dashboard_tasks",
  editingTaskId: null,
  sortOrder: "default", // default, alphabetical, completed

  init() {
    this.loadFromStorage();
    this.render();
    this.attachEventListeners();
  },

  attachEventListeners() {
    const form = document.getElementById("taskForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("taskInput");
        if (input) {
          this.addTask(input.value);
          input.value = "";
        }
      });
    }

    // Sort button event listeners
    const sortDefaultBtn = document.getElementById("sortDefault");
    const sortAlphaBtn = document.getElementById("sortAlphabetical");
    const sortCompletedBtn = document.getElementById("sortCompleted");

    if (sortDefaultBtn) {
      sortDefaultBtn.addEventListener("click", () =>
        this.setSortOrder("default"),
      );
    }
    if (sortAlphaBtn) {
      sortAlphaBtn.addEventListener("click", () =>
        this.setSortOrder("alphabetical"),
      );
    }
    if (sortCompletedBtn) {
      sortCompletedBtn.addEventListener("click", () =>
        this.setSortOrder("completed"),
      );
    }
  },

  setSortOrder(order) {
    this.sortOrder = order;
    this.render();
  },

  getSortedTasks() {
    const tasksCopy = [...this.tasks];

    switch (this.sortOrder) {
      case "alphabetical":
        return tasksCopy.sort((a, b) =>
          a.text.toLowerCase().localeCompare(b.text.toLowerCase()),
        );
      case "completed":
        return tasksCopy.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
      case "default":
      default:
        return tasksCopy.sort((a, b) => a.createdAt - b.createdAt);
    }
  },

  startEdit(id) {
    this.editingTaskId = id;
    this.render();
    // Focus the edit input after render
    const editInput = document.getElementById(`edit-input-${id}`);
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  },

  saveEdit(id) {
    const editInput = document.getElementById(`edit-input-${id}`);
    if (editInput) {
      const newText = editInput.value.trim();
      if (this.validateTaskText(newText)) {
        this.updateTask(id, { text: newText });
        this.editingTaskId = null;
      }
    }
  },

  cancelEdit() {
    this.editingTaskId = null;
    this.render();
  },

  addTask(text) {
    const trimmedText = text.trim();
    if (!this.validateTaskText(trimmedText)) {
      this.showValidationError("taskInput", "Task cannot be empty");
      return;
    }

    if (trimmedText.length > 500) {
      this.showValidationError(
        "taskInput",
        "Task text cannot exceed 500 characters",
      );
      return;
    }

    // Check for duplicate tasks
    const isDuplicate = this.tasks.some(
      (task) => task.text.toLowerCase() === trimmedText.toLowerCase(),
    );

    if (isDuplicate) {
      this.showValidationError(
        "taskInput",
        "This task already exists in your list",
      );
      return;
    }

    const task = {
      id: Date.now().toString(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
    };

    this.tasks.push(task);
    this.saveToStorage();
    this.render();
  },

  updateTask(id, updates) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      return;
    }

    // If updating text, validate it first
    if (updates.text !== undefined) {
      const trimmedText = updates.text.trim();
      if (!this.validateTaskText(trimmedText)) {
        this.showValidationError(`edit-input-${id}`, "Task cannot be empty");
        return;
      }
      if (trimmedText.length > 500) {
        this.showValidationError(
          `edit-input-${id}`,
          "Task text cannot exceed 500 characters",
        );
        return;
      }

      // Check for duplicate tasks (excluding current task)
      const isDuplicate = this.tasks.some(
        (t) =>
          t.id !== id && t.text.toLowerCase() === trimmedText.toLowerCase(),
      );

      if (isDuplicate) {
        this.showValidationError(
          `edit-input-${id}`,
          "This task already exists in your list",
        );
        return;
      }

      updates.text = trimmedText;
    }

    Object.assign(task, updates);
    this.saveToStorage();
    this.render();
  },

  deleteTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveToStorage();
    this.render();
  },

  toggleComplete(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
      this.render();
    }
  },

  validateTaskText(text) {
    return text.length > 0;
  },

  showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Add error styling
    input.classList.add("input-error");

    // Create or update error message
    let errorElement = input.parentElement.querySelector(".validation-error");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "validation-error";
      input.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;

    // Add shake animation
    input.classList.add("shake");

    // Remove error styling after 3 seconds
    setTimeout(() => {
      input.classList.remove("input-error", "shake");
      if (errorElement) {
        errorElement.remove();
      }
    }, 3000);
  },

  loadFromStorage() {
    this.tasks = loadFromStorage(this.storageKey, []);
  },

  saveToStorage() {
    saveToStorage(this.storageKey, this.tasks);
  },

  render() {
    const listElement = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyTaskState");

    // Update sort button states
    const sortDefaultBtn = document.getElementById("sortDefault");
    const sortAlphaBtn = document.getElementById("sortAlphabetical");
    const sortCompletedBtn = document.getElementById("sortCompleted");

    if (sortDefaultBtn) {
      sortDefaultBtn.classList.toggle("active", this.sortOrder === "default");
    }
    if (sortAlphaBtn) {
      sortAlphaBtn.classList.toggle(
        "active",
        this.sortOrder === "alphabetical",
      );
    }
    if (sortCompletedBtn) {
      sortCompletedBtn.classList.toggle(
        "active",
        this.sortOrder === "completed",
      );
    }

    if (!listElement) return;

    if (this.tasks.length === 0) {
      listElement.innerHTML = "";
      if (emptyState) {
        emptyState.style.display = "block";
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = "none";
    }

    const sortedTasks = this.getSortedTasks();

    listElement.innerHTML = sortedTasks
      .map((task) => {
        const isEditing = this.editingTaskId === task.id;

        if (isEditing) {
          // Edit mode UI
          return `
            <li class="task-item task-item-editing">
                <input 
                    type="text" 
                    id="edit-input-${task.id}"
                    class="task-edit-input" 
                    value="${this.escapeHtml(task.text)}"
                    maxlength="500"
                >
                <div class="task-actions">
                    <button class="btn btn-small btn-primary" onclick="TaskList.saveEdit('${task.id}')">Save</button>
                    <button class="btn btn-small btn-secondary" onclick="TaskList.cancelEdit()">Cancel</button>
                </div>
            </li>
          `;
        } else {
          // Normal display mode
          return `
            <li class="task-item">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? "checked" : ""}
                    onchange="TaskList.toggleComplete('${task.id}')"
                >
                <span class="task-text ${task.completed ? "completed" : ""}">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="btn btn-small btn-secondary" onclick="TaskList.startEdit('${task.id}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="TaskList.deleteTask('${task.id}')">Delete</button>
                </div>
            </li>
          `;
        }
      })
      .join("");
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

// ============================================================================
// Quick Links Panel Component
// ============================================================================
const QuickLinksPanel = {
  links: [],
  storageKey: "dashboard_links",

  init() {
    this.loadFromStorage();
    this.render();
    this.attachEventListeners();
  },

  attachEventListeners() {
    const form = document.getElementById("linkForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const urlInput = document.getElementById("linkUrl");
        const labelInput = document.getElementById("linkLabel");

        if (urlInput && labelInput) {
          this.addLink(urlInput.value, labelInput.value);
          urlInput.value = "";
          labelInput.value = "";
        }
      });
    }
  },

  addLink(url, label) {
    const trimmedUrl = url.trim();
    const trimmedLabel = label.trim();

    if (!this.validateLink(trimmedUrl, trimmedLabel)) {
      if (trimmedUrl.length === 0) {
        this.showValidationError("linkUrl", "URL cannot be empty");
      }
      if (trimmedLabel.length === 0) {
        this.showValidationError("linkLabel", "Label cannot be empty");
      }
      return;
    }

    if (trimmedLabel.length > 50) {
      this.showValidationError(
        "linkLabel",
        "Label cannot exceed 50 characters",
      );
      return;
    }

    const normalizedUrl = this.normalizeURL(trimmedUrl);
    if (!normalizedUrl) {
      this.showValidationError("linkUrl", "Invalid URL");
      return;
    }

    const link = {
      id: Date.now().toString(),
      url: normalizedUrl,
      label: trimmedLabel,
    };

    this.links.push(link);
    this.saveToStorage();
    this.render();
  },

  deleteLink(id) {
    this.links = this.links.filter((l) => l.id !== id);
    this.saveToStorage();
    this.render();
  },

  validateLink(url, label) {
    // Both must be non-empty after trimming
    if (url.length === 0 || label.length === 0) {
      return false;
    }

    // Label must not exceed 50 characters
    if (label.length > 50) {
      return false;
    }

    return true;
  },

  normalizeURL(url) {
    if (!url) return null;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  },

  openLink(url) {
    window.open(url, "_blank");
  },

  loadFromStorage() {
    this.links = loadFromStorage(this.storageKey, []);
  },

  saveToStorage() {
    saveToStorage(this.storageKey, this.links);
  },

  render() {
    const listElement = document.getElementById("linksList");
    if (!listElement) return;

    if (this.links.length === 0) {
      listElement.innerHTML =
        '<div class="empty-state">No quick links yet. Add one to get started!</div>';
      return;
    }

    listElement.innerHTML = this.links
      .map(
        (link) => `
            <div class="link-item">
                <button class="link-label" onclick="QuickLinksPanel.openLink('${this.escapeHtml(link.url)}')" aria-label="Open ${this.escapeHtml(link.label)}">
                    ${this.escapeHtml(link.label)}
                </button>
                <button class="link-delete" onclick="QuickLinksPanel.deleteLink('${link.id}')" aria-label="Delete link">
                    ×
                </button>
            </div>
        `,
      )
      .join("");
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Add error styling
    input.classList.add("input-error");

    // Create or update error message
    let errorElement = input.parentElement.querySelector(".validation-error");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "validation-error";
      input.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;

    // Add shake animation
    input.classList.add("shake");

    // Remove error styling after 3 seconds
    setTimeout(() => {
      input.classList.remove("input-error", "shake");
      if (errorElement) {
        errorElement.remove();
      }
    }, 3000);
  },
};
