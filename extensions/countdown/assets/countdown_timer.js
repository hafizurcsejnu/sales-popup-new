console.log("🚀 Countdown Timer Script is running");

// ⚠️ UPDATE THIS URL when you run 'shopify app dev' and get a new tunnel URL
const HOST_API_URL = 'https://qualify-each-compute-establishment.trycloudflare.com/api';
console.log("🌐 Using API URL:", HOST_API_URL);

document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.querySelectorAll(".countdown-timer-wrapper");

  wrappers.forEach(wrapper => {
    const timerId = wrapper.getAttribute("data-timer-id");
    const blockId = wrapper.getAttribute("data-block-id");

    console.log("🎯 Countdown Timer ID:", timerId);

    // Get DOM elements
    const getElem = (suffix) => document.getElementById(`timer-cd-${suffix}-${blockId}`);
    const getLabelElem = (suffix) => document.getElementById(`timer-label-${suffix}-${blockId}`);
    const daysElem = getElem('days');
    const hoursElem = getElem('hours');
    const minutesElem = getElem('minutes');
    const secondsElem = getElem('seconds');
    
    const titleElem = document.getElementById(`timer-title-${blockId}`);
    const subheadingElem = document.getElementById(`timer-subheading-${blockId}`);
    const endMessageElem = document.getElementById(`timer-end-message-${blockId}`);
    const containerElem = document.getElementById(`timer-container-${blockId}`);
    const timerNumbersElem = document.getElementById(`countdown-timer-numbers-${blockId}`);
    const timerLabelsElem = document.getElementById(`countdown-timer-labels-${blockId}`);
    const loadingElem = document.getElementById(`countdown-timer-loading-${blockId}`);

    // Check if TimerID is provided
    if (!timerId) {
      console.warn("❌ No TimerID provided in section settings");
      // Keep showing "Please configure TimerID" message
      return;
    }

    // Show loading message
    if (loadingElem) {
      loadingElem.innerHTML = '<div class="timer-loading-text">Loading timer...</div>';
    }

    // Fetch timer configuration from countdown_timers table
    const apiUrl = `${HOST_API_URL}/countdown-timers/config/${timerId}`;
    console.log("🌐 API URL:", apiUrl);
    console.log("🆔 Timer ID being requested:", timerId);
    
    console.log("🚀 Starting fetch request...");
    
    fetch(apiUrl)
      .then(res => {
        console.log("✅ Fetch successful! Response received");
        console.log("📡 Response status:", res.status);
        console.log("📡 Response ok:", res.ok);
        console.log("📡 Response type:", res.type);
        console.log("📡 Response URL:", res.url);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return res.json();
      })
      .then(configData => {
        console.log("✅ JSON parsed successfully");
        console.log("📦 Full Config Data from backend:", configData);

        if (!configData || !configData.title) {
          console.warn("⚠️ Incomplete config data");
          // Show error message
          if (loadingElem) {
            loadingElem.innerHTML = '<div class="no-timer-loading-text">Timer not found. Please check your TimerID.</div>';
          }
          return;
        }

        const config = configData;
        
        // Check if timer should display on current page type
        const currentPageType = detectPageType();
        const displayPages = config.placement_config?.display_pages || 'product-only';
        
        console.log("📄 Current Page Type:", currentPageType);
        console.log("⚙️ Display Pages Setting:", displayPages);
        
        if (!shouldDisplayOnPage(currentPageType, displayPages)) {
          console.log("🚫 Timer hidden - not configured for this page type");
          // Hide the entire wrapper
          if (wrapper) {
            wrapper.style.display = 'none';
          }
          return;
        }
        
        console.log("✅ Timer should display on this page");
        
        // Hide loading, show timer
        if (loadingElem) {
          loadingElem.style.display = 'none';
        }
        if (containerElem) {
          containerElem.style.display = 'flex';
        }
        
        // Apply design configuration
        applyDesignConfig(config.design_config, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem);
        
        // Set title and subheading
        if (titleElem && config.title) {
          titleElem.textContent = config.title;
        }
        
        if (subheadingElem && config.sub_heading) {
          subheadingElem.textContent = config.sub_heading;
        }

        // Set timer labels
        if (config.timer_labels) {
          if (getLabelElem('days') && config.timer_labels.days) {
            getLabelElem('days').textContent = config.timer_labels.days;
          }
          if (getLabelElem('hours') && config.timer_labels.hours) {
            getLabelElem('hours').textContent = config.timer_labels.hours;
          }
          if (getLabelElem('minutes') && config.timer_labels.minutes) {
            getLabelElem('minutes').textContent = config.timer_labels.minutes;
          }
          if (getLabelElem('seconds') && config.timer_labels.seconds) {
            getLabelElem('seconds').textContent = config.timer_labels.seconds;
          }
        }

        // Calculate end time based on timer type
        let endTime = calculateEndTime(config);
        
        if (!endTime || isNaN(endTime)) {
          // Handle special cases where timer shouldn't be active
          handleInactiveTimer(config, titleElem, subheadingElem, containerElem, endMessageElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem, wrapper);
          return;
        }

        // Start the countdown
        startCountdown(endTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem);

      })
      .catch(err => {
        console.error("❌ FETCH ERROR CAUGHT!");
        console.error("❌ Error type:", err.constructor.name);
        console.error("❌ Error message:", err.message);
        console.error("❌ Error details:", err);
        
        // Check for specific error types
        if (err instanceof TypeError) {
          console.error("🚫 Network Error - This is usually a CORS issue or the server is unreachable");
          console.error("🔍 Check if:", {
            "API is running": "Is your Laravel server running?",
            "CORS configured": "Is CORS configured in Laravel?",
            "URL correct": apiUrl,
            "Network available": "Check browser network tab"
          });
        }
        
        console.error("❌ Full error stack:", err.stack);
        
        // Show error message
        if (loadingElem) {
          loadingElem.innerHTML = `<div class="no-timer-loading-text">Error loading timer: ${err.message}<br>Check console for details.</div>`;
        }
      });
  });
});

