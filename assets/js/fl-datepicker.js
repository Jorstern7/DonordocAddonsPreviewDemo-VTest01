/*
 * FLDatePicker - Lightweight Date & Time Picker
 * Version: 1.0.0
 * Author: FRONTLENS LLC
 * Zero dependencies. Works with any CSS framework.
 *
 * Usage:
 *   new FLDatePicker(wrapperEl, { type: 'date' });
 *   new FLDatePicker(wrapperEl, { type: 'time', timeStep: 15 });
 */

(function () {
  "use strict";

  /* ── Track open instance globally (only one popover at a time) ── */
  var _activeInstance = null;

  /* ── Defaults ───────────────────────────────────────────────────── */
  var DEFAULTS = {
    type: "date",
    format: "MM/DD/YYYY",
    placeholder: "",
    minDate: null,
    maxDate: null,
    // When true (for type === "date"), automatically prevents selecting
    // past dates by setting minDate to today (at midnight) unless a
    // custom minDate is already provided.
    disablePast: false,
    // When true, the popover closes after selecting a date or time.
    // When false, it stays open and highlights the selection.
    closeOnSelect: true,
    // If > 0 (ms), popover closes this many ms after selection so the user
    // briefly sees the selected date/time. Use with closeOnSelect: false.
    closeOnSelectDelay: 0,
    timeStep: 15,
    errorMessage: "This field is required.",
    disabledTimes: [],
  };

  /* ── Helpers ────────────────────────────────────────────────────── */
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function formatDate(date, fmt) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var y = date.getFullYear();
    return fmt.replace("MM", pad(m)).replace("DD", pad(d)).replace("YYYY", y);
  }

  function formatTime(hours, minutes) {
    var ampm = hours >= 12 ? "PM" : "AM";
    var h = hours % 12 || 12;
    return h + ":" + pad(minutes) + " " + ampm;
  }

  var MONTH_NAMES = [
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

  var DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  /* ── Constructor ────────────────────────────────────────────────── */
  function FLDatePicker(el, opts) {
    if (!el) {
      console.warn("FLDatePicker: wrapper element is required.");
      return;
    }

    this.opts = {};
    for (var k in DEFAULTS) {
      this.opts[k] = opts && opts[k] !== undefined ? opts[k] : DEFAULTS[k];
    }

    if (
      this.opts.type === "date" &&
      this.opts.disablePast &&
      !this.opts.minDate
    ) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      this.opts.minDate = today;
    }

    this.wrapper = el;
    this.input = el.querySelector(".fl-picker-input");
    if (!this.input) {
      console.warn("FLDatePicker: .fl-picker-input not found inside wrapper.");
      return;
    }

    // Set placeholder from options if provided
    if (this.opts.placeholder) {
      this.input.placeholder = this.opts.placeholder;
    }

    this.isOpen = false;
    this.selectedDate = null;
    this.selectedTimeValue = null;
    this.viewMonth = new Date().getMonth();
    this.viewYear = new Date().getFullYear();

    this._buildPopover();
    this._bindEvents();
  }

  /* ── Build popover DOM ──────────────────────────────────────────── */
  FLDatePicker.prototype._buildPopover = function () {
    this.popover = document.createElement("div");
    this.popover.className = "fl-picker-popover";
    this.popover.setAttribute("role", "dialog");
    this.popover.setAttribute("aria-modal", "false");
    this.popover.setAttribute(
      "aria-label",
      this.opts.type === "date" ? "Date picker" : "Time picker",
    );

    if (this.opts.type === "date") {
      this._buildCalendar();
    } else {
      this._buildTimeList();
    }

    // Error message element
    this.errorEl = document.createElement("div");
    this.errorEl.className = "fl-picker-error";
    this.errorEl.textContent = this.opts.errorMessage;

    this.wrapper.appendChild(this.popover);
    this.wrapper.appendChild(this.errorEl);

    // Accessibility attributes on input
    this.input.setAttribute("aria-haspopup", "dialog");
    this.input.setAttribute("aria-expanded", "false");
    this.input.setAttribute("readonly", "");
    this.input.setAttribute("tabindex", "0");
  };

  /* ── Calendar builder ───────────────────────────────────────────── */
  FLDatePicker.prototype._buildCalendar = function () {
    var cal = document.createElement("div");
    cal.className = "fl-calendar";
    cal.setAttribute("role", "grid");

    // Header
    var header = document.createElement("div");
    header.className = "fl-calendar-header";

    this.prevBtn = document.createElement("button");
    this.prevBtn.type = "button";
    this.prevBtn.className = "fl-calendar-nav";
    this.prevBtn.setAttribute("aria-label", "Previous month");
    this.prevBtn.innerHTML = "&#8249;";

    this.titleEl = document.createElement("span");
    this.titleEl.className = "fl-calendar-title";

    this.nextBtn = document.createElement("button");
    this.nextBtn.type = "button";
    this.nextBtn.className = "fl-calendar-nav";
    this.nextBtn.setAttribute("aria-label", "Next month");
    this.nextBtn.innerHTML = "&#8250;";

    header.appendChild(this.prevBtn);
    header.appendChild(this.titleEl);
    header.appendChild(this.nextBtn);
    cal.appendChild(header);

    // Weekday labels
    var weekdays = document.createElement("div");
    weekdays.className = "fl-calendar-weekdays";
    weekdays.setAttribute("role", "row");
    for (var i = 0; i < 7; i++) {
      var wd = document.createElement("span");
      wd.className = "fl-calendar-weekday";
      wd.textContent = DAY_LABELS[i];
      wd.setAttribute("role", "columnheader");
      weekdays.appendChild(wd);
    }
    cal.appendChild(weekdays);

    // Days container
    this.daysContainer = document.createElement("div");
    this.daysContainer.className = "fl-calendar-days";
    this.daysContainer.setAttribute("role", "rowgroup");
    cal.appendChild(this.daysContainer);

    this.popover.appendChild(cal);
  };

  /* ── Render calendar days ───────────────────────────────────────── */
  FLDatePicker.prototype._renderDays = function () {
    this.titleEl.textContent =
      MONTH_NAMES[this.viewMonth] + " " + this.viewYear;

    // Clear
    this.daysContainer.innerHTML = "";

    var firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    var daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    var today = new Date();
    var self = this;

    // Empty cells before first day
    for (var e = 0; e < firstDay; e++) {
      var empty = document.createElement("span");
      empty.className = "fl-calendar-day fl-calendar-day--empty";
      empty.setAttribute("aria-hidden", "true");
      this.daysContainer.appendChild(empty);
    }

    // Day buttons
    for (var d = 1; d <= daysInMonth; d++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fl-calendar-day";
      btn.textContent = d;
      btn.setAttribute("role", "gridcell");

      var cellDate = new Date(this.viewYear, this.viewMonth, d);

      // Today
      if (isSameDay(cellDate, today)) {
        btn.classList.add("fl-calendar-day--today");
      }

      // Selected
      if (this.selectedDate && isSameDay(cellDate, this.selectedDate)) {
        btn.classList.add("fl-calendar-day--selected");
        btn.setAttribute("aria-selected", "true");
      }

      // Disabled (minDate / maxDate)
      var disabled = false;
      if (this.opts.minDate && cellDate < this.opts.minDate) {
        disabled = true;
      }
      if (this.opts.maxDate && cellDate > this.opts.maxDate) {
        disabled = true;
      }
      if (disabled) {
        btn.classList.add("fl-calendar-day--disabled");
        btn.setAttribute("aria-disabled", "true");
        btn.tabIndex = -1;
      }

      btn.dataset.day = d;
      this.daysContainer.appendChild(btn);
    }

    // Update prev/next arrow disabled state
    this._updateNavArrows();

    // Attach click delegation
    this.daysContainer.onclick = function (ev) {
      var target = ev.target;
      if (
        target.classList.contains("fl-calendar-day") &&
        !target.classList.contains("fl-calendar-day--empty") &&
        !target.classList.contains("fl-calendar-day--disabled")
      ) {
        var day = parseInt(target.dataset.day, 10);
        self.selectedDate = new Date(self.viewYear, self.viewMonth, day);
        self.input.value = formatDate(self.selectedDate, self.opts.format);
        self._clearError();
        if (self.opts.closeOnSelect && !self.opts.closeOnSelectDelay) {
          self.close();
        } else {
          self._renderDays();
          var sel = self.daysContainer.querySelector(".fl-calendar-day--selected");
          if (sel) sel.focus();
          if (self.opts.closeOnSelectDelay > 0) {
            setTimeout(function () {
              self.close();
            }, self.opts.closeOnSelectDelay);
          }
        }
      }
    };
  };

  /* ── Update prev/next nav arrow disabled state ───────────────────── */
  FLDatePicker.prototype._updateNavArrows = function () {
    if (this.opts.type !== "date") return;

    var shouldDisablePrev = false;
    var shouldDisableNext = false;

    // Disable prev arrow if minDate month/year is reached
    if (this.opts.minDate) {
      var minM = this.opts.minDate.getMonth();
      var minY = this.opts.minDate.getFullYear();
      if (
        this.viewYear < minY ||
        (this.viewYear === minY && this.viewMonth <= minM)
      ) {
        shouldDisablePrev = true;
      }
    }

    // Disable next arrow if maxDate month/year is reached
    if (this.opts.maxDate) {
      var maxM = this.opts.maxDate.getMonth();
      var maxY = this.opts.maxDate.getFullYear();
      if (
        this.viewYear > maxY ||
        (this.viewYear === maxY && this.viewMonth >= maxM)
      ) {
        shouldDisableNext = true;
      }
    }

    // If a button that currently has focus is about to be disabled,
    // move focus to the next button (or a day cell) first so the
    // wrapper doesn't lose focus and trigger focusout → close.
    if (shouldDisablePrev && document.activeElement === this.prevBtn) {
      this.nextBtn.focus();
    }
    if (shouldDisableNext && document.activeElement === this.nextBtn) {
      this.prevBtn.focus();
    }

    // Apply disabled state
    if (shouldDisablePrev) {
      this.prevBtn.setAttribute("disabled", "");
      this.prevBtn.setAttribute("aria-disabled", "true");
    } else {
      this.prevBtn.removeAttribute("disabled");
      this.prevBtn.removeAttribute("aria-disabled");
    }

    if (shouldDisableNext) {
      this.nextBtn.setAttribute("disabled", "");
      this.nextBtn.setAttribute("aria-disabled", "true");
    } else {
      this.nextBtn.removeAttribute("disabled");
      this.nextBtn.removeAttribute("aria-disabled");
    }
  };

  /* ── Time list builder ──────────────────────────────────────────── */
  FLDatePicker.prototype._buildTimeList = function () {
    this.timeListEl = document.createElement("div");
    this.timeListEl.className = "fl-timelist";
    this.timeListEl.setAttribute("role", "listbox");
    this.timeListEl.setAttribute("aria-label", "Select a time");
    this.popover.appendChild(this.timeListEl);
  };

  /* ── Render time options ────────────────────────────────────────── */
  FLDatePicker.prototype._renderTimeList = function () {
    this.timeListEl.innerHTML = "";
    var step = this.opts.timeStep;
    var self = this;

    for (var h = 0; h < 24; h++) {
      for (var m = 0; m < 60; m += step) {
        var label = formatTime(h, m);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fl-timelist-option";
        btn.textContent = label;
        btn.setAttribute("role", "option");
        btn.dataset.value = label;

        var disabled =
          Array.isArray(this.opts.disabledTimes) &&
          this.opts.disabledTimes.indexOf(label) !== -1;

        if (!disabled && this.selectedTimeValue === label) {
          btn.classList.add("fl-timelist-option--selected");
          btn.setAttribute("aria-selected", "true");
        }

        if (disabled) {
          btn.classList.add("fl-timelist-option--disabled");
          btn.setAttribute("aria-disabled", "true");
          btn.disabled = true;
        }

        this.timeListEl.appendChild(btn);
      }
    }

    // Click delegation
    this.timeListEl.onclick = function (ev) {
      var target = ev.target;
      if (
        target.classList.contains("fl-timelist-option") &&
        !target.classList.contains("fl-timelist-option--disabled") &&
        !target.disabled
      ) {
        self.selectedTimeValue = target.dataset.value;
        self.input.value = target.dataset.value;
        self._clearError();
        if (self.opts.closeOnSelect && !self.opts.closeOnSelectDelay) {
          self.close();
        } else {
          self._renderTimeList();
          var sel = self.timeListEl.querySelector(".fl-timelist-option--selected");
          if (sel) {
            sel.scrollIntoView({ block: "nearest" });
            sel.focus();
          }
          if (self.opts.closeOnSelectDelay > 0) {
            setTimeout(function () {
              self.close();
            }, self.opts.closeOnSelectDelay);
          }
        }
      }
    };
  };

  /* ── Bind events ────────────────────────────────────────────────── */
  FLDatePicker.prototype._bindEvents = function () {
    var self = this;

    // Click on input
    this.input.addEventListener("click", function (e) {
      e.stopPropagation();
      if (self.isOpen) {
        self.close();
      } else {
        self.open();
      }
    });

    // Keyboard on input
    this.input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (self.isOpen) {
          self.close();
        } else {
          self.open();
        }
      }
      if (e.key === "Escape" && self.isOpen) {
        self.close();
      }
    });

    // Keyboard inside popover
    this.popover.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        self.close();
        return;
      }
      if (self.opts.type === "date") {
        self._handleCalendarKeyboard(e);
      } else {
        self._handleTimeKeyboard(e);
      }
    });

    // Click outside
    document.addEventListener("click", function (e) {
      if (self.isOpen && !self.wrapper.contains(e.target)) {
        self.close();
      }
    });

    // Tab away detection
    this.wrapper.addEventListener("focusout", function (e) {
      // Use setTimeout so the new activeElement is set
      setTimeout(function () {
        if (self.isOpen && !self.wrapper.contains(document.activeElement)) {
          self.close();
        }
      }, 0);
    });

    // Month navigation (date only)
    if (this.opts.type === "date") {
      this.prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        self.viewMonth--;
        if (self.viewMonth < 0) {
          self.viewMonth = 11;
          self.viewYear--;
        }
        self._renderDays();
      });

      this.nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        self.viewMonth++;
        if (self.viewMonth > 11) {
          self.viewMonth = 0;
          self.viewYear++;
        }
        self._renderDays();
      });
    }

    // Prevent clicks inside popover from bubbling to document
    this.popover.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    this.popover.addEventListener("mousedown", function (e) {
      if (!e.target.closest("button:not(:disabled)")) {
        e.preventDefault();
      }
    });
  };

  /* ── Calendar keyboard navigation ───────────────────────────────── */
  FLDatePicker.prototype._handleCalendarKeyboard = function (e) {
    var focused = this.daysContainer.querySelector("button:focus");
    if (!focused) return;

    var allDays = Array.prototype.slice.call(
      this.daysContainer.querySelectorAll(
        ".fl-calendar-day:not(.fl-calendar-day--empty):not(.fl-calendar-day--disabled)",
      ),
    );
    var idx = allDays.indexOf(focused);
    if (idx === -1) return;

    var newIdx = idx;
    switch (e.key) {
      case "ArrowRight":
        newIdx = Math.min(idx + 1, allDays.length - 1);
        e.preventDefault();
        break;
      case "ArrowLeft":
        newIdx = Math.max(idx - 1, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        newIdx = Math.min(idx + 7, allDays.length - 1);
        e.preventDefault();
        break;
      case "ArrowUp":
        newIdx = Math.max(idx - 7, 0);
        e.preventDefault();
        break;
      case "Enter":
        focused.click();
        e.preventDefault();
        return;
      default:
        return;
    }

    if (newIdx !== idx) {
      allDays[newIdx].focus();
    }
  };

  /* ── Time list keyboard navigation ──────────────────────────────── */
  FLDatePicker.prototype._handleTimeKeyboard = function (e) {
    var focused = this.timeListEl.querySelector("button:focus");
    if (!focused) return;

    var allOpts = Array.prototype.slice.call(
      this.timeListEl.querySelectorAll(
        ".fl-timelist-option:not(.fl-timelist-option--disabled)",
      ),
    );
    var idx = allOpts.indexOf(focused);
    if (idx === -1) return;

    var newIdx = idx;
    switch (e.key) {
      case "ArrowDown":
        newIdx = Math.min(idx + 1, allOpts.length - 1);
        e.preventDefault();
        break;
      case "ArrowUp":
        newIdx = Math.max(idx - 1, 0);
        e.preventDefault();
        break;
      case "Enter":
        focused.click();
        e.preventDefault();
        return;
      default:
        return;
    }

    if (newIdx !== idx) {
      allOpts[newIdx].focus();
      allOpts[newIdx].scrollIntoView({ block: "nearest" });
    }
  };

  /* ── Positioning (flip above if no space below) ─────────────────── */
  FLDatePicker.prototype._positionPopover = function () {
    this.popover.classList.remove("fl-picker-popover--above");
    var rect = this.wrapper.getBoundingClientRect();
    var popHeight = this.popover.offsetHeight || 320;
    var spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < popHeight + 10 && rect.top > popHeight + 10) {
      this.popover.classList.add("fl-picker-popover--above");
    }
  };

  /* ── Open / Close ───────────────────────────────────────────────── */
  FLDatePicker.prototype.open = function () {
    // Close any other open instance
    if (_activeInstance && _activeInstance !== this) {
      _activeInstance.close();
    }

    if (this.opts.type === "date") {
      // Reset view to selected date or today
      if (this.selectedDate) {
        this.viewMonth = this.selectedDate.getMonth();
        this.viewYear = this.selectedDate.getFullYear();
      }
      this._renderDays();
    } else {
      this._renderTimeList();
    }

    this.popover.classList.add("fl-picker-popover--open");
    this.isOpen = true;
    this.input.setAttribute("aria-expanded", "true");
    this.wrapper.classList.add("fl-picker--focused");
    _activeInstance = this;

    // Position after render
    var self = this;
    requestAnimationFrame(function () {
      self._positionPopover();

      // Focus first meaningful element
      if (self.opts.type === "date") {
        var selected = self.daysContainer.querySelector(
          ".fl-calendar-day--selected",
        );
        var todayEl = self.daysContainer.querySelector(
          ".fl-calendar-day--today",
        );
        var firstDay = self.daysContainer.querySelector(
          ".fl-calendar-day:not(.fl-calendar-day--empty):not(.fl-calendar-day--disabled)",
        );
        (selected || todayEl || firstDay) &&
          (selected || todayEl || firstDay).focus();
      } else {
        // Scroll to and focus selected time, or first
        var sel = self.timeListEl.querySelector(
          ".fl-timelist-option--selected",
        );
        var first = self.timeListEl.querySelector(
          ".fl-timelist-option:not(.fl-timelist-option--disabled)",
        );
        if (sel && !sel.disabled) {
          sel.scrollIntoView({ block: "nearest" });
          sel.focus();
        } else if (first) {
          first.focus();
        }
      }
    });
  };

  FLDatePicker.prototype.close = function () {
    this.popover.classList.remove("fl-picker-popover--open");
    this.wrapper.classList.remove("fl-picker--focused");
    this.isOpen = false;
    this.input.setAttribute("aria-expanded", "false");
    this.input.focus();

    if (_activeInstance === this) {
      _activeInstance = null;
    }
  };

  /* ── Validation ─────────────────────────────────────────────────── */
  FLDatePicker.prototype.validate = function () {
    if (!this.input.value) {
      this.wrapper.classList.add("fl-picker--error");
      return false;
    }
    this._clearError();
    return true;
  };

  FLDatePicker.prototype._clearError = function () {
    this.wrapper.classList.remove("fl-picker--error");
  };

  /* ── Get value ──────────────────────────────────────────────────── */
  FLDatePicker.prototype.getValue = function () {
    if (this.opts.type === "date") {
      return this.selectedDate ? new Date(this.selectedDate) : null;
    }
    return this.selectedTimeValue || null;
  };

  /* ── Destroy ────────────────────────────────────────────────────── */
  FLDatePicker.prototype.destroy = function () {
    this.wrapper.classList.remove("fl-picker--focused");
    if (this.popover && this.popover.parentNode) {
      this.popover.parentNode.removeChild(this.popover);
    }
    if (this.errorEl && this.errorEl.parentNode) {
      this.errorEl.parentNode.removeChild(this.errorEl);
    }
    if (_activeInstance === this) {
      _activeInstance = null;
    }
  };

  /* ── Expose globally ────────────────────────────────────────────── */
  window.FLDatePicker = FLDatePicker;
})();
