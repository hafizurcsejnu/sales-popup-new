import { useState, useEffect, useRef } from 'react';
import { ColorPicker } from '@shopify/polaris';

// Generate unique ID for each color picker instance
let colorPickerIdCounter = 0;

export default function ColorPickerInput({ 
    label, 
    value, 
    onChange, 
    placeholder = "#ffffff",
    defaultColor = { hue: 0, saturation: 0, brightness: 1 }
}) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [tempColor, setTempColor] = useState(null);
    const [tempHexColor, setTempHexColor] = useState(null);
    const [showAbove, setShowAbove] = useState(false);
    const colorPickerRef = useRef(null);
    const pickerDropdownRef = useRef(null);
    const instanceIdRef = useRef(++colorPickerIdCounter);

    // Listen for other color pickers opening
    useEffect(() => {
        const handleOtherPickerOpen = (event) => {
            // If another color picker is opening and it's not this one, close this one
            if (event.detail.id !== instanceIdRef.current && showColorPicker) {
                // Save changes before closing
                if (tempColor && tempHexColor) {
                    onChange(tempColor, tempHexColor);
                }
                setShowColorPicker(false);
                setTempColor(null);
                setTempHexColor(null);
            }
        };

        window.addEventListener('colorPickerOpen', handleOtherPickerOpen);
        return () => {
            window.removeEventListener('colorPickerOpen', handleOtherPickerOpen);
        };
    }, [showColorPicker, tempColor, tempHexColor, onChange]);

    // Check positioning when color picker is shown
    useEffect(() => {
        if (showColorPicker && colorPickerRef.current) {
            const rect = colorPickerRef.current.getBoundingClientRect();
            const pickerHeight = 350; // Approximate height of color picker
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            // Show above if not enough space below but enough space above
            setShowAbove(spaceBelow < pickerHeight && spaceAbove > pickerHeight);
        }
    }, [showColorPicker]);

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showColorPicker) {
                // Check if click is outside the color picker dropdown specifically
                const colorPickerDropdown = colorPickerRef.current?.querySelector('.color-picker-dropdown');
                if (colorPickerDropdown && !colorPickerDropdown.contains(event.target)) {
                    // Only save if there's a temporary color selected
                    if (tempColor && tempHexColor) {
                        onChange(tempColor, tempHexColor);
                    }
                    setShowColorPicker(false);
                    setTempColor(null);
                    setTempHexColor(null);
                }
            }
        };

        if (showColorPicker) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showColorPicker, tempColor, tempHexColor, onChange]);

    const handleColorChange = (color) => {
        // Convert HSB to hex
        const h = color.hue;
        const s = color.saturation;
        const v = color.brightness;
        
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        
        let r, g, b;
        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        
        setTempColor(color);
        setTempHexColor(hex);
    };

    const handleHexChange = (hexValue) => {
        setTempHexColor(hexValue);
        
        // Convert hex to HSB color format
        if (hexValue && hexValue.match(/^#[0-9A-Fa-f]{6}$/)) {
            const hex = hexValue.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            
            let h = 0;
            if (delta !== 0) {
                if (max === r) {
                    h = 60 * (((g - b) / delta) % 6);
                } else if (max === g) {
                    h = 60 * ((b - r) / delta + 2);
                } else {
                    h = 60 * ((r - g) / delta + 4);
                }
            }
            if (h < 0) h += 360;
            
            const s = max === 0 ? 0 : delta / max;
            const v = max;
            
            const color = { hue: h, saturation: s, brightness: v };
            setTempColor(color);
            onChange(color, hexValue);
        }
    };

    return (
        <div ref={colorPickerRef} style={{ position: 'relative', marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '400', color: '#374151' }}>
                {label}
            </label>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #c9cccf',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    minHeight: '36px'
                }}
            >
                <input
                    type="text"
                    value={tempHexColor || value || ''}
                    onChange={(e) => handleHexChange(e.target.value)}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (showColorPicker) {
                            // Save and close when clicking input field
                            if (tempColor && tempHexColor) {
                                onChange(tempColor, tempHexColor);
                            }
                            setShowColorPicker(false);
                            setTempColor(null);
                            setTempHexColor(null);
                        }
                    }}
                    style={{
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '14px',
                        color: '#202223',
                        backgroundColor: 'transparent',
                        fontFamily: 'inherit'
                    }}
                    placeholder={placeholder}
                />
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: (tempHexColor || value) ? (tempHexColor || value) : '#ffffff',
                        border: '1px solid #c9cccf',
                        marginLeft: '8px',
                        cursor: 'pointer'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (showColorPicker) {
                            // Save and close when clicking swatch again
                            if (tempColor && tempHexColor) {
                                onChange(tempColor, tempHexColor);
                            }
                            setShowColorPicker(false);
                            setTempColor(null);
                            setTempHexColor(null);
                        } else {
                            // Dispatch event to close other color pickers
                            window.dispatchEvent(new CustomEvent('colorPickerOpen', { 
                                detail: { id: instanceIdRef.current } 
                            }));
                            setShowColorPicker(true);
                        }
                    }}
                />
            </div>

            {showColorPicker && (
                <div 
                    ref={pickerDropdownRef}
                    className="color-picker-dropdown"
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                        position: 'absolute',
                        ...(showAbove 
                            ? { bottom: '100%', marginBottom: '4px' } 
                            : { top: '100%', marginTop: '4px' }
                        ),
                        left: 0,
                        zIndex: 10000,
                        backgroundColor: '#ffffff',
                        border: '1px solid #c9cccf',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}
                >
                    <ColorPicker
                        color={tempColor || defaultColor}
                        onChange={handleColorChange}
                        allowAlpha={false}
                    />
                </div>
            )}
        </div>
    );
}
