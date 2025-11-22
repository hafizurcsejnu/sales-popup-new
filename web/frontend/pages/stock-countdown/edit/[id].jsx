import React, { useState, useCallback, useEffect } from 'react';
import {
  Frame,
  ContextualSaveBar,
  Page,
  Layout,
  Card,
  Text,
  TextField,
  ButtonGroup,
  Button,
  Box,
  InlineStack,
  BlockStack,
  Checkbox,
  Divider,
  ProgressBar,
  Banner,
  Tabs,
  Select,
  RangeSlider,
  ColorPicker
} from '@shopify/polaris';
import tshirtImage from './t-shirt.png';
import { useAuthenticatedFetch } from "../../../hooks";
import { useNavigate, useParams  } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useToast } from '@shopify/app-bridge-react';
import { MessageInput, InventorySelector, VariantPicker, ColorPickerInput} from '../../../components';

export default function EditStockCountdown() {
    const navigate = useNavigate();
    const { id } = useParams();
    const fetchWithAuth = useAuthenticatedFetch();
    const toast = useToast();
    const app = useAppBridge();

    // Saved data (original) - will be populated from API
    const [savedData, setSavedData] = useState(null);

    // Default form data structure
    const defaultFormData = {
        title: '',
        isPublished: false,
        stockLimit: 10,
        messageTemplate: "Only {{stock}} left.",
        selectedVariants: [],
        showProgressBar: false,
        barColor: { hue: 120, saturation: 1, brightness: 1 },
        barHexColor: '#00ff00',
        // Progress bar settings
        progressBarStyle: 'rounded', // 'rounded' or 'flat'
        progressBarPosition: 'below', // 'above' or 'below'
        progressBarWidth: 100, // 5 to 100
        progressBarHeight: 8, // 5 to 30
        progressBarBackgroundColor: { hue: 0, saturation: 0, brightness: 0.9 },
        progressBarBackgroundHexColor: '#e1e3e5',
        // Design settings
        backgroundColor: { hue: 0, saturation: 0, brightness: 0.9 },
        hexColor: '#ffffff',
        borderColor: { hue: 0, saturation: 0, brightness: 0.8 },
        cardBorderRadius: 0,
        cardBorderSize: 0,
        cardBorderColor: '#333333',
        borderHexColor: '#cccccc',
        insideTop: 10,
        insideBottom: 10,
        outsideTop: 0,
        outsideBottom: 0,
        messageSize: 16,
        messageColor: { hue: 0, saturation: 0, brightness: 0.13 },
        messageHexColor: '#202223',
        // Placement settings
        displayPosition: 'after-price-before-quantity',
        displayPages: 'product-only',
    };

    // Form data (editable copy)
    const [formData, setFormData] = useState(defaultFormData);
    const [isDirty, setIsDirty] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        title: '',
        messageTemplate: '',
        stockLimit: '',
        selectedVariants: '',
    });

    // Banner states
    const [successMessage, setSuccessMessage] = useState('');
    const [bannerErrors, setBannerErrors] = useState([]);

    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    
    // Tab navigation state
    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => {
        setActiveTab(selectedTabIndex);
    }, []);

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const currentStock = 8;

    const handleButtonClick = useCallback((index) => {
        if (activeButtonIndex === index) return;
        setActiveButtonIndex(index);
    }, [activeButtonIndex]);

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));
    };

    // Validation helpers
    const validateForm = () => {
        const nextErrors = { title: '', messageTemplate: '', stockLimit: '', selectedVariants: '' };
        let valid = true;

        // Title required
        if (!formData.title || !formData.title.trim()) {
            nextErrors.title = "Title can't be blank";
            valid = false;
        }

        // Message template required
        if (!formData.messageTemplate || !formData.messageTemplate.trim()) {
            nextErrors.messageTemplate = "Message template can't be blank";
            valid = false;
        }

        // Stock limit validation
        const stock = Number(formData.stockLimit);
        if (!Number.isInteger(stock) || stock < 1) {
            nextErrors.stockLimit = 'Stock limit must be a positive integer';
            valid = false;
        }

        // Selected variants validation
        if (!formData.selectedVariants || formData.selectedVariants.length === 0) {
            nextErrors.selectedVariants = 'Please select at least one product variant';
            valid = false;
        }

        setErrors(nextErrors);
        
        // Build banner errors list from field errors
        const bannerErrorList = [
            ...(nextErrors.title ? [nextErrors.title] : []),
            ...(nextErrors.messageTemplate ? [nextErrors.messageTemplate] : []),
            ...(nextErrors.stockLimit ? [nextErrors.stockLimit] : []),
            ...(nextErrors.selectedVariants ? [nextErrors.selectedVariants] : []),
        ];
        setBannerErrors(bannerErrorList);
        
        return valid;
    };

    const handleVariantSelect = (selection) => {
        const variants = selection.flatMap(product =>
            product.variants.map(variant => ({
                ...variant,
                productHandle: product.handle,
                productId: product.id
            }))
        );
        console.log("🟢 Selected Variants:", variants);
        setFormData(prev => ({ ...prev, selectedVariants: selection }));
        setErrors(prev => ({ ...prev, selectedVariants: '' }));
        setBannerErrors([]);
        setSuccessMessage('');
    };

    const handleProgressbar = useCallback(
        (newChecked) => setFormData(prev => ({ ...prev, showProgressBar: newChecked })),
        [],
    );

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

    // Handle progress bar color change
    const handleProgressBarColorChange = (color, hexColor) => {
        setFormData(prev => ({ 
            ...prev, 
            barColor: color,
            barHexColor: hexColor
        }));
    };

    // Handle progress bar background color change
    const handleProgressBarBackgroundColorChange = (color, hexColor) => {
        setFormData(prev => ({ 
            ...prev, 
            progressBarBackgroundColor: color,
            progressBarBackgroundHexColor: hexColor
        }));
    };

    // Helper function to render stock message
    const renderStockMessage = () => {
        if (currentStock >= formData.stockLimit) return null;
        
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
                <BlockStack gap="200">
                    {/* Progress bar above message */}
                    {formData.showProgressBar && formData.progressBarPosition === 'above' && (
                        <Box paddingBlockEnd="200">
                            <div style={{
                                width: `${formData.progressBarWidth}%`,
                                height: `${formData.progressBarHeight}px`,
                                backgroundColor: formData.progressBarBackgroundHexColor || '#e1e3e5',
                                borderRadius: formData.progressBarStyle === 'rounded' ? `${formData.progressBarHeight / 2}px` : '0px',
                                overflow: 'hidden',
                                margin: '0 auto'
                            }}>
                                <div style={{
                                    width: `${Math.round((currentStock / formData.stockLimit) * 100)}%`,
                                    height: '100%',
                                    backgroundColor: formData.barHexColor || '#00ff00',
                                    transition: 'width 0.3s ease-in-out',
                                    borderRadius: formData.progressBarStyle === 'rounded' ? `${formData.progressBarHeight / 2}px` : '0px'
                                }} />
                            </div>
                        </Box>
                    )}

                    <div 
                        style={{ 
                            color: formData.messageHexColor || "#202223", 
                            fontSize: `${formData.messageSize || 16}px`, 
                            textAlign: "center",
                            margin: 0,
                            fontWeight: "normal",
                            lineHeight: "1.4"
                        }}
                        title={`Size: ${formData.messageSize}px, Color: ${formData.messageHexColor}`}
                    >
                        {formData.messageTemplate.replace('{{stock}}', currentStock)}
                    </div>

                    {/* Progress bar below message */}
                    {formData.showProgressBar && formData.progressBarPosition === 'below' && (
                        <Box paddingBlockStart="200">
                            <div style={{
                                width: `${formData.progressBarWidth}%`,
                                height: `${formData.progressBarHeight}px`,
                                backgroundColor: formData.progressBarBackgroundHexColor || '#e1e3e5',
                                borderRadius: formData.progressBarStyle === 'rounded' ? `${formData.progressBarHeight / 2}px` : '0px',
                                overflow: 'hidden',
                                margin: '0 auto'
                            }}>
                                <div style={{
                                    width: `${Math.round((currentStock / formData.stockLimit) * 100)}%`,
                                    height: '100%',
                                    backgroundColor: formData.barHexColor || '#00ff00',
                                    transition: 'width 0.3s ease-in-out',
                                    borderRadius: formData.progressBarStyle === 'rounded' ? `${formData.progressBarHeight / 2}px` : '0px'
                                }} />
                            </div>
                        </Box>
                    )}
                </BlockStack>
            </Box>
        );
    };

    // Fetch existing data for editing
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchWithAuth(`/api/stock-countdown/edit/${id}`);
                const result = await res.json();
                if (res.ok && result.success) {
                    const stockCountdown = result.data;
                    
                    // Convert nested structure to flattened structure
                    const editData = {
                        title: stockCountdown.title || '',
                        isPublished: Boolean(stockCountdown.is_published),
                        stockLimit: stockCountdown.stock_limit || 10,
                        messageTemplate: stockCountdown.message_template || 'Only {{stock}} left.',
                        selectedVariants: stockCountdown.selected_variants || [],
                        showProgressBar: Boolean(stockCountdown.show_progress_bar),
                        barColor: stockCountdown.bar_color || { hue: 120, saturation: 1, brightness: 1 },
                        barHexColor: stockCountdown.bar_hex_color || '#00ff00',
                        // Progress bar settings
                        progressBarStyle: stockCountdown.progress_bar_style || 'rounded',
                        progressBarPosition: stockCountdown.progress_bar_position || 'below',
                        progressBarWidth: stockCountdown.progress_bar_width || 100,
                        progressBarHeight: stockCountdown.progress_bar_height || 8,
                        progressBarBackgroundColor: stockCountdown.progress_bar_background_color || { hue: 0, saturation: 0, brightness: 0.9 },
                        progressBarBackgroundHexColor: stockCountdown.progress_bar_background_hex_color || '#e1e3e5',
                        // Design settings
                        backgroundColor: stockCountdown.design_config?.backgroundColor || { hue: 0, saturation: 0, brightness: 0.9 },
                        hexColor: stockCountdown.design_config?.hexColor || '#ffffff',
                        borderColor: stockCountdown.design_config?.borderColor || { hue: 0, saturation: 0, brightness: 0.8 },
                        cardBorderRadius: stockCountdown.design_config?.cardBorderRadius ?? 0,
                        cardBorderSize: stockCountdown.design_config?.cardBorderSize ?? 0,
                        cardBorderColor: stockCountdown.design_config?.cardBorderColor || '#333333',
                        borderHexColor: stockCountdown.design_config?.borderHexColor || '#cccccc',
                        insideTop: stockCountdown.design_config?.insideTop || 10,
                        insideBottom: stockCountdown.design_config?.insideBottom || 10,
                        outsideTop: stockCountdown.design_config?.outsideTop || 0,
                        outsideBottom: stockCountdown.design_config?.outsideBottom || 0,
                        messageSize: stockCountdown.design_config?.messageSize || 16,
                        messageColor: stockCountdown.design_config?.messageColor || { hue: 0, saturation: 0, brightness: 0.13 },
                        messageHexColor: stockCountdown.design_config?.messageHexColor || '#202223',
                        // Placement settings
                        displayPosition: stockCountdown.placement_config?.display_position || 'after-price-before-quantity',
                        displayPages: stockCountdown.placement_config?.display_pages || 'product-only',
                    };
                    setSavedData(editData);
                    setFormData(editData);
                }
            } catch (err) {
                console.error('❌ Failed to load Stock countdown:', err);
            }
        };
        fetchData();
    }, [id]);

    // Detect unsaved changes
    useEffect(() => {
        if (savedData) {
            setIsDirty(JSON.stringify(formData) !== JSON.stringify(savedData));
        }
    }, [formData, savedData]);

    const handleUpdate = async () => {
        if (!validateForm()) {
            toast.show('Please fix the form errors.', { duration: 4000, isError: true });
            return;
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
            messageSize: formData.messageSize,
            messageColor: formData.messageColor,
            messageHexColor: formData.messageHexColor,
        };

        // Prepare placement configuration
        const placementConfig = {
            display_position: formData.displayPosition,
            display_pages: formData.displayPages
        };

        const payload = {
            title: formData.title?.trim(),
            is_published: formData.isPublished,
            stock_limit: formData.stockLimit,
            message_template: formData.messageTemplate?.trim(),
            selected_variants: formData.selectedVariants,
            show_progress_bar: formData.showProgressBar,
            bar_color: formData.barColor,
            bar_hex_color: formData.barHexColor,
            progress_bar_style: formData.progressBarStyle,
            progress_bar_position: formData.progressBarPosition,
            progress_bar_width: formData.progressBarWidth,
            progress_bar_height: formData.progressBarHeight,
            progress_bar_background_color: formData.progressBarBackgroundColor,
            progress_bar_background_hex_color: formData.progressBarBackgroundHexColor,
            design_config: designConfig,
            placement_config: placementConfig,
        };

        try {
            const response = await fetchWithAuth(`/api/stock-countdown/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setBannerErrors([]);
                setSuccessMessage(`${formData.title?.trim() || 'Stock Countdown'} was updated successfully.`);
                setSavedData({...formData});
                setIsDirty(false);
                toast.show('Stock Countdown Updated', { duration: 3000 });
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => navigate("/"), 2000);
            } else {
                const msg = (data && (data.message || data.error)) || 'Failed to update. Please try again.';
                setBannerErrors([msg]);
                setSuccessMessage('');
                toast.show('Failed to update. Please try again.', { duration: 4000, isError: true });
            }
        } catch (error) {
            console.error("Error updating form", error);
            toast.show('Unexpected error. Please try again.', { duration: 4000, isError: true });
        }
    };

    const handleDiscard = () => {
        if (savedData) {
            setFormData(savedData);
            setIsDirty(false);
            setErrors({ title: '', messageTemplate: '', stockLimit: '', selectedVariants: '' });
            setBannerErrors([]);
            setSuccessMessage('');
        }
    };

    return (
        <div style={{ height: '100vh' }}>
            <Frame>
                {isDirty && (
                    <ContextualSaveBar
                        message="Unsaved changes"
                        saveAction={{ onAction: handleUpdate }}
                        discardAction={{ onAction: handleDiscard }}
                    />
                )}

                <Page
                    backAction={{ content: 'Settings', onAction: () => navigate("/") }}
                    title="Edit Stock Countdown"
                    fullWidth
                >
                    {bannerErrors?.length > 0 && (
                        <Box paddingBlockEnd="400">
                            <Layout>
                                <Layout.Section>
                                    <Banner tone="critical" title={`There ${bannerErrors.length === 1 ? 'is 1 error' : `are ${bannerErrors.length} errors`} with this Stock Countdown:`}>
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
                                        <Text>The Stock Countdown is <b>{formData.isPublished ? 'published' : 'unpublished'}</b></Text>
                                        <Button variant="primary" onClick={handleToggle}>
                                            {formData.isPublished ? 'Unpublish' : 'Publish'}
                                        </Button>
                                    </InlineStack>
                                </Card>
                                <Divider />

                                <TextField 
                                    label="Stock Countdown Title" 
                                    value={formData.title} 
                                    onChange={(val) => {
                                        setFormData({...formData, title: val});
                                        setErrors(prev => ({ ...prev, title: '' }));
                                        setBannerErrors([]);
                                        setSuccessMessage('');
                                    }} 
                                    autoComplete="off" 
                                    error={errors.title}
                                    placeholder="e.g., Stock Alert"
                                />

                                <Divider />

                                <BlockStack gap="300">
                                    <Text variant="headingMd" as="h3">Stock inventory number appears when inventory of the product is lower than</Text>
                                    <InventorySelector 
                                        value={formData.stockLimit} 
                                        onChange={(val) => {
                                            setFormData({...formData, stockLimit: val});
                                            setErrors(prev => ({ ...prev, stockLimit: '' }));
                                            setBannerErrors([]);
                                            setSuccessMessage('');
                                        }} 
                                        error={errors.stockLimit}
                                    />
                                </BlockStack>

                                <Divider />

                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">Stock Message Template</Text>
                                    <MessageInput
                                        value={formData.messageTemplate}
                                        onChange={(val) => {
                                            setFormData({...formData, messageTemplate: val});
                                            setErrors(prev => ({ ...prev, messageTemplate: '' }));
                                            setBannerErrors([]);
                                            setSuccessMessage('');
                                        }}
                                        placeholder="e.g., Only {{stock}} left"
                                        error={errors.messageTemplate}
                                    />
                                </BlockStack>

                                <Divider />

                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">Select Product/Variant</Text>
                                    <VariantPicker
                                      selected={formData.selectedVariants}
                                      onSelect={(variants) => {
                                        setFormData({ ...formData, selectedVariants: variants });
                                        setErrors(prev => ({ ...prev, selectedVariants: '' }));
                                        setBannerErrors([]);
                                        setSuccessMessage('');
                                      }}
                                      error={errors.selectedVariants}
                                    />
                                </BlockStack>

                                <Divider />

                                <BlockStack gap="200">
                                    <InlineStack gap="200" align="start">
                                        <Checkbox
                                            checked={formData.showProgressBar}
                                            onChange={handleProgressbar}
                                        />
                                        <Text variant="bodyMd">Display progress bar</Text>
                                    </InlineStack>

                                    {formData.showProgressBar && (
                                        <BlockStack gap="100">
                                            <ColorPickerInput
                                                label="Progress Bar Color"
                                                value={formData.barHexColor}
                                                onChange={handleProgressBarColorChange}
                                                placeholder="#00ff00"
                                                defaultColor={formData.barColor}
                                            />
                                        </BlockStack>
                                    )}
                                </BlockStack>

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
                                                {/* Stock message at top */}
                                                {formData.displayPosition === 'top' && renderStockMessage()}
                                                
                                                {/* Stock message before title */}
                                                {formData.displayPosition === 'before-title' && renderStockMessage()}
                                                
                                                <Text variant="headingLg" as="h2">Title: Classic Black T-Shirt</Text>
                                                
                                                {/* Stock message after title and before price */}
                                                {formData.displayPosition === 'after-title-before-price' && renderStockMessage()}
                                                
                                                <Text variant="headingLg" fontWeight="bold">Price: $29.99</Text>
                                                
                                                {/* Stock message after price and before quantity */}
                                                {formData.displayPosition === 'after-price-before-quantity' && renderStockMessage()}
                                                
                                                <InlineStack align="left" gap="200">
                                                    <Button size="Large" variant="tertiary" tone="critical" onClick={decreaseQuantity}>–</Button>
                                                    <Text variant="bodyLg" fontWeight="semibold" alignment="center">{quantity}</Text>
                                                    <Button size="Large" variant="tertiary" tone="success" onClick={increaseQuantity}>+</Button>
                                                </InlineStack>

                                                
                                                {/* Stock message after quantity and before add to cart */}
                                                {formData.displayPosition === 'after-quantity-before-cart' && renderStockMessage()}
                                                
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
                                                
                                                {/* Stock message after add to cart */}
                                                {formData.displayPosition === 'after-cart' && renderStockMessage()}
                                                
                                                {/* Stock message at bottom */}
                                                {formData.displayPosition === 'bottom' && renderStockMessage()}
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
                                    
                                    <Text as="h4" variant='headingSm' style={{ marginTop: '16px', marginBottom: '8px' }}>Message Size and Color</Text>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <TextField
                                            label="Message Size"
                                            type="number"
                                            value={formData.messageSize}
                                            onChange={(value) => {
                                                const newSize = Math.max(1, parseInt(value) || 1);
                                                setFormData(prev => ({ ...prev, messageSize: newSize }));
                                            }}
                                        />
                                        <ColorPickerInput
                                            label="Message Color"
                                            value={formData.messageHexColor}
                                            onChange={(color, hexColor) => {
                                                setFormData(prev => ({ ...prev, messageColor: color, messageHexColor: hexColor }));
                                            }}
                                            placeholder="#202223"
                                            defaultColor={formData.messageColor}
                                        />
                                    </div>
                                    <Divider />
                                    
                                    <Text as="h3" variant='headingMd'>Progress Bar Settings</Text>
                                    
                                    <Select
                                        label="Style"
                                        value={formData.progressBarStyle}
                                        onChange={(value) => setFormData(prev => ({ ...prev, progressBarStyle: value }))}
                                        options={[
                                            { label: 'Rounded', value: 'rounded' },
                                            { label: 'Flat', value: 'flat' }
                                        ]}
                                    />
                                    
                                    <Select
                                        label="Progress Bar Position"
                                        value={formData.progressBarPosition}
                                        onChange={(value) => setFormData(prev => ({ ...prev, progressBarPosition: value }))}
                                        options={[
                                            { label: 'Above Message', value: 'above' },
                                            { label: 'Below Message', value: 'below' }
                                        ]}
                                    />
                                    
                                    <RangeSlider
                                        label="Progress Bar Width"
                                        value={formData.progressBarWidth}
                                        min={5}
                                        max={100}
                                        step={5}
                                        onChange={(value) => setFormData(prev => ({ ...prev, progressBarWidth: value }))}
                                    />
                                    
                                    <TextField
                                        label="Progress Bar Width"
                                        type="number"
                                        value={formData.progressBarWidth}
                                        onChange={(value) => setFormData(prev => ({ ...prev, progressBarWidth: Math.max(5, Math.min(100, parseInt(value) || 5)) }))}
                                        suffix="%"
                                    />
                                    
                                    <RangeSlider
                                        label="Progress Bar Height"
                                        value={formData.progressBarHeight}
                                        min={5}
                                        max={30}
                                        step={1}
                                        onChange={(value) => setFormData(prev => ({ ...prev, progressBarHeight: value }))}
                                    />
                                    
                                    <TextField
                                        label="Progress Bar Height"
                                        type="number"
                                        value={formData.progressBarHeight}
                                        onChange={(value) => setFormData(prev => ({ ...prev, progressBarHeight: Math.max(5, Math.min(30, parseInt(value) || 5)) }))}
                                        suffix="px"
                                    />
                                    
                                    <ColorPickerInput
                                        label="Progress Bar Background Color"
                                        value={formData.progressBarBackgroundHexColor}
                                        onChange={handleProgressBarBackgroundColorChange}
                                        placeholder="#e1e3e5"
                                        defaultColor={formData.progressBarBackgroundColor}
                                    />
                                    
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
                                                {/* Stock message at top */}
                                                {formData.displayPosition === 'top' && renderStockMessage()}
                                                
                                                {/* Stock message before title */}
                                                {formData.displayPosition === 'before-title' && renderStockMessage()}
                                                
                                                <Text variant="headingLg" as="h2">Title: Classic Black T-Shirt</Text>
                                                
                                                {/* Stock message after title and before price */}
                                                {formData.displayPosition === 'after-title-before-price' && renderStockMessage()}
                                                
                                                <Text variant="headingLg" fontWeight="bold">Price: $29.99</Text>
                                                
                                                {/* Stock message after price and before quantity */}
                                                {formData.displayPosition === 'after-price-before-quantity' && renderStockMessage()}
                                                
                                                <InlineStack align="left" gap="200">
                                                    <Button size="Large" variant="tertiary" tone="critical" onClick={decreaseQuantity}>–</Button>
                                                    <Text variant="bodyLg" fontWeight="semibold" alignment="center">{quantity}</Text>
                                                    <Button size="Large" variant="tertiary" tone="success" onClick={increaseQuantity}>+</Button>
                                                </InlineStack>

                                                
                                                {/* Stock message after quantity and before add to cart */}
                                                {formData.displayPosition === 'after-quantity-before-cart' && renderStockMessage()}
                                                
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
                                                
                                                {/* Stock message after add to cart */}
                                                {formData.displayPosition === 'after-cart' && renderStockMessage()}
                                                
                                                {/* Stock message at bottom */}
                                                {formData.displayPosition === 'bottom' && renderStockMessage()}
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
                                        label="Stock Message Position"
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
                                                {/* Stock message at top */}
                                                {formData.displayPosition === 'top' && renderStockMessage()}
                                                
                                                {/* Stock message before title */}
                                                {formData.displayPosition === 'before-title' && renderStockMessage()}
                                                
                                                <Text variant="headingLg" as="h2">Title: Classic Black T-Shirt</Text>
                                                
                                                {/* Stock message after title and before price */}
                                                {formData.displayPosition === 'after-title-before-price' && renderStockMessage()}
                                                
                                                <Text variant="headingLg" fontWeight="bold">Price: $29.99</Text>
                                                
                                                {/* Stock message after price and before quantity */}
                                                {formData.displayPosition === 'after-price-before-quantity' && renderStockMessage()}
                                                
                                                <InlineStack align="left" gap="200">
                                                    <Button size="Large" variant="tertiary" tone="critical" onClick={decreaseQuantity}>–</Button>
                                                    <Text variant="bodyLg" fontWeight="semibold" alignment="center">{quantity}</Text>
                                                    <Button size="Large" variant="tertiary" tone="success" onClick={increaseQuantity}>+</Button>
                                                </InlineStack>

                                                
                                                {/* Stock message after quantity and before add to cart */}
                                                {formData.displayPosition === 'after-quantity-before-cart' && renderStockMessage()}
                                                
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
                                                
                                                {/* Stock message after add to cart */}
                                                {formData.displayPosition === 'after-cart' && renderStockMessage()}
                                                
                                                {/* Stock message at bottom */}
                                                {formData.displayPosition === 'bottom' && renderStockMessage()}
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
        </div>
    );
}