function calculateEndTime(config) {
  const now = new Date();
  
  if (config.timer_type === 'fixed') {
    // Fixed minutes timer - Use localStorage to persist countdown across page refreshes
    const fixedMinutes = parseInt(config.timer_config?.fixed_minutes) || 60;
    const storageKey = `timer-cd-endtime-${config.id}`;
    const savedEndTime = localStorage.getItem(storageKey);

    let endTime;
    
    if (savedEndTime) {
      const parsedEnd = new Date(savedEndTime);
      if (parsedEnd > now) {
        endTime = parsedEnd; // Continue existing countdown
      } else {
        // Expired - create new countdown
        endTime = new Date(now.getTime() + (fixedMinutes * 60 + 0.5) * 1000);
        localStorage.setItem(storageKey, endTime.toISOString());
      }
    } else {
      // First visit - create new countdown
      endTime = new Date(now.getTime() + (fixedMinutes * 60 + 0.5) * 1000);
      localStorage.setItem(storageKey, endTime.toISOString());
    }
    
    return endTime;
    
  } else if (config.timer_type === 'generic') {
    // For generic timer, check if it should start now or later
    if (config.timer_config?.timer_start === 'now') {
      return new Date(`${config.timer_config.end_date}T${config.timer_config.end_time}:00`);
    } else {
      // Check if start time has passed
      const startDateTime = new Date(`${config.timer_config.start_date}T${config.timer_config.start_time}:00`);
      const endDateTime = new Date(`${config.timer_config.end_date}T${config.timer_config.end_time}:00`);
      
      if (now >= startDateTime) {
        // Timer has started, use end time
        return endDateTime;
      } else {
        // Timer hasn't started yet, don't set target time
        return null;
      }
    }
    
  } else if (config.timer_type === 'daily') {
    // For daily recurring timer, calculate the next occurrence
    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert to UI day index: 0 = Monday, 1 = Tuesday, etc.
    const uiDayIndex = today === 0 ? 6 : today - 1; // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseInt(config.timer_config.start_time.split(':')[0]) * 60 + parseInt(config.timer_config.start_time.split(':')[1]);
    const endTime = parseInt(config.timer_config.end_time.split(':')[0]) * 60 + parseInt(config.timer_config.end_time.split(':')[1]);
    
    // Check if current date is within the date range
    const currentDate = now.toISOString().split('T')[0];
    const isWithinDateRange = currentDate >= config.timer_config.start_date && currentDate <= config.timer_config.end_date;
    
    // Check if today is a selected day and we're within the date range
    if (config.timer_config.selected_days?.includes(uiDayIndex) && isWithinDateRange) {
      if (currentTime >= startTime && currentTime < endTime) {
        // Timer is active today, set end time for today
        const todayDate = now.toISOString().split('T')[0];
        return new Date(`${todayDate}T${config.timer_config.end_time}:00`);
      } else {
        // Timer hasn't started yet or has ended today, don't set target time
        return null;
      }
    } else {
      // Today is not a selected day or outside date range, don't set target time
      return null;
    }
  } else {
    return new Date(`${config.timer_config.end_date}T${config.timer_config.end_time}:00`);
  }
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function handleInactiveTimer(config, titleElem, subheadingElem, containerElem, endMessageElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem, wrapper) {
  // Handle Generic timer with Schedule to start later
  if (config.timer_type === 'generic' && config.timer_config?.timer_start === 'schedule') {
    // Hide the entire container - no message shown
    // Timer will appear when start time arrives
    if (containerElem) {
      containerElem.style.display = 'none';
    }
    
    // Set up polling to check when the timer should start
    const startDateTime = new Date(`${config.timer_config.start_date}T${config.timer_config.start_time}:00`);
    const endDateTime = new Date(`${config.timer_config.end_date}T${config.timer_config.end_time}:00`);
    
    // Check every 10 seconds if the scheduled start time has arrived
    const pollInterval = setInterval(() => {
      const now = new Date();
      
      if (now >= startDateTime && now < endDateTime) {
        // Timer should now be active!
        console.log("✅ Scheduled timer is now active!");
        clearInterval(pollInterval);
        
        // Show the container
        if (containerElem) {
          containerElem.style.display = 'flex';
        }
        
        // Re-apply design config
        applyDesignConfig(config.design_config, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem);
        
        // Set title and subheading
        if (titleElem && config.title) {
          titleElem.textContent = config.title;
        }
        
        if (subheadingElem && config.sub_heading) {
          subheadingElem.textContent = config.sub_heading;
        }
        
        // Start the countdown
        startCountdown(endDateTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem);
      } else if (now >= endDateTime) {
        // Timer has already ended, stop polling
        console.log("⏰ Scheduled timer has already ended");
        clearInterval(pollInterval);
      }
    }, 10000); // Check every 10 seconds
    
    // Also do an immediate check after 1 second (in case we're very close to start time)
    setTimeout(() => {
      const now = new Date();
      if (now >= startDateTime && now < endDateTime) {
        console.log("✅ Scheduled timer is now active (immediate check)!");
        clearInterval(pollInterval);
        
        if (containerElem) {
          containerElem.style.display = 'flex';
        }
        
        applyDesignConfig(config.design_config, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem);
        
        if (titleElem && config.title) {
          titleElem.textContent = config.title;
        }
        
        if (subheadingElem && config.sub_heading) {
          subheadingElem.textContent = config.sub_heading;
        }
        
        startCountdown(endDateTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem);
      }
    }, 1000);
    
  } else if (config.timer_type === 'daily') {
    // Handle Daily recurring timer - hide completely like scheduled generic timer
    // Hide the entire container - no message shown
    // Timer will appear when it becomes active (on selected days during active hours)
    if (containerElem) {
      containerElem.style.display = 'none';
    }
    
    // Set up polling to check every 30 seconds if the timer should become active
    const pollInterval = setInterval(() => {
      const newEndTime = calculateEndTime(config);
      
      if (newEndTime && !isNaN(newEndTime)) {
        // Timer is now active!
        console.log("✅ Daily recurring timer is now active!");
        clearInterval(pollInterval);
        
        // Show the container
        if (containerElem) {
          containerElem.style.display = 'flex';
        }
        
        // Re-apply design config
        applyDesignConfig(config.design_config, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem);
        
        // Set title and subheading
        if (titleElem && config.title) {
          titleElem.textContent = config.title;
        }
        
        if (subheadingElem && config.sub_heading) {
          subheadingElem.textContent = config.sub_heading;
        }
        
        // Set timer labels
        if (config.timer_labels) {
          if (getLabelElem('days') && config.timer_labels.days) {
            getLabelElem('days').textContent = config.timer_labels.days;
          }
          if (getLabelElem('hours') && config.timer_labels.hours) {
            getLabelElem('hours').textContent = config.timer_labels.hours;
          }
          if (getLabelElem('minutes') && config.timer_labels.minutes) {
            getLabelElem('minutes').textContent = config.timer_labels.minutes;
          }
          if (getLabelElem('seconds') && config.timer_labels.seconds) {
            getLabelElem('seconds').textContent = config.timer_labels.seconds;
          }
        }
        
        // Start the countdown
        startCountdown(newEndTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem);
      }
    }, 30000); // Check every 30 seconds
    
    // Also do an immediate check after 1 second (in case we're very close to start time)
    setTimeout(() => {
      const newEndTime = calculateEndTime(config);
      
      if (newEndTime && !isNaN(newEndTime)) {
        console.log("✅ Daily recurring timer is now active (immediate check)!");
        clearInterval(pollInterval);
        
        if (containerElem) {
          containerElem.style.display = 'flex';
        }
        
        applyDesignConfig(config.design_config, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem);
        
        if (titleElem && config.title) {
          titleElem.textContent = config.title;
        }
        
        if (subheadingElem && config.sub_heading) {
          subheadingElem.textContent = config.sub_heading;
        }
        
        if (config.timer_labels) {
          if (getLabelElem('days') && config.timer_labels.days) {
            getLabelElem('days').textContent = config.timer_labels.days;
          }
          if (getLabelElem('hours') && config.timer_labels.hours) {
            getLabelElem('hours').textContent = config.timer_labels.hours;
          }
          if (getLabelElem('minutes') && config.timer_labels.minutes) {
            getLabelElem('minutes').textContent = config.timer_labels.minutes;
          }
          if (getLabelElem('seconds') && config.timer_labels.seconds) {
            getLabelElem('seconds').textContent = config.timer_labels.seconds;
          }
        }
        
        startCountdown(newEndTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem);
      }
    }, 1000);
    
  } else {
    // For all other timer types: Show appropriate message
    const message = 'Timer Not Available';

    if (titleElem) {
      titleElem.textContent = message;
      titleElem.style.color = '#333333';
      titleElem.style.fontSize = '28px';
      titleElem.style.fontWeight = 'bold';
      titleElem.style.textAlign = 'center';
      titleElem.style.margin = '0';
    }

    if (subheadingElem) {
      subheadingElem.style.display = 'none';
    }
    
    const timerNumbers = containerElem?.querySelector('.countdown-timer-numbers');
    const timerLabels = containerElem?.querySelector('.countdown-timer-labels');
    
    if (timerNumbers) timerNumbers.style.display = 'none';
    if (timerLabels) timerLabels.style.display = 'none';
  }
}

function applyDesignConfig(designConfig, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem) {
  if (!designConfig) return;

  // Apply card styling - matches the Box style from React component
  if (containerElem) {
    // Border styling
    if (designConfig.cardBorderSize !== undefined) {
      containerElem.style.borderWidth = `${designConfig.cardBorderSize}px`;
    }
    
    if (designConfig.cardBorderColor) {
      containerElem.style.borderColor = designConfig.cardBorderColor;
    }
    
    if (designConfig.cardBorderRadius !== undefined) {
      containerElem.style.borderRadius = `${designConfig.cardBorderRadius}px`;
    }
    
    // Background color
    if (designConfig.hexColor) {
      containerElem.style.backgroundColor = designConfig.hexColor || "#ffffff";
    }
    
    // Padding - matches React component padding
    containerElem.style.paddingLeft = "24px";
    containerElem.style.paddingRight = "24px";
    
    if (designConfig.insideTop !== undefined) {
      containerElem.style.paddingTop = `${designConfig.insideTop}px`;
    }
    
    if (designConfig.insideBottom !== undefined) {
      containerElem.style.paddingBottom = `${designConfig.insideBottom}px`;
    }
    
    // Margin - matches React component margin
    if (designConfig.outsideTop !== undefined) {
      wrapper.style.marginTop = `${designConfig.outsideTop}px`;
    }
    
    if (designConfig.outsideBottom !== undefined) {
      wrapper.style.marginBottom = `${designConfig.outsideBottom}px`;
    }
  }

  // Apply title styling
  if (titleElem) {
    if (designConfig.titleSize !== undefined) {
      titleElem.style.fontSize = `${designConfig.titleSize}px`;
    }
    if (designConfig.titleHexColor) {
      titleElem.style.color = designConfig.titleHexColor;
    }
  }

  // Apply subheading styling
  if (subheadingElem) {
    if (designConfig.subheadingSize !== undefined) {
      subheadingElem.style.fontSize = `${designConfig.subheadingSize}px`;
    }
    if (designConfig.subheadingHexColor) {
      subheadingElem.style.color = designConfig.subheadingHexColor;
    }
  }

  // Apply timer styling
  [daysElem, hoursElem, minutesElem, secondsElem].forEach(elem => {
    if (elem) {
      if (designConfig.timerSize !== undefined) {
        elem.style.fontSize = `${designConfig.timerSize}px`;
      }
      if (designConfig.timerHexColor) {
        elem.style.color = designConfig.timerHexColor;
      }
    }
  });

  // Apply timer styling to colons as well
  const colonElems = containerElem?.querySelectorAll('.timer-colon');
  if (colonElems) {
    colonElems.forEach(colon => {
      if (designConfig.timerSize !== undefined) {
        colon.style.fontSize = `${designConfig.timerSize}px`;
      }
      if (designConfig.timerHexColor) {
        colon.style.color = designConfig.timerHexColor;
      }
    });
  }

  // Apply label styling
  ['days', 'hours', 'minutes', 'seconds'].forEach(label => {
    const labelElem = getLabelElem(label);
    if (labelElem) {
      if (designConfig.legendSize !== undefined) {
        labelElem.style.fontSize = `${designConfig.legendSize}px`;
      }
      if (designConfig.legendHexColor) {
        labelElem.style.color = designConfig.legendHexColor;
      }
    }
  });
}

function startCountdown(endTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, timerBoxElem) {
  function updateTimer() {
    const now = new Date();
    const diff = endTime - now;

    if (diff <= 0) {
      // Check if repeat is enabled for fixed timers
      if (config.timer_config?.once_it_ends === 'repeat' && config.timer_type === 'fixed') {
        // Restart the timer for repeat functionality
        const now = new Date();
        const fixedMinutes = parseInt(config.timer_config?.fixed_minutes) || 60;
        const futureTime = new Date(now.getTime() + (fixedMinutes * 60 + 0.5) * 1000);
        endTime = futureTime;
        
        // Save the new endTime to localStorage for persistence
        const storageKey = `timer-cd-endtime-${config.id}`;
        localStorage.setItem(storageKey, endTime.toISOString());
        return;
      } else {
        // Timer ended
        handleTimerEnd(config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, timerBoxElem);
        return;
      }
    }

    // Add small delay to compensate for time elapsed during calculation
    const compensatedDiff = diff + 50; // Add 50ms compensation
    
    const days = String(Math.floor(compensatedDiff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    const hours = String(Math.floor((compensatedDiff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutes = String(Math.floor((compensatedDiff / (1000 * 60)) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((compensatedDiff / 1000) % 60)).padStart(2, '0');

    daysElem.textContent = days;
    hoursElem.textContent = hours;
    minutesElem.textContent = minutes;
    secondsElem.textContent = seconds;
  }

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  // Store interval for cleanup
  daysElem.dataset.timerInterval = timerInterval;
}

function handleTimerEnd(config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem) {
  // Clear the interval
  const intervalId = daysElem.dataset.timerInterval;
  if (intervalId) {
    clearInterval(parseInt(intervalId));
  }

  // Clear localStorage for fixed timers (so a fresh timer starts on next visit)
  if (config.timer_type === 'fixed') {
    const storageKey = `timer-cd-endtime-${config.id}`;
    localStorage.removeItem(storageKey);
  }

  const onceItEnds = config.timer_config?.once_it_ends;

  if (onceItEnds === 'hide') {
    // Hide the entire container - matches React component logic
    if (containerElem) {
      containerElem.style.display = 'none';
    }
    
    // For daily recurring timers, set up polling to check when timer should reappear
    if (config.timer_type === 'daily') {
      console.log("⏰ Daily timer ended and hidden. Setting up polling for next occurrence...");
      
      // Set up polling to check every 30 seconds if the timer should become active again
      const pollInterval = setInterval(() => {
        const newEndTime = calculateEndTime(config);
        
        if (newEndTime && !isNaN(newEndTime)) {
          // Timer is now active again!
          console.log("✅ Daily recurring timer is active again!");
          clearInterval(pollInterval);
          
          // Show the container
          if (containerElem) {
            containerElem.style.display = 'flex';
          }
          
          // Get the wrapper element (parent of container)
          const wrapper = containerElem.closest('.countdown-timer-wrapper');
          
          // Re-apply design config
          const titleElem = containerElem?.querySelector('.countdown-timer-title');
          const subheadingElem = containerElem?.querySelector('.countdown-timer-subheading');
          const getLabelElem = (suffix) => {
            const blockId = wrapper?.getAttribute('data-block-id');
            return document.getElementById(`timer-label-${suffix}-${blockId}`);
          };
          
          applyDesignConfig(config.design_config, wrapper, titleElem, subheadingElem, containerElem, daysElem, hoursElem, minutesElem, secondsElem, getLabelElem);
          
          // Set title and subheading
          if (titleElem && config.title) {
            titleElem.textContent = config.title;
          }
          
          if (subheadingElem && config.sub_heading) {
            subheadingElem.textContent = config.sub_heading;
            subheadingElem.style.display = 'block';
          }
          
          // Set timer labels
          if (config.timer_labels) {
            if (getLabelElem('days') && config.timer_labels.days) {
              getLabelElem('days').textContent = config.timer_labels.days;
            }
            if (getLabelElem('hours') && config.timer_labels.hours) {
              getLabelElem('hours').textContent = config.timer_labels.hours;
            }
            if (getLabelElem('minutes') && config.timer_labels.minutes) {
              getLabelElem('minutes').textContent = config.timer_labels.minutes;
            }
            if (getLabelElem('seconds') && config.timer_labels.seconds) {
              getLabelElem('seconds').textContent = config.timer_labels.seconds;
            }
          }
          
          // Start the countdown
          startCountdown(newEndTime, config, daysElem, hoursElem, minutesElem, secondsElem, endMessageElem, containerElem);
        }
      }, 30000); // Check every 30 seconds
    }
    
  } else if (onceItEnds === 'custom' && config.timer_config?.custom_end_title) {
    // Show custom end title - matches React component logic
    // Hide title and subheading, but keep timer numbers and labels visible
    const titleElem = containerElem?.querySelector('.countdown-timer-title');
    const subheadingElem = containerElem?.querySelector('.countdown-timer-subheading');
    
    if (titleElem) {
      titleElem.textContent = config.timer_config.custom_end_title || 'Sales Ends';
      titleElem.style.color = '#333333';
      titleElem.style.fontSize = '28px';
      titleElem.style.fontWeight = 'bold';
      titleElem.style.textAlign = 'center';
    }
    
    if (subheadingElem) {
      subheadingElem.style.display = 'none';
    }
    
    // Timer numbers and labels remain visible showing 00:00:00:00
  } else {
    // Default: show zeros - matches React component logic
    daysElem.textContent = "00";
    hoursElem.textContent = "00";
    minutesElem.textContent = "00";
    secondsElem.textContent = "00";
  }
}

/**
 * Detect current page type in Shopify store
 */
function detectPageType() {
  // Check Shopify's theme template variable (most reliable)
  if (typeof window.Shopify !== 'undefined' && window.Shopify.theme) {
    const template = window.Shopify.theme.template || '';
    
    if (template.includes('product')) return 'product';
    if (template.includes('collection')) return 'collection';
    if (template.includes('cart')) return 'cart';
    if (template.includes('index')) return 'home';
  }
  
  // Fallback: Check URL patterns
  const path = window.location.pathname;
  
  if (path.includes('/products/')) return 'product';
  if (path.includes('/collections/')) return 'collection';
  if (path.includes('/cart')) return 'cart';
  if (path === '/' || path === '') return 'home';
  
  // Fallback: Check for product form (common on product pages)
  if (document.querySelector('form[action*="/cart/add"]') || 
      document.querySelector('[data-product-form]') ||
      document.querySelector('.product-form')) {
    return 'product';
  }
  
  // Fallback: Check for collection grid
  if (document.querySelector('.collection') || 
      document.querySelector('[data-collection]') ||
      document.querySelector('.product-grid')) {
    return 'collection';
  }
  
  // Default to 'other' for pages that don't match
  return 'other';
}

/**
 * Check if timer should display on current page based on settings
 */
function shouldDisplayOnPage(currentPageType, displayPagesSetting) {
  console.log(`🔍 Checking if should display: currentPage="${currentPageType}", setting="${displayPagesSetting}"`);
  
  switch (displayPagesSetting) {
    case 'product-only':
      return currentPageType === 'product';
    
    case 'collection':
      return currentPageType === 'collection';
    
    case 'all':
      return true; // Show on all pages
    
    default:
      // Default to product-only if setting is invalid
      return currentPageType === 'product';
  }
}
