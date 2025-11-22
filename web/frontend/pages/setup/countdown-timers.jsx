
import { Page, Button, ButtonGroup, Box, RadioButton, Card, Text, Layout, BlockStack, Divider, TextField, InlineStack, RangeSlider, Frame, ContextualSaveBar, Banner, Tabs, Select, Checkbox, ColorPicker } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import tshirtImage from './t-shirt.png';
import { useAuthenticatedFetch } from "../../hooks";
import { useAppBridge } from '@shopify/app-bridge-react';
import { useToast } from '@shopify/app-bridge-react';
import ColorPickerInput from '../../components/ColorPickerInput';

export default function Countdown() {
    //const savebar = useContextualSaveBar();
    const toast = useToast();
    const app = useAppBridge();
    const navigate = useNavigate();
    const fetchWithAuth = useAuthenticatedFetch();

    // Saved data
    const [savedData, setSavedData] = useState({
        timerName: '',
        title: 'Hurry Up!',
        subHeading: 'Sale ends in:',
        timerLabels: {
            days: 'Days',
            hours: 'Hrs',
            minutes: 'Mins',
            seconds: 'Secs'
        },
        timerType: 'fixed',
        timerStart: 'now',
        fixedMinutes: 60,
        selectedDays: [1, 2, 3, 4, 5], // Monday to Friday by default
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '17:00',
        onceItEnds: 'hide',
        customEndTitle: 'Sales Ends',
        backgroundColor: { hue: 0, saturation: 0, brightness: 0.9 },
        hexColor: '#ffffff',
        borderColor: { hue: 0, saturation: 0, brightness: 0.8 },
        cardBorderRadius: 12,
        cardBorderSize: 2,
        cardBorderColor: '#333333',
        borderHexColor: '#cccccc',
        insideTop: 10,
        insideBottom: 10,
        outsideTop: 0,
        outsideBottom: 0,
        titleSize: 28,
        titleColor: { hue: 0, saturation: 0, brightness: 0.13 },
        titleHexColor: '#202223',
        subheadingSize: 16,
        subheadingColor: { hue: 0, saturation: 0, brightness: 0.13 },
        subheadingHexColor: '#202223',
        timerSize: 40,
        timerColor: { hue: 0, saturation: 0, brightness: 0.13 },
        timerHexColor: '#202223',
        legendSize: 14,
        legendColor: { hue: 0, saturation: 0, brightness: 0.13 },
        legendHexColor: '#202223',
        borderRadius: 6,
        borderWidth: 1,
        displayPosition: 'before-title',
        displayPages: 'product-only',
        isPublished: false,
    });
    const [quantity, setQuantity] = useState(1);

    // Form data
    const [formData, setFormData] = useState(savedData);

    // Helper function to render timer component
    const renderTimer = () => {
        // Hide timer completely when countdown ended and onceItEnds is 'hide'
        if (isCountdownEnded && formData.onceItEnds === 'hide') return null;
        
        return (
            <Box style={{
                border: `${formData.cardBorderSize}px solid ${formData.cardBorderColor}`,
                borderRadius: `${formData.cardBorderRadius}px`,
                paddingTop: `${formData.insideTop}px`,
                paddingBottom: `${formData.insideBottom}px`,
                paddingLeft: "24px",
                paddingRight: "24px",
                backgroundColor: formData.hexColor || "#ffffff",
                marginTop: `${formData.outsideTop}px`,
                marginBottom: `${formData.outsideBottom}px`
            }}>
                <BlockStack gap="400" alignment="center">
                    {/* Line 1: Title */}
                    {isCountdownEnded && formData.onceItEnds === 'custom' ? (
                        <Text variant="headingLg" as="h2" alignment="center" fontWeight="bold" style={{ color: "#333333" }}>
                            {formData.customEndTitle || 'Sales Ends'}
                        </Text>
                    ) : (
                        <>
                    {formData.title && (
                        <h2 style={{ 
                            color: formData.titleHexColor || "#202223", 
                            fontSize: `${formData.titleSize || 28}px`, 
                            fontWeight: "bold", 
                            textAlign: "center",
                            margin: 0 
                        }}>
                            {formData.title}
                        </h2>
                    )}
                    
                    {/* Line 2: SubHeading */}
                    {formData.subHeading && (
                        <p style={{ 
                            color: formData.subheadingHexColor || "#202223", 
                            fontSize: `${formData.subheadingSize || 16}px`, 
                            textAlign: "center",
                            marginTop: "-8px",
                            marginBottom: 0 
                        }}>
                            {formData.subHeading}
                        </p>
                            )}
                        </>
                    )}
                    
                    {/* Line 3: Timer Numbers */}
                    <Box style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: 'wrap',
                    }} role="timer" aria-live="polite" aria-label={`Countdown timer showing ${remainingTime.days} days, ${remainingTime.hours} hours, ${remainingTime.minutes} minutes, and ${remainingTime.seconds} seconds remaining`}>
                        {["days", "hours", "minutes", "seconds"].map((timeUnit, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "baseline" }}>
                                <span 
                                    style={{ fontSize: `${formData.timerSize || 40}px`, fontWeight: "bold", color: formData.timerHexColor || "#202223" }}
                                    aria-label={`${remainingTime[timeUnit]} ${formData.timerLabels[timeUnit] || ["Days", "Hrs", "Mins", "Secs"][index]}`}
                                >
                                    {remainingTime[timeUnit]}
                                </span>
                                {index < 3 && <span style={{ fontSize: `${formData.timerSize || 40}px`, fontWeight: "bold", color: formData.timerHexColor || "#202223", marginLeft: "4px" }} aria-hidden="true">:</span>}
                            </div>
                        ))}
                    </Box>
                    
                    {/* Line 4: Timer Labels */}
                    <Box style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: 'wrap',
                        marginTop: "8px"
                    }}>
                        {["days", "hours", "minutes", "seconds"].map((timeUnit, index) => (
                            <div key={index} style={{ textAlign: "center", minWidth: "60px" }}>
                                <span style={{ 
                                    color: formData.legendHexColor || "#202223", 
                                    fontSize: `${formData.legendSize || 14}px`, 
                                    fontWeight: "500" 
                                }}>
                                    {formData.timerLabels[timeUnit] || ["Days", "Hrs", "Mins", "Secs"][index]}
                                </span>
                            </div>
                        ))}
                    </Box>
                </BlockStack>
            </Box>
        );
    };
    const [isDirty, setIsDirty] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        timerName: '',
        title: '',
        subHeading: '',
        fixedMinutes: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });

    // Countdown state
    const [remainingTime, setRemainingTime] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00"
    });

    // Countdown end state
    const [isCountdownEnded, setIsCountdownEnded] = useState(false);

    // Target time state
    const [targetTime, setTargetTime] = useState(null);

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const handleToggle = () => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));

    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const handleButtonClick = useCallback((index) => {
        if (activeButtonIndex === index) return;
        setActiveButtonIndex(index);
    }, [activeButtonIndex]);

    // Tab navigation state
    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => {
        setActiveTab(selectedTabIndex);
    }, []);

    const handleFixedMinutesChange = value => {
        const intValue = parseInt(value, 10);
        const validValue = isNaN(intValue) ? 1 : Math.max(1, intValue);
        setFormData(prev => ({ ...prev, fixedMinutes: validValue }));
        setErrors(prev => ({ ...prev, fixedMinutes: '' }));
    };

    // Detect unsaved changes
    useEffect(() => {
        setIsDirty(JSON.stringify(formData) !== JSON.stringify(savedData));
    }, [formData, savedData]);

    // Handle background color change
    const handleBackgroundColorChange = (color, hexColor) => {
        setFormData(prev => ({ 
            ...prev, 
            backgroundColor: color,
            hexColor: hexColor
        }));
    };

    // Handle border color change
    const handleBorderColorChange = (color, hexColor) => {
        setFormData(prev => ({ 
            ...prev, 
            borderColor: color,
            borderHexColor: hexColor
        }));
    };

    // Convert date to local ISO with offset - improved timezone handling
    function toLocalISOStringWithOffset(date) {
        try {
            const pad = (num) => String(num).padStart(2, '0');
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());
            const offsetMinutes = date.getTimezoneOffset();
            const absOffset = Math.abs(offsetMinutes);
            const offsetHours = pad(Math.floor(absOffset / 60));
            const offsetMins = pad(absOffset % 60);
            const offsetSign = offsetMinutes <= 0 ? '+' : '-';
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
        } catch (error) {
            console.error('Error converting date to ISO string:', error);
            return date.toISOString();
        }
    }

    // Helper function to create timezone-aware date
    function createTimezoneAwareDate(dateStr, timeStr) {
        try {
            // Create date in user's local timezone
            const localDate = new Date(`${dateStr}T${timeStr}:00`);
            
            // Validate the date
            if (isNaN(localDate.getTime())) {
                throw new Error('Invalid date format');
            }
            
            return localDate;
        } catch (error) {
            console.error('Error creating timezone-aware date:', error);
            return new Date();
        }
    }

    // Validation helpers
    const isFutureDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return false;
        const target = new Date(`${dateStr}T${timeStr}:00`);
        return target.getTime() > Date.now();
    };

    const validateForm = () => {
        const nextErrors = { timerName: '', title:'', subHeading: '', fixedMinutes: '', endDate: '', endTime: '' };
        let valid = true;

        // Timer Name required
        if (!formData.timerName || !formData.timerName.trim()) {
            nextErrors.timerName = "Timer name can't be blank";
            valid = false;
        }

        // Title required
        if (!formData.title || !formData.title.trim()) {
            nextErrors.title = "Title can't be blank";
            valid = false;
        }

        // SubHeading required
        if (!formData.subHeading || !formData.subHeading.trim()) {
            nextErrors.subHeading = "SubHeading can't be blank";
            valid = false;
        }

        // Timer-specific
        if (formData.timerType === 'fixed') {
            const m = Number(formData.fixedMinutes);
            if (!Number.isInteger(m)) {
                nextErrors.fixedMinutes = 'Minutes must be an integer.';
                valid = false;
            } else if (m < 1) {
                nextErrors.fixedMinutes = 'Minutes must be greater than or equal to 1';
                valid = false;
            }
        } else {
            // Generic timer validation
            if (formData.timerType === 'generic') {
                if (formData.timerStart === 'schedule') {
                    if (!formData.startDate) {
                        nextErrors.startDate = "Start date can't be blank";
                        valid = false;
                    }
                    if (!formData.startTime) {
                        nextErrors.startTime = 'Start time is required.';
                        valid = false;
                    }
                }
            if (!formData.endDate) {
                nextErrors.endDate = "End date can't be blank";
                valid = false;
            }
            if (!formData.endTime) {
                nextErrors.endTime = 'End time is required.';
                valid = false;
            }
            if (formData.endDate && formData.endTime && !isFutureDateTime(formData.endDate, formData.endTime)) {
                nextErrors.endTime = 'End date/time must be in the future.';
                valid = false;
                }
            } else {
                // Daily timer validation
                if (!formData.endDate) {
                    nextErrors.endDate = "End date can't be blank";
                    valid = false;
                }
                if (!formData.endTime) {
                    nextErrors.endTime = 'End time is required.';
                    valid = false;
                }
                if (formData.endDate && formData.endTime && !isFutureDateTime(formData.endDate, formData.endTime)) {
                    nextErrors.endTime = 'End date/time must be in the future.';
                    valid = false;
                }
            }
        }

        setErrors(nextErrors);
        
        // Build banner errors list from field errors
        const bannerErrorList = [
            ...(nextErrors.timerName ? [nextErrors.timerName] : []),
            ...(nextErrors.title ? [nextErrors.title] : []),
            ...(nextErrors.subHeading ? [nextErrors.subHeading] : []),
            ...(nextErrors.fixedMinutes ? [nextErrors.fixedMinutes] : []),
            ...(nextErrors.endDate ? [nextErrors.endDate] : []),
            ...(nextErrors.endTime ? [nextErrors.endTime] : []),
        ];
        setBannerErrors(bannerErrorList);
        
        return valid;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.show('Please fix the form errors.', { duration: 4000, isError: true });
            return;
        }

        const combined = new Date(`${formData.endDate}T${formData.endTime}:00`);
        const isoWithOffset = toLocalISOStringWithOffset(combined);

        // Prepare timer configuration based on type
        let timerConfig = {};
        if (formData.timerType === 'fixed') {
            timerConfig = {
                fixed_minutes: formData.fixedMinutes,
                once_it_ends: formData.onceItEnds,
                custom_end_title: formData.onceItEnds === 'custom' ? formData.customEndTitle : undefined
            };
        } else if (formData.timerType === 'generic') {
            timerConfig = {
                timer_start: formData.timerStart,
                start_date: formData.timerStart === 'schedule' ? formData.startDate : undefined,
                start_time: formData.timerStart === 'schedule' ? formData.startTime : undefined,
                end_date: formData.endDate,
                end_time: formData.endTime,
                once_it_ends: formData.onceItEnds,
                custom_end_title: formData.onceItEnds === 'custom' ? formData.customEndTitle : undefined
            };
        } else if (formData.timerType === 'daily') {
            timerConfig = {
                selected_days: formData.selectedDays,
                start_date: formData.startDate,
                end_date: formData.endDate,
                start_time: formData.startTime,
                end_time: formData.endTime,
                once_it_ends: formData.onceItEnds,
                custom_end_title: formData.onceItEnds === 'custom' ? formData.customEndTitle : undefined
            };
        }

        // Prepare design configuration
        const designConfig = {
            backgroundColor: formData.backgroundColor,
            hexColor: formData.hexColor,
            borderColor: formData.borderColor,
            cardBorderRadius: formData.cardBorderRadius,
            cardBorderSize: formData.cardBorderSize,
            cardBorderColor: formData.cardBorderColor,
            borderHexColor: formData.borderHexColor,
            insideTop: formData.insideTop,
            insideBottom: formData.insideBottom,
            outsideTop: formData.outsideTop,
            outsideBottom: formData.outsideBottom,
            titleSize: formData.titleSize,
            titleColor: formData.titleColor,
            titleHexColor: formData.titleHexColor,
            subheadingSize: formData.subheadingSize,
            subheadingColor: formData.subheadingColor,
            subheadingHexColor: formData.subheadingHexColor,
            timerSize: formData.timerSize,
            timerColor: formData.timerColor,
            timerHexColor: formData.timerHexColor,
            legendSize: formData.legendSize,
            legendColor: formData.legendColor,
            legendHexColor: formData.legendHexColor,
            borderRadius: formData.borderRadius,
            borderWidth: formData.borderWidth
        };

        // Prepare placement configuration
        const placementConfig = {
            display_position: formData.displayPosition,
            display_pages: formData.displayPages
        };

        const payload = {
            timer_name: formData.timerName?.trim(),
            title: formData.title?.trim(),
            sub_heading: formData.subHeading?.trim(),
            timer_labels: formData.timerLabels,
            timer_type: formData.timerType,
            timer_config: timerConfig,
            design_config: designConfig,
            placement_config: placementConfig,
            is_published: formData.isPublished,
        };

        try {
            const response = await fetchWithAuth("/api/countdown-timers/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setBannerErrors([]);
                setSuccessMessage(`${formData.timerName?.trim() || formData.title?.trim() || 'Countdown Timer'} was created successfully.`);
                setIsDirty(false);
                toast.show('Countdown Timer Created', { duration: 3000 });
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => navigate("/"), 2000);
            } else {
                const msg = (data && (data.message || data.error)) || 'Failed to save. Please try again.';
                setBannerErrors([msg]);
                setSuccessMessage('');
                toast.show('Failed to save. Please try again.', { duration: 4000, isError: true });
            }
        } catch (error) {
            console.error("Error Saving form", error);
            toast.show('Unexpected error. Please try again.', { duration: 4000, isError: true });
        }
    };

    const handleDiscard = () => {
        setFormData(savedData);
        setIsDirty(false);
        setTargetTime(null); // discard করলে countdown reset হবে
        setErrors({ timerName: '', title: '', subHeading: '', fixedMinutes: '', startDate: '', startTime: '', endDate: '', endTime: '' });
    };

    // Update targetTime when timerType or relevant fields change - with cleanup
    useEffect(() => {
        let isMounted = true;
        
        const updateTargetTime = () => {
            if (!isMounted) return;
            
            try {
                if (formData.timerType === 'fixed') {
                    // Set target time slightly in the future to ensure we start from full minutes
                    const now = new Date();
                    const futureTime = new Date(now.getTime() + (formData.fixedMinutes * 60 + 0.5) * 1000);
                    setTargetTime(futureTime);
                } else if (formData.timerType === 'generic') {
                    // For generic timer, check if it should start now or later
                    if (formData.timerStart === 'now') {
                        const endDateTime = createTimezoneAwareDate(formData.endDate, formData.endTime);
                        setTargetTime(endDateTime);
                    } else {
                        // Check if start time has passed
                        const startDateTime = createTimezoneAwareDate(formData.startDate, formData.startTime);
                        const endDateTime = createTimezoneAwareDate(formData.endDate, formData.endTime);
                        const now = new Date();
                        
                        if (now >= startDateTime) {
                            // Timer has started, use end time
                            setTargetTime(endDateTime);
                        } else {
                            // Timer hasn't started yet, don't set target time
                            setTargetTime(null);
                        }
                    }
                } else if (formData.timerType === 'daily') {
                    // For daily recurring timer, calculate the next occurrence
                    const now = new Date();
                    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    // Convert to UI day index: 0 = Monday, 1 = Tuesday, etc.
                    const uiDayIndex = today === 0 ? 6 : today - 1; // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
                    const currentTime = now.getHours() * 60 + now.getMinutes();
                    
                    // Validate time format before parsing
                    const timeParts = formData.startTime.split(':');
                    if (timeParts.length !== 2 || isNaN(parseInt(timeParts[0])) || isNaN(parseInt(timeParts[1]))) {
                        setTargetTime(null);
                        return;
                    }
                    
                    const startTime = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
                    const endTimeParts = formData.endTime.split(':');
                    const endTime = parseInt(endTimeParts[0]) * 60 + parseInt(endTimeParts[1]);
                    
                    // Check if current date is within the date range
                    const currentDate = now.toISOString().split('T')[0];
                    const isWithinDateRange = currentDate >= formData.startDate && currentDate <= formData.endDate;
                    
                    // Check if today is a selected day and we're within the date range
                    if (formData.selectedDays?.includes(uiDayIndex) && isWithinDateRange) {
                        if (currentTime >= startTime && currentTime < endTime) {
                            // Timer is active today, set end time for today
                            const todayDate = now.toISOString().split('T')[0];
                            const endDateTime = createTimezoneAwareDate(todayDate, formData.endTime);
                            setTargetTime(endDateTime);
                        } else {
                            // Timer hasn't started yet or has ended today, don't set target time
                            setTargetTime(null);
                        }
                    } else {
                        // Today is not a selected day or outside date range, don't set target time
                        setTargetTime(null);
                    }
                } else {
                    const endDateTime = createTimezoneAwareDate(formData.endDate, formData.endTime);
                    setTargetTime(endDateTime);
                }
            } catch (error) {
                console.error('Error updating target time:', error);
                if (isMounted) {
                    setTargetTime(null);
                }
            }
        };
        
        updateTargetTime();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [formData.timerType, formData.fixedMinutes, formData.endDate, formData.endTime, formData.timerStart, formData.startDate, formData.startTime, formData.selectedDays]);

    // Optimized countdown calculation with single interval management
    useEffect(() => {
        let intervalId = null;
        
        const calculateTime = () => {
            try {
                const now = new Date();
                
                // Handle different timer types
                if (formData.timerType === 'generic' && formData.timerStart === 'schedule') {
                    const startDateTime = createTimezoneAwareDate(formData.startDate, formData.startTime);
                    const endDateTime = createTimezoneAwareDate(formData.endDate, formData.endTime);
                    
                    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                        console.error('Invalid date format in timer calculation');
                        setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                        setIsCountdownEnded(false);
                        return;
                    }
                    
                    if (now < startDateTime) {
                        setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                        setIsCountdownEnded(false);
                        return;
                    } else if (now >= endDateTime) {
                        setIsCountdownEnded(true);
                        setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                        return;
                    } else {
                        // Timer is active, calculate remaining time
                        const diff = endDateTime - now;
                        updateRemainingTime(diff);
                    }
                } else if (formData.timerType === 'daily') {
                    const today = now.getDay();
                    const uiDayIndex = today === 0 ? 6 : today - 1;
                    const currentTime = now.getHours() * 60 + now.getMinutes();
                    
                    // Validate time format
                    const timeParts = formData.startTime.split(':');
                    if (timeParts.length !== 2 || isNaN(parseInt(timeParts[0])) || isNaN(parseInt(timeParts[1]))) {
                        console.error('Invalid start time format');
                        setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                        setIsCountdownEnded(false);
                        return;
                    }
                    
                    const startTime = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
                    const endTimeParts = formData.endTime.split(':');
                    const endTime = parseInt(endTimeParts[0]) * 60 + parseInt(endTimeParts[1]);
                    
                    const currentDate = now.toISOString().split('T')[0];
                    const isWithinDateRange = currentDate >= formData.startDate && currentDate <= formData.endDate;
                    
                    if (formData.selectedDays?.includes(uiDayIndex) && isWithinDateRange) {
                        if (currentTime >= startTime && currentTime < endTime) {
                            const todayDate = now.toISOString().split('T')[0];
                            const endDateTime = createTimezoneAwareDate(todayDate, formData.endTime);
                            const diff = endDateTime - now;
                            
                            if (diff <= 0) {
                                // Timer has ended for today
                                setIsCountdownEnded(true);
                                setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                            } else {
                                // Timer is active and counting down
                                setIsCountdownEnded(false);
                                updateRemainingTime(diff);
                            }
                        } else if (currentTime >= endTime) {
                            // Timer has ended for today
                            setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                            setIsCountdownEnded(true);
                        } else {
                            // Timer hasn't started yet today
                            setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                            setIsCountdownEnded(false);
                        }
                    } else {
                        // Not an active day or outside date range
                        setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                        setIsCountdownEnded(false);
                    }
                } else if (targetTime) {
                    // Fixed timer or generic timer with target time
                    const diff = targetTime - now;
                    
                    if (diff <= 0) {
                        if (formData.onceItEnds === 'repeat' && formData.timerType === 'fixed') {
                            // Restart the timer for repeat functionality
                            const futureTime = new Date(now.getTime() + (formData.fixedMinutes * 60 + 0.5) * 1000);
                            setTargetTime(futureTime);
                            setIsCountdownEnded(false);
                            return;
                        } else {
                            setIsCountdownEnded(true);
                            setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                            return;
                        }
                    }
                    
                    setIsCountdownEnded(false);
                    updateRemainingTime(diff);
                }
            } catch (error) {
                console.error('Error in timer calculation:', error);
                setRemainingTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                setIsCountdownEnded(false);
            }
        };

        const updateRemainingTime = (diff) => {
            // Add small compensation for calculation delay
            const compensatedDiff = Math.max(0, diff + 50);
            
            const days = String(Math.floor(compensatedDiff / (1000 * 60 * 60 * 24))).padStart(2, '0');
            const hours = String(Math.floor((compensatedDiff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            const minutes = String(Math.floor((compensatedDiff / (1000 * 60)) % 60)).padStart(2, '0');
            const seconds = String(Math.floor((compensatedDiff / 1000) % 60)).padStart(2, '0');

            setRemainingTime({ days, hours, minutes, seconds });
        };

        // Run calculation immediately
        calculateTime();
        
        // Set up single interval
        intervalId = setInterval(calculateTime, 1000);

        // Cleanup function
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [targetTime, formData.onceItEnds, formData.timerType, formData.fixedMinutes, formData.timerStart, formData.startDate, formData.startTime, formData.endDate, formData.endTime, formData.selectedDays]);

    const [successMessage, setSuccessMessage] = useState('');
    const [bannerErrors, setBannerErrors] = useState([]);

    return (
        <Frame>
            {isDirty && (
                <ContextualSaveBar
                    message="Unsaved changes"
                    saveAction={{ onAction: handleSave }}
                    discardAction={{ onAction: handleDiscard }}
                />   
            )}
            <Page
                backAction={{ content: 'Settings', onAction: () => navigate("/") }}
                title="Countdown Timer Settings"
                fullWidth
            >
                {bannerErrors?.length > 0 && (
                    <Box paddingBlockEnd="400">
                        <Layout>
                            <Layout.Section>
                                <Banner tone="critical" title={`There ${bannerErrors.length === 1 ? 'is 1 error' : `are ${bannerErrors.length} errors`} with this Sales Sticker:`}>
                                    <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
                                        {bannerErrors.map((e, i) => <li key={i}>{e}</li>)}
                                    </ul>
                                </Banner>
                            </Layout.Section>
                        </Layout>
                    </Box>
                )}

                {successMessage && (
                    <Box paddingBlockEnd="400">
                        <Layout>
                            <Layout.Section>
                                <Banner tone="success" title={successMessage} />
                            </Layout.Section>
                        </Layout>
                    </Box>
                )}

                <Box paddingBlockEnd="400">
                    <Tabs
                        tabs={[
                            {
                                id: 'content',
                                content: 'Content',
                                panelID: 'content-panel',
                            },
                            {
                                id: 'design',
                                content: 'Design',
                                panelID: 'design-panel',
                            },
                            {
                                id: 'placement',
                                content: 'Placement',
                                panelID: 'placement-panel',
                            },
                        ]}
                        selected={activeTab}
                        onSelect={handleTabChange}
                    >
                    </Tabs>
                </Box>

                {/* Content Tab */}
                {activeTab === 0 && (
                <Layout>
                    <Layout.Section variant='oneThird'>
                        <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '8px' }}>
                        <Card>
                            <BlockStack gap={400}>
                                <Text as="h2" variant='headingMd'>Status</Text>
                                <Card>
                                    <InlineStack align="space-between" blockAlign="center" gap="400">
                                        <Text>The Timer is <b>{formData.isPublished ? 'published' : 'unpublished'}</b></Text>
                                        <Button variant="primary" onClick={handleToggle}>
                                            {formData.isPublished ? 'Unpublish' : 'Publish'}
                                        </Button>
                                    </InlineStack>
                                </Card>
                                <Divider />

                                    <TextField
                                      label="Countdown Timer Name"
                                      value={formData.timerName}
                                      onChange={(val) => {
                                        setFormData(prev => ({ ...prev, timerName: val }));
                                        setErrors(prev => ({ ...prev, timerName: '' }));
                                        setBannerErrors([]);
                                        setSuccessMessage('');
                                      }}
                                      error={errors.timerName}
                                      helpText="Only visible to you. For your own internal reference."
                                      placeholder="e.g., Black Friday Sale Timer"
                                    />

                                <TextField
                                  label="Title"
                                  value={formData.title}
                                  onChange={(val) => {
                                    setFormData(prev => ({ ...prev, title: val }));
                                    setErrors(prev => ({ ...prev, title: '' }));
                                    setBannerErrors([]);
                                    setSuccessMessage('');
                                  }}
                                  error={errors.title}
                                />

                                <TextField
                                      label="SubHeading"
                                      value={formData.subHeading}
                                  onChange={(val) => {
                                        setFormData(prev => ({ ...prev, subHeading: val }));
                                        setErrors(prev => ({ ...prev, subHeading: '' }));
                                    setBannerErrors([]);
                                    setSuccessMessage('');
                                  }}
                                      error={errors.subHeading}
                                    />

                                    <Divider />

                                    <Text as="h3" variant='headingSm'>Timer Labels</Text>
                                    <InlineStack gap="200" wrap={false}>
                                        <TextField
                                            label="Days"
                                            value={formData.timerLabels.days}
                                            onChange={(val) => {
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    timerLabels: { ...prev.timerLabels, days: val }
                                                }));
                                            }}
                                        />
                                        <TextField
                                            label="Hours"
                                            value={formData.timerLabels.hours}
                                            onChange={(val) => {
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    timerLabels: { ...prev.timerLabels, hours: val }
                                                }));
                                            }}
                                        />
                                    </InlineStack>
                                    <InlineStack gap="200" wrap={false}>
                                        <TextField
                                            label="Minutes"
                                            value={formData.timerLabels.minutes}
                                            onChange={(val) => {
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    timerLabels: { ...prev.timerLabels, minutes: val }
                                                }));
                                            }}
                                        />
                                        <TextField
                                            label="Seconds"
                                            value={formData.timerLabels.seconds}
                                            onChange={(val) => {
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    timerLabels: { ...prev.timerLabels, seconds: val }
                                                }));
                                            }}
                                        />
                                    </InlineStack>

                                <Divider />
                                <Text as="h2" variant='headingMd'>Timer Types</Text>
                                <RadioButton label="Fixed minutes timer" checked={formData.timerType === 'fixed'} id="fixed" name="timertype" value="fixed" onChange={() => { setFormData(prev => ({ ...prev, timerType: 'fixed' })); setErrors(prev => ({ ...prev, endDate: '', endTime: '' })); }} />
                                <RadioButton label="Generic timer" checked={formData.timerType === 'generic'} id="generic" name="timertype" value="generic" onChange={() => { setFormData(prev => ({ ...prev, timerType: 'generic' })); setErrors(prev => ({ ...prev, fixedMinutes: '' })); }} />
                                <RadioButton 
                                    label="Daily Recurring Timer" 
                                    checked={formData.timerType === 'daily'} 
                                    id="daily" 
                                    name="timertype" 
                                    value="daily" 
                                    onChange={() => { setFormData(prev => ({ ...prev, timerType: 'daily' })); setErrors(prev => ({ ...prev, fixedMinutes: '', endDate: '', endTime: '' })); }} 
                                    helpText="E.g. every weekday from 9 am to 11 am"
                                />

                                {formData.timerType === 'generic' && (
                                    <>
                                        <Text as="h3" variant='headingSm'>Timer Starts</Text>
                                        <RadioButton 
                                            label="Right now" 
                                            checked={formData.timerStart === 'now'} 
                                            id="now" 
                                            name="timerStart" 
                                            value="now" 
                                            onChange={() => { setFormData(prev => ({ ...prev, timerStart: 'now' })); setErrors(prev => ({ ...prev, startDate: '', startTime: '' })); }} 
                                        />
                                        <RadioButton 
                                            label="Schedule to start later" 
                                            checked={formData.timerStart === 'schedule'} 
                                            id="schedule" 
                                            name="timerStart" 
                                            value="schedule" 
                                            onChange={() => { setFormData(prev => ({ ...prev, timerStart: 'schedule' })); }} 
                                        />
                                        
                                        {formData.timerStart === 'schedule' && (
                                            <InlineStack gap="400" blockAlign="stretch">
                                                <TextField
                                                  label="Start Date"
                                                  type="date"
                                                  value={formData.startDate}
                                                  onChange={(val) => { setFormData(prev => ({ ...prev, startDate: val })); setErrors(prev => ({ ...prev, startDate: '' })); }}
                                                  error={errors.startDate}
                                                />
                                                <TextField
                                                  label="Start Time"
                                                  type="time"
                                                  value={formData.startTime}
                                                  onChange={(val) => { setFormData(prev => ({ ...prev, startTime: val })); setErrors(prev => ({ ...prev, startTime: '' })); }}
                                                  error={errors.startTime}
                                                />
                                            </InlineStack>
                                        )}
                                        
                                    <InlineStack gap="400" blockAlign="stretch">
                                        <TextField
                                          label="End Date"
                                          type="date"
                                          value={formData.endDate}
                                          onChange={(val) => { setFormData(prev => ({ ...prev, endDate: val })); setErrors(prev => ({ ...prev, endDate: '' })); }}
                                          error={errors.endDate}
                                        />
                                        <TextField
                                          label="End Time"
                                          type="time"
                                          value={formData.endTime}
                                          onChange={(val) => { setFormData(prev => ({ ...prev, endTime: val })); setErrors(prev => ({ ...prev, endTime: '' })); }}
                                          error={errors.endTime}
                                        />
                                    </InlineStack>
                                        
                                        <Select
                                            label="Action when countdown ends"
                                            value={formData.onceItEnds}
                                            onChange={(value) => setFormData(prev => ({ ...prev, onceItEnds: value }))}
                                            options={[
                                                { label: 'Hide Timer', value: 'hide' },
                                                { label: 'Show Custom Title', value: 'custom' },
                                                { label: 'Do nothing', value: 'nothing' }
                                            ]}
                                        />
                                        
                                        {formData.onceItEnds === 'custom' && (
                                            <TextField
                                                label="Custom End Title"
                                                value={formData.customEndTitle}
                                                onChange={(val) => setFormData(prev => ({ ...prev, customEndTitle: val }))}
                                                placeholder="Sales Ends"
                                            />
                                        )}
                                    </>
                                )}

                                {formData.timerType === 'daily' && (
                                    <>
                                        <Text as="h3" variant='headingSm'>Weekdays</Text>
                                        <InlineStack gap="400" wrap>
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                                                <Checkbox
                                                    key={day}
                                                    label={day}
                                                    checked={formData.selectedDays?.includes(index) || false}
                                                    onChange={(checked) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            selectedDays: checked 
                                                                ? [...(prev.selectedDays || []), index]
                                                                : (prev.selectedDays || []).filter(dayIndex => dayIndex !== index)
                                                        }));
                                                    }}
                                                />
                                            ))}
                                        </InlineStack>
                                        
                                        <InlineStack gap="400" blockAlign="stretch">
                                            <TextField
                                                label="Start Date"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(val) => { setFormData(prev => ({ ...prev, startDate: val })); setErrors(prev => ({ ...prev, startDate: '' })); }}
                                                error={errors.startDate}
                                            />
                                            <TextField
                                                label="End Date"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(val) => { setFormData(prev => ({ ...prev, endDate: val })); setErrors(prev => ({ ...prev, endDate: '' })); }}
                                                error={errors.endDate}
                                            />
                                        </InlineStack>
                                        
                                        <InlineStack gap="400" blockAlign="stretch">
                                            <TextField
                                                label="Start Time"
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(val) => { setFormData(prev => ({ ...prev, startTime: val })); setErrors(prev => ({ ...prev, startTime: '' })); }}
                                                error={errors.startTime}
                                            />
                                            <TextField
                                                label="End Time"
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(val) => { setFormData(prev => ({ ...prev, endTime: val })); setErrors(prev => ({ ...prev, endTime: '' })); }}
                                                error={errors.endTime}
                                            />
                                        </InlineStack>
                                        
                                        <Select
                                            label="Action when countdown timer ends"
                                            value={formData.onceItEnds}
                                            onChange={(value) => setFormData(prev => ({ ...prev, onceItEnds: value }))}
                                            options={[
                                                { label: 'Hide Timer', value: 'hide' },
                                                { label: 'Show Custom Title', value: 'custom' },
                                                { label: 'Do nothing', value: 'nothing' }
                                            ]}
                                        />
                                        
                                        {formData.onceItEnds === 'custom' && (
                                            <TextField
                                                label="Custom End Title"
                                                value={formData.customEndTitle}
                                                onChange={(val) => setFormData(prev => ({ ...prev, customEndTitle: val }))}
                                                placeholder="Sales Ends"
                                            />
                                        )}
                                    </>
                                )}

                                {formData.timerType === 'fixed' && (
                                    <>
                                        <Text as='h2' variant='headingMd'>Countdown from fixed minutes</Text>
                                        <RangeSlider
                                          min={1}
                                          max={1440}
                                          value={Math.min(formData.fixedMinutes, 1440)}
                                          onChange={(val) => { setFormData(prev => ({ ...prev, fixedMinutes: val })); setErrors(prev => ({ ...prev, fixedMinutes: '' })); }}
                                        />
                                        <TextField
                                          type="number"
                                          value={formData.fixedMinutes.toString()}
                                          onChange={handleFixedMinutesChange}
                                          label="Minutes"
                                          error={errors.fixedMinutes}
                                          min="1"
                                          step="1"
                                        />
                                        
                                        {/* <Text as="h3" variant='headingSm'>Once it ends</Text> */}
                                        <Select
                                            label="Action when countdown ends"
                                            value={formData.onceItEnds}
                                            onChange={(value) => setFormData(prev => ({ ...prev, onceItEnds: value }))}
                                            options={[
                                                { label: 'Hide the timer for the buyer', value: 'hide' },
                                                { label: 'Repeat the countdown', value: 'repeat' },
                                                { label: 'Show custom title', value: 'custom' },
                                                { label: 'Do nothing', value: 'nothing' }
                                            ]}
                                        />
                                        
                                        {formData.onceItEnds === 'custom' && (
                                            <TextField
                                                label="Custom End Title"
                                                value={formData.customEndTitle}
                                                onChange={(val) => setFormData(prev => ({ ...prev, customEndTitle: val }))}
                                                placeholder="Sales Ends"
                                            />
                                        )}
                                    </>
                                )}
                                
                                <Divider />
                                <Button 
                                    variant="primary" 
                                    size="large"
                                    fullWidth
                                    onClick={() => setActiveTab(1)}
                                >
                                    Continue to Design
                                </Button>
                            </BlockStack>
                        </Card>
                        </div>
                    </Layout.Section>

                    <Layout.Section>
                        <div style={{ position: 'sticky', top: '80px' }}>
                            <Card>
                            <InlineStack align="space-between" blockAlign="center" gap="400">
                                <Text as='h2' variant='headingMd'>Preview</Text>
                                <ButtonGroup variant="segmented">
                                    <Button pressed={activeButtonIndex === 0} onClick={() => handleButtonClick(0)}>Desktop</Button>
                                    <Button pressed={activeButtonIndex === 1} onClick={() => handleButtonClick(1)}>Mobile</Button>
                                </ButtonGroup>
                            </InlineStack>

                                <Box display="flex" justifyContent="center" alignItems="center" paddingBlockStart="400">
                                    <Box
                                      padding="400"
                                      shadow="sm"
                                      style={{
                                        width: activeButtonIndex === 1 ? "375px" : "100%",
                                        maxWidth: activeButtonIndex === 0 ? "1000px" : "none",
                                        height: "auto",
                                        margin: "0 auto",
                                        transition: "all 0.3s ease-in-out",
                                        border: "1px solid #ccc",
                                        borderRadius: activeButtonIndex === 1 ? "30px" : "6px",
                                        backgroundColor: "#fff",
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: "24px",
                                        padding: "24px",
                                      }}
                                    >
                                        <div style={{ 
                                            flex: "0 0 40%", 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            border: "2px solid #00AAFF",
                                            borderRadius: "12px",
                                            backgroundColor: "#ffffff",
                                            padding: "16px"
                                        }}>
                                            <img 
                                              src={tshirtImage} 
                                              alt="Product" 
                                              style={{ width: "100%", borderRadius: "8px", maxWidth: "300px" }} 
                                            />
                                        </div>
                                        <div style={{ flex: "1" }}>
                                            <BlockStack gap="400">
                                                {/* Timer at top */}
                                                {formData.displayPosition === 'top' && renderTimer()}
                                                
                                                {/* Timer before title */}
                                                {formData.displayPosition === 'before-title' && renderTimer()}
                                                
                                                <Text variant="headingLg" as="h2">Title: Classic Black T-Shirt</Text>
                                                
                                                {/* Timer after title and before price */}
                                                {formData.displayPosition === 'after-title-before-price' && renderTimer()}
                                                
                                                <Text variant="headingLg" fontWeight="bold">Price: $29.99</Text>
                                                
                                                {/* Timer after price and before quantity */}
                                                {formData.displayPosition === 'after-price-before-quantity' && renderTimer()}
                                                
                                                <InlineStack align="left" gap="200">
                                                    <Button size="Large" variant="tertiary" tone="critical" onClick={decreaseQuantity}>–</Button>
                                                    <Text variant="bodyLg" fontWeight="semibold" alignment="center">{quantity}</Text>
                                                    <Button size="Large" variant="tertiary" tone="success" onClick={increaseQuantity}>+</Button>
                                                </InlineStack>
                                                
                                                {/* Timer after quantity and before add to cart */}
                                                {formData.displayPosition === 'after-quantity-before-cart' && renderTimer()}
                                                
                                                <Button 
                                                    variant="secondary" 
                                                    size="large" 
                                                    fullWidth
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        border: '1px solid #000000'
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                                
                                                {/* Timer after add to cart */}
                                                {formData.displayPosition === 'after-cart' && renderTimer()}
                                                
                                                {/* Timer at bottom */}
                                                {formData.displayPosition === 'bottom' && renderTimer()}
                                            </BlockStack>
                                        </div>
                                    </Box>
                                </Box>
                            </Card>
                        </div>
                    </Layout.Section>                  
                </Layout>
                )}

                {/* Design Tab */}
                {activeTab === 1 && (
                    <Layout>
                        <Layout.Section variant='oneThird'>
                            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '8px' }}>
                            <Card>
                                <BlockStack gap={400}>
                                    <Text as="h3" variant='headingMd'>Background Settings</Text>
                                    
                                    <ColorPickerInput
                                        label="Background color"
                                        value={formData.hexColor}
                                        onChange={handleBackgroundColorChange}
                                        placeholder="#1814E1"
                                        defaultColor={formData.backgroundColor}
                                    />
                                    
                                    <Divider />
                                    
                                    <Text as="h3" variant='headingMd'>Card Design</Text>
                                    
                                    <RangeSlider
                                        label="Border Radius"
                                        value={formData.cardBorderRadius}
                                        min={0}
                                        max={50}
                                        step={1}
                                        onChange={(value) => setFormData(prev => ({ ...prev, cardBorderRadius: value }))}
                                    />
                                    
                                    <TextField
                                        label="Border Radius Value"
                                        type="number"
                                        value={formData.cardBorderRadius}
                                        onChange={(value) => setFormData(prev => ({ ...prev, cardBorderRadius: Math.max(0, Math.min(50, parseInt(value) || 0)) }))}
                                        suffix="px"
                                    />
                                    
                                    <RangeSlider
                                        label="Border Size"
                                        value={formData.cardBorderSize}
                                        min={0}
                                        max={10}
                                        step={1}
                                        onChange={(value) => setFormData(prev => ({ ...prev, cardBorderSize: value }))}
                                    />
                                    
                                    <TextField
                                        label="Border Size Value"
                                        type="number"
                                        value={formData.cardBorderSize}
                                        onChange={(value) => setFormData(prev => ({ ...prev, cardBorderSize: Math.max(0, Math.min(10, parseInt(value) || 0)) }))}
                                        suffix="px"
                                    />
                                    
                                    <ColorPickerInput
                                        label="Border Color"
                                        value={formData.cardBorderColor}
                                        onChange={(color, hexColor) => setFormData(prev => ({ ...prev, cardBorderColor: hexColor }))}
                                        placeholder="#00AAFF"
                                        defaultColor={{ hue: 0, saturation: 0, brightness: 0.8 }}
                                    />
                                    
                                    <Divider />
                                    
                                    <Text as="h3" variant='headingMd'>Inside Spacing</Text>
                                    <InlineStack gap="200" wrap={false}>
                                        <TextField
                                            label="Inside Top"
                                            type="number"
                                            value={formData.insideTop}
                                            onChange={(value) => setFormData(prev => ({ ...prev, insideTop: Math.max(0, parseInt(value) || 0) }))}
                                        />
                                        <TextField
                                            label="Inside Bottom"
                                            type="number"
                                            value={formData.insideBottom}
                                            onChange={(value) => setFormData(prev => ({ ...prev, insideBottom: Math.max(0, parseInt(value) || 0) }))}
                                        />
                                    </InlineStack>
                                    
                                    <Divider />
                                    
                                    <Text as="h3" variant='headingMd'>Outside Spacing</Text>
                                    <InlineStack gap="200" wrap={false}>
                                        <TextField
                                            label="Outside Top"
                                            type="number"
                                            value={formData.outsideTop}
                                            onChange={(value) => setFormData(prev => ({ ...prev, outsideTop: Math.max(0, parseInt(value) || 0) }))}
                                        />
                                        <TextField
                                            label="Outside Bottom"
                                            type="number"
                                            value={formData.outsideBottom}
                                            onChange={(value) => setFormData(prev => ({ ...prev, outsideBottom: Math.max(0, parseInt(value) || 0) }))}
                                        />
                                    </InlineStack>

                                    <Divider />
                                    
                                    <Text as="h3" variant='headingMd'>Typography Settings</Text>
                                    
                                    <Text as="h4" variant='headingSm' style={{ marginTop: '16px', marginBottom: '8px' }}>Title Size and Color</Text>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <TextField
                                            label="Title Size"
                                            type="number"
                                            value={formData.titleSize}
                                            onChange={(value) => setFormData(prev => ({ ...prev, titleSize: Math.max(1, parseInt(value) || 1) }))}
                                        />
                                        <ColorPickerInput
                                            label="Title Color"
                                            value={formData.titleHexColor}
                                            onChange={(color, hexColor) => setFormData(prev => ({ ...prev, titleColor: color, titleHexColor: hexColor }))}
                                            placeholder="#202223"
                                            defaultColor={formData.titleColor}
                                        />
                                    </div>
                                    <Divider />
                                    
                                    <Text as="h4" variant='headingSm' style={{ marginTop: '16px', marginBottom: '8px' }}>Subheading Size and Color</Text>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <TextField
                                            label="Subheading Size"
                                            type="number"
                                            value={formData.subheadingSize}
                                            onChange={(value) => setFormData(prev => ({ ...prev, subheadingSize: Math.max(1, parseInt(value) || 1) }))}
                                        />
                                        <ColorPickerInput
                                            label="Subheading Color"
                                            value={formData.subheadingHexColor}
                                            onChange={(color, hexColor) => setFormData(prev => ({ ...prev, subheadingColor: color, subheadingHexColor: hexColor }))}
                                            placeholder="#202223"
                                            defaultColor={formData.subheadingColor}
                                        />
                                    </div>
                                    <Divider />
                                    
                                    <Text as="h4" variant='headingSm' style={{ marginTop: '16px', marginBottom: '8px' }}>Timer Size and Color</Text>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <TextField
                                            label="Timer Size"
                                            type="number"
                                            value={formData.timerSize}
                                            onChange={(value) => setFormData(prev => ({ ...prev, timerSize: Math.max(1, parseInt(value) || 1) }))}
                                        />
                                        <ColorPickerInput
                                            label="Timer Color"
                                            value={formData.timerHexColor}
                                            onChange={(color, hexColor) => setFormData(prev => ({ ...prev, timerColor: color, timerHexColor: hexColor }))}
                                            placeholder="#202223"
                                            defaultColor={formData.timerColor}
                                        />
                                    </div>
                                    <Divider />
                                    
                                    <Text as="h4" variant='headingSm' style={{ marginTop: '16px', marginBottom: '8px' }}>Legend Size and Color</Text>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <TextField
                                            label="Legend Size"
                                            type="number"
                                            value={formData.legendSize}
                                            onChange={(value) => setFormData(prev => ({ ...prev, legendSize: Math.max(1, parseInt(value) || 1) }))}
                                        />
                                        <ColorPickerInput
                                            label="Legend Color"
                                            value={formData.legendHexColor}
                                            onChange={(color, hexColor) => setFormData(prev => ({ ...prev, legendColor: color, legendHexColor: hexColor }))}
                                            placeholder="#202223"
                                            defaultColor={formData.legendColor}
                                        />
                                    </div>
                                    <Divider />
                                   
                                    <Button 
                                        variant="primary" 
                                        size="large"
                                        fullWidth
                                        onClick={() => setActiveTab(2)}
                                    >
                                        Continue to Placement
                                    </Button>
                                </BlockStack>
                            </Card>
                            </div>
                        </Layout.Section>

                        <Layout.Section>
                            <div style={{ position: 'sticky', top: '80px' }}>
                                <Card>
                                    <InlineStack align="space-between" blockAlign="center" gap="400">
                                        <Text as='h2' variant='headingMd'>Preview</Text>
                                    <ButtonGroup variant="segmented">
                                        <Button pressed={activeButtonIndex === 0} onClick={() => handleButtonClick(0)}>Desktop</Button>
                                        <Button pressed={activeButtonIndex === 1} onClick={() => handleButtonClick(1)}>Mobile</Button>
                                    </ButtonGroup>
                                </InlineStack>

                            <Box display="flex" justifyContent="center" alignItems="center" paddingBlockStart="400">
                                <Box
                                  padding="400"
                                  shadow="sm"
                                  style={{
                                    width: activeButtonIndex === 1 ? "375px" : "100%",
                                    maxWidth: activeButtonIndex === 0 ? "1000px" : "none",
                                    height: "auto",
                                    margin: "0 auto",
                                    transition: "all 0.3s ease-in-out",
                                    border: "1px solid #ccc",
                                    borderRadius: activeButtonIndex === 1 ? "30px" : "6px",
                                    backgroundColor: "#fff",
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: "24px",
                                    padding: "24px",
                                  }}
                                >
                                        <div style={{ 
                                            flex: "0 0 40%", 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            border: "2px solid #00AAFF",
                                            borderRadius: "12px",
                                            backgroundColor: "#ffffff",
                                            padding: "16px"
                                        }}>
                                            <img 
                                              src={tshirtImage} 
                                              alt="Product" 
                                              style={{ width: "100%", borderRadius: "8px", maxWidth: "300px" }} 
                                            />
                                        </div>
                                        <div style={{ flex: "1" }}>
                                            <BlockStack gap="400">
                                                {/* Timer at top */}
                                                {formData.displayPosition === 'top' && renderTimer()}
                                                
                                                {/* Timer before title */}
                                                {formData.displayPosition === 'before-title' && renderTimer()}
                                                
                                                <Text variant="headingLg" as="h2">Title: Classic Black T-Shirt</Text>
                                                
                                                {/* Timer after title and before price */}
                                                {formData.displayPosition === 'after-title-before-price' && renderTimer()}
                                                
                                                <Text variant="headingLg" fontWeight="bold">Price: $29.99</Text>
                                                
                                                {/* Timer after price and before quantity */}
                                                {formData.displayPosition === 'after-price-before-quantity' && renderTimer()}
                                                
                                                <InlineStack align="left" gap="200">
                                                    <Button size="Large" variant="tertiary" tone="critical" onClick={decreaseQuantity}>–</Button>
                                                    <Text variant="bodyLg" fontWeight="semibold" alignment="center">{quantity}</Text>
                                                    <Button size="Large" variant="tertiary" tone="success" onClick={increaseQuantity}>+</Button>
                                                </InlineStack>
                                                
                                                {/* Timer after quantity and before add to cart */}
                                                {formData.displayPosition === 'after-quantity-before-cart' && renderTimer()}
                                                
                                                <Button 
                                                    variant="secondary" 
                                                    size="large" 
                                                    fullWidth
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        border: '1px solid #000000'
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                                
                                                {/* Timer after add to cart */}
                                                {formData.displayPosition === 'after-cart' && renderTimer()}
                                                
                                                {/* Timer at bottom */}
                                                {formData.displayPosition === 'bottom' && renderTimer()}
                                            </BlockStack>
                                                                </div>
                                </Box>
                            </Box>
                        </Card>
                        </div>
                    </Layout.Section>
                    
                </Layout>
                )}

                {/* Placement Tab */}
                {activeTab === 2 && (
                    <Layout>
                        <Layout.Section variant='oneThird'>
                            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '8px' }}>
                            <Card>
                                <BlockStack gap={400}>
                                    <Text as="h2" variant='headingMd'>Placement Settings</Text>
                                    
                                    <Text as="h3" variant='headingSm'>Display Position</Text>
                                    <Select
                                        label="Timer Position"
                                        value={formData.displayPosition}
                                        onChange={(value) => setFormData(prev => ({ ...prev, displayPosition: value }))}
                                        options={[
                                            { label: 'Display on the top', value: 'top' },
                                            { label: 'Display before Title', value: 'before-title' },
                                            { label: 'Display after Title and before Price', value: 'after-title-before-price' },
                                            { label: 'Display after Price and before Quantity', value: 'after-price-before-quantity' },
                                            { label: 'Display after Quantity and before Add to Cart', value: 'after-quantity-before-cart' },
                                            { label: 'Display after Add to Cart', value: 'after-cart' },
                                            { label: 'Display on the bottom', value: 'bottom' }
                                        ]}
                                    />
                                    
                                    <Divider />
                                    
                                    <Text as="h3" variant='headingSm'>Display Pages</Text>
                                    <Select
                                        label="Page Display"
                                        value={formData.displayPages}
                                        onChange={(value) => setFormData(prev => ({ ...prev, displayPages: value }))}
                                        options={[
                                            { label: 'Product Pages Only', value: 'product-only' },
                                            { label: 'Collection Pages', value: 'collection' },
                                            { label: 'All Pages', value: 'all' }
                                        ]}
                                    /> 
                                    
                                </BlockStack>
                            </Card>
                            </div>
                        </Layout.Section>

                        <Layout.Section>
                            <div style={{ position: 'sticky', top: '80px' }}>
                                <Card style={{
                                    backgroundColor: '#fff',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}>
                                <InlineStack align="space-between" blockAlign="center" gap="400">
                                    <Text as='h2' variant='headingMd'>Preview</Text>
                                    <ButtonGroup variant="segmented">
                                        <Button pressed={activeButtonIndex === 0} onClick={() => handleButtonClick(0)}>Desktop</Button>
                                        <Button pressed={activeButtonIndex === 1} onClick={() => handleButtonClick(1)}>Mobile</Button>
                                    </ButtonGroup>
                                </InlineStack>

                                <Box display="flex" justifyContent="center" alignItems="center" paddingBlockStart="400">
                                    <Box
                                        padding="400"
                                        shadow="sm"
                                        style={{
                                            width: activeButtonIndex === 1 ? "375px" : "100%",
                                            maxWidth: activeButtonIndex === 0 ? "1000px" : "none",
                                            height: "auto",
                                            margin: "0 auto",
                                            transition: "all 0.3s ease-in-out",
                                            border: "1px solid #ccc",
                                            borderRadius: activeButtonIndex === 1 ? "30px" : "6px",
                                            backgroundColor: "#fff",
                                            display: "flex",
                                            flexDirection: "row",
                                            gap: "24px",
                                            padding: "24px",
                                        }}
                                    >
                                        <div style={{ 
                                            flex: "0 0 40%", 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            border: "2px solid #00AAFF",
                                            borderRadius: "12px",
                                            backgroundColor: "#ffffff",
                                            padding: "16px"
                                        }}>
                                            <img 
                                              src={tshirtImage} 
                                              alt="Product" 
                                              style={{ width: "100%", borderRadius: "8px", maxWidth: "300px" }} 
                                            />
                                        </div>
                                        <div style={{ flex: "1" }}>
                                            <BlockStack gap="400">
                                                {/* Timer at top */}
                                                {formData.displayPosition === 'top' && renderTimer()}
                                                
                                                {/* Timer before title */}
                                                {formData.displayPosition === 'before-title' && renderTimer()}
                                                
                                                <Text variant="headingLg" as="h2">Title: Classic Black T-Shirt</Text>
                                                
                                                {/* Timer after title and before price */}
                                                {formData.displayPosition === 'after-title-before-price' && renderTimer()}
                                                
                                                <Text variant="headingLg" fontWeight="bold">Price: $29.99</Text>
                                                
                                                {/* Timer after price and before quantity */}
                                                {formData.displayPosition === 'after-price-before-quantity' && renderTimer()}
                                                
                                                <InlineStack align="left" gap="200">
                                                    <Button size="Large" variant="tertiary" tone="critical" onClick={decreaseQuantity}>–</Button>
                                                    <Text variant="bodyLg" fontWeight="semibold" alignment="center">{quantity}</Text>
                                                    <Button size="Large" variant="tertiary" tone="success" onClick={increaseQuantity}>+</Button>
                                                </InlineStack>
                                                
                                                {/* Timer after quantity and before add to cart */}
                                                {formData.displayPosition === 'after-quantity-before-cart' && renderTimer()}
                                                
                                                <Button 
                                                    variant="secondary" 
                                                    size="large" 
                                                    fullWidth
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        border: '1px solid #000000'
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                                
                                                {/* Timer after add to cart */}
                                                {formData.displayPosition === 'after-cart' && renderTimer()}
                                                
                                                {/* Timer at bottom */}
                                                {formData.displayPosition === 'bottom' && renderTimer()}
                                            </BlockStack>
                                        </div>
                                    </Box>
                                </Box>
                            </Card>
                            </div>
                        </Layout.Section>
                    </Layout>
                )}
            </Page>
        </Frame>
    );
}