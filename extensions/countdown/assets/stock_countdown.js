console.log("🚀 Stock Countdown Script is running");

// ⚠️ UPDATE THIS URL when you run 'shopify app dev' and get a new tunnel URL
const HOST_API_URL = 'https://qualify-each-compute-establishment.trycloudflare.com/api';
console.log("🌐 Using API URL:", HOST_API_URL);

document.addEventListener("DOMContentLoaded", () => {
  // ✅ শুধু প্রোডাক্ট পেজে চালানো
  if (!window.location.pathname.startsWith('/products/')) {
    console.log("⏩ Not a product page. Skipping stock countdown.");
    return;
  }

  const wrappers = document.querySelectorAll(".stock-countdown-wrapper");

  wrappers.forEach(wrapper => {
    const stockId = wrapper.getAttribute("data-stock-id");
    const blockId = wrapper.getAttribute("data-block-id");
    const productHandle = wrapper.getAttribute("data-product-handle");
    const shopDomain = wrapper.getAttribute("data-shop-domain"); // Get shop domain from Liquid

    console.log("🎯 Stock ID:", stockId);
    console.log("🎯 Product Handle:", productHandle);
    console.log("🏪 Shop Domain:", shopDomain);

    if (!stockId || !productHandle) {
      console.warn("⚠️ Missing stockId or productHandle");
      return;
    }

    if (!shopDomain) {
      console.warn("⚠️ Missing shop domain. The countdown may not work correctly.");
    }

    // Get DOM elements
    const messageElem = document.getElementById(`stock-message-${blockId}`);
    const progressContainerElem = document.getElementById(`stock-progress-${blockId}`);
    const progressBarElem = document.getElementById(`stock-progress-bar-${blockId}`);
    const progressFillElem = document.getElementById(`stock-progress-fill-${blockId}`);
    const containerElem = document.getElementById(`stock-container-${blockId}`);
    const loadingElem = document.getElementById(`stock-loading-${blockId}`);

    // Check if stockId is provided
    if (!stockId) {
      console.warn("❌ No stockId provided in section settings");
      // Keep showing "Please configure stockId" message
      return;
    }

    // Show loading message
    if (loadingElem) {
      loadingElem.innerHTML = '<div class="stock-loading-text">Loading Stock countdown...</div>';
    }

    // Step 1: Fetch product JSON to get product ID
    fetch(`/products/${productHandle}.json`)
      .then(res => res.json())
      .then(productData => {
        const productId = productData.product.id;
        console.log("🆔 Product ID fetched:", productId);

        // Step 2: Fetch stock countdown configuration from stock_countdowns table
    const apiUrl = `${HOST_API_URL}/stock-countdown/config/${stockId}`;
    console.log("🌐 API URL:", apiUrl);
    console.log("🆔 Stock ID being requested:", stockId);
    
      return fetch(apiUrl)
      .then(res => {
        console.log("✅ Fetch successful! Response received");
        console.log("📡 Response status:", res.status);
        console.log("📡 Response ok:", res.ok);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return res.json();
      })
      .then(configData => {
        console.log("✅ JSON parsed successfully");
        console.log("📦 Full Config Data from backend:", configData);
            return { configData, productId };
          });
      })
      .then(({ configData, productId }) => {
        if (!configData || !configData.title) {
          console.warn("⚠️ Incomplete config data");
          // Show error message
          if (loadingElem) {
            loadingElem.innerHTML = '<div class="stock-no-config-text">Stock countdown not found. Please check your Stock ID.</div>';
          }
          return;
        }

        const config = configData;
        
        // Debug the full configuration object
        console.log("🔍 Full Configuration Object:", config);
        console.log("🔍 Available config keys:", Object.keys(config));
        
        // Check if stock countdown should display on current page type
        const currentPageType = detectPageType();
        const displayPages = config.placement_config?.display_pages || 'product-only';
        
        console.log("📄 Current Page Type:", currentPageType);
        console.log("⚙️ Display Pages Setting:", displayPages);
        
        if (!shouldDisplayOnPage(currentPageType, displayPages)) {
          console.log("🚫 Stock countdown hidden - not configured for this page type");
          // Hide the entire wrapper
          if (wrapper) {
            wrapper.style.display = 'none';
          }
          return;
        }
        
        console.log("✅ Stock countdown should display on this page");
        
        // Check if current product matches selected variants
        if (!isProductMatching(config.selected_variants)) {
          console.log("🚫 Stock countdown hidden - product doesn't match selected variants");
          if (wrapper) {
            wrapper.style.display = 'none';
          }
          return;
        }
        
        console.log("✅ Product matches selected variants");
        
        // Get selected variants and stock limit
        const stockLimit = parseInt(config.stock_limit, 10);
        const msgTemplate = config.message_template || '';
        // Use shop domain from Liquid (current store) instead of config (which may be from different store)
        const shop_domain = shopDomain || config.shop_domain;
        const selectedVariant = config.selected_variants;
        const selectedVariantsData = config.selected_variants || [];

        let allowedVariantIds = [];

        // Extract variant IDs from selected products
        selectedVariantsData.forEach(productObj => {
          if (productObj.variants && Array.isArray(productObj.variants)) {
            productObj.variants.forEach(v => {
              const numericId = v.id.split("/").pop(); // Shopify variant ID numeric part
              allowedVariantIds.push(numericId);
            });
          }
        });

        console.log("Allowed Variant IDs:", allowedVariantIds);
        console.log("Stock Limit ", stockLimit);
        console.log("Message ", msgTemplate);
        console.log("shop domain ", shop_domain);
        console.log("Fetch Data from backend: ", selectedVariant);

        // Step 3: Fetch inventory
        const inventoryUrl = `${HOST_API_URL}/apps/secure_inventory?shop=${encodeURIComponent(shop_domain)}&productId=${productId}`;
        console.log("🔗 Inventory URL:", inventoryUrl);
        return fetch(inventoryUrl)
          .then(res => {
            console.log("📡 Inventory response status:", res.status, "ok:", res.ok);
            return res
              .json()
              .then(json => ({ ok: res.ok, status: res.status, json }))
              .catch(parseErr => {
                console.error("❌ Failed to parse inventory JSON:", parseErr);
                throw new Error(`Inventory JSON parse error (status ${res.status})`);
              });
          })
          .then(({ ok, status, json: invData }) => {
            console.log("📦 Raw inventory payload:", invData);
            
            // Check for authentication errors
            if (status === 401 || (invData.error && invData.error.includes('Authentication failed'))) {
              console.error("❌ Authentication error:", invData.error || invData.details);
              if (loadingElem) {
                loadingElem.innerHTML = `
                  <div class="stock-no-config-text" style="color: #d62828; padding: 20px; text-align: center;">
                    <strong>⚠️ Authentication Required</strong><br>
                    ${invData.error || 'Please reinstall the app to refresh access token.'}<br>
                    <small style="color: #666; margin-top: 8px; display: block;">
                      Contact your store administrator to reinstall the app.
                    </small>
                  </div>
                `;
              }
              // Hide the wrapper to avoid showing broken state
              if (wrapper) {
                wrapper.style.display = 'none';
              }
              return;
            }
            
            // Check for other errors
            if (!ok || invData.error) {
              console.error("❌ Inventory fetch error:", invData.error || invData);
              if (loadingElem) {
                loadingElem.innerHTML = `
                  <div class="stock-no-config-text" style="color: #d62828; padding: 20px; text-align: center;">
                    <strong>⚠️ Error Loading Inventory</strong><br>
                    ${invData.error || 'Failed to fetch inventory data'}<br>
                    <small style="color: #666; margin-top: 8px; display: block;">
                      Please check your app configuration.
                    </small>
                  </div>
                `;
              }
              return;
            }
            
            const product = invData.data?.product || invData.product;
            if (!product || !product.variants) {
              console.warn("⚠️ No product or variants in stock data. Shape hint:", {
                hasDataKey: !!invData.data,
                keys: Object.keys(invData || {})
              });
              if (loadingElem) {
                loadingElem.innerHTML = '<div class="stock-no-config-text">No inventory data available for this product.</div>';
              }
              return;
            }

            // Variants array
            const variants = product.variants?.edges || product.variants || [];
            console.log("🔍 Variants received:", variants);

            // Initialize variant selection functionality
            initializeVariantSelection(variants, stockLimit, msgTemplate, allowedVariantIds, blockId, wrapper, config);
          })
          .catch(err => {
            console.error("❌ Inventory fetch failed:", err);
            if (loadingElem) {
              loadingElem.innerHTML = `
                <div class="stock-no-config-text" style="color: #d62828; padding: 20px; text-align: center;">
                  <strong>⚠️ Network Error</strong><br>
                  Failed to load inventory data. Please try again later.<br>
                  <small style="color: #666; margin-top: 8px; display: block;">
                    ${err.message}
                  </small>
                </div>
              `;
            }
            throw err;
          });
      })
      .catch(err => {
        console.error("❌ Stock Countdown Script error:", err);
        if (loadingElem) {
          loadingElem.innerHTML = `<div class="stock-no-config-text">Error loading stock countdown: ${err.message}<br>Check console for details.</div>`;
        }
      });
  });
});

function initializeVariantSelection(variants, stockLimit, msgTemplate, allowedVariantIds, blockId, wrapper, config) {
  console.log("=== initializeVariantSelection CALLED ===");
  
  // Get DOM elements
  const messageElem = document.getElementById(`stock-message-${blockId}`);
  const progressContainerElem = document.getElementById(`stock-progress-${blockId}`);
  const progressBarElem = document.getElementById(`stock-progress-bar-${blockId}`);
  const progressFillElem = document.getElementById(`stock-progress-fill-${blockId}`);
  const containerElem = document.getElementById(`stock-container-${blockId}`);
  const loadingElem = document.getElementById(`stock-loading-${blockId}`);
  const variantsContainer = document.getElementById(`stock-variants-${blockId}`);

  // Debug element selection
  console.log("🔍 DOM Elements found:", {
    messageElem: !!messageElem,
    progressContainerElem: !!progressContainerElem,
    progressBarElem: !!progressBarElem,
    progressFillElem: !!progressFillElem,
    containerElem: !!containerElem,
    loadingElem: !!loadingElem,
    variantsContainer: !!variantsContainer
  });

  function updateStockMessage(activeVariantId, variantsData, stockLimit, msgTemplate, allowedVariantIds) {
    console.log("=== updateStockMessage CALLED ===");
    console.log("activeVariantId:", activeVariantId);
    console.log("variantsData:", variantsData);
    console.log("stockLimit:", stockLimit);
    console.log("msgTemplate:", msgTemplate);
    console.log("allowedVariantIds:", allowedVariantIds);

    // Hide all variant rows initially
    document.querySelectorAll('.variant-row').forEach(row => row.style.display = 'none');

    // If activeVariantId is not in allowedVariantIds, return
    if (!allowedVariantIds.includes(activeVariantId)) {
      console.log("This variant Id is not allowed:", activeVariantId);
      return;
    }
    
    // Find the row element for this variant
    const rowElem = document.querySelector(`.variant-row[data-variant-id="${activeVariantId}"]`);
    console.log("Row element: ", rowElem);
    if (rowElem) {
      rowElem.style.display = 'none';
      const stockMsgEl = rowElem.querySelector('.stock-msg');
      if (stockMsgEl) {
        stockMsgEl.textContent = '';
      }
    }

    // Find variant data from inventory
    const variantData = variantsData.find(v => v.node.id.split("/").pop() === activeVariantId);
    const stockQty = variantData ? variantData.node.inventoryQuantity : 0;
    console.log("Variant data: ", variantData);
    console.log("StockQty is: ", stockQty);

    // Show/hide main stock countdown container
    if (stockQty <= stockLimit && stockQty > 0) {
      if (loadingElem) loadingElem.style.display = 'none';
      if (containerElem) containerElem.style.display = 'flex';
      if (variantsContainer) variantsContainer.style.display = 'none';
      
      // Apply design configuration
      applyDesignConfig(config.design_config, wrapper, messageElem, progressBarElem, progressFillElem, containerElem);
      
      // Set stock message
      if (messageElem && msgTemplate) {
        const message = msgTemplate.replace('{{stock}}', stockQty);
        messageElem.textContent = message;
      }
      
        // Show progress bar if enabled and stock is below threshold
        if (config.show_progress_bar && progressContainerElem && stockQty < stockLimit) {
          console.log("🎨 Progress Bar Enabled - Stock below threshold");
          progressContainerElem.style.display = 'flex';
          
          // Handle progress bar position (above or below message)
          const position = config.progress_bar_position || 'below';
          console.log("📍 Progress bar position:", position);
          
          if (position === 'above') {
            // Move progress bar above the message
            const messageElem = document.getElementById(`stock-message-${blockId}`);
            if (messageElem && progressContainerElem) {
              messageElem.parentNode.insertBefore(progressContainerElem, messageElem);
              console.log("⬆️ Progress bar moved above message");
            }
          } else {
            // Progress bar stays below message (default position)
            console.log("⬇️ Progress bar stays below message");
          }
          
          // Debug progress bar configuration
          console.log("🎨 Progress Bar Config:", {
            show_progress_bar: config.show_progress_bar,
            bar_hex_color: config.bar_hex_color,
            progress_bar_background_hex_color: config.progress_bar_background_hex_color,
            progress_bar_style: config.progress_bar_style,
            progress_bar_width: config.progress_bar_width,
            progress_bar_height: config.progress_bar_height
          });
          
          // Check if colors are different
          const fillColor = config.bar_hex_color || '#00ff00';
          const bgColor = config.progress_bar_background_hex_color || '#e1e3e5';
          console.log("🔍 Color Comparison:", {
            fillColor: fillColor,
            backgroundColor: bgColor,
            areDifferent: fillColor !== bgColor
          });
          
          // Calculate progress percentage
          const progressPercentage = Math.round((stockQty / stockLimit) * 100);
          console.log("📊 Progress Calculation:", {
            stockQty: stockQty,
            stockLimit: stockLimit,
            percentage: progressPercentage
          });
          
          // Apply progress bar container styling (matches React component)
          if (progressContainerElem) {
            progressContainerElem.style.width = '100%';
            progressContainerElem.style.display = 'flex';
            progressContainerElem.style.justifyContent = 'center';
            progressContainerElem.style.marginTop = '8px';
            console.log("✅ Progress container styled");
          }
        
          // Apply progress bar styling (matches React component exactly)
          if (progressBarElem) {
            // Width (matches React: width: `${formData.progressBarWidth}%`)
            const width = config.progress_bar_width || 100;
            progressBarElem.style.setProperty('width', `${width}%`, 'important');
            console.log("🎨 Progress bar width set to:", width + '%');
            
            // Height (matches React: height: `${formData.progressBarHeight}px`)
            const height = config.progress_bar_height || 8;
            progressBarElem.style.setProperty('height', `${height}px`, 'important');
            console.log("🎨 Progress bar height set to:", height + 'px');
            
            // Background color (matches React: backgroundColor: formData.progressBarBackgroundHexColor)
            const bgColor = config.progress_bar_background_hex_color || '#e1e3e5';
            progressBarElem.style.setProperty('background-color', bgColor, 'important');
            console.log("🎨 Progress bar background color set to:", bgColor);
            
            // Border radius (matches React: borderRadius: formData.progressBarStyle === 'rounded' ? `${formData.progressBarHeight / 2}px` : '0px')
            const borderRadius = config.progress_bar_style === 'rounded' ? height / 2 : 0;
            progressBarElem.style.setProperty('border-radius', `${borderRadius}px`, 'important');
            console.log("🎨 Progress bar border radius set to:", borderRadius + 'px');
            
            // Additional styling (matches React: overflow: 'hidden', margin: '0 auto')
            progressBarElem.style.setProperty('overflow', 'hidden', 'important');
            progressBarElem.style.setProperty('margin', '0 auto', 'important');
            // Ensure the bar participates in layout properly
            progressBarElem.style.setProperty('position', 'relative', 'important');
            progressBarElem.style.setProperty('display', 'block', 'important');
            console.log("✅ Progress bar styled");
          } else {
            console.warn("⚠️ Progress bar element not found!");
          }
          
          // Apply progress fill styling (matches React component exactly)
          if (progressFillElem) {
            console.log("🎯 Progress fill element found:", progressFillElem);
            
            // Width (matches React: width: `${Math.round((currentStock / formData.stockLimit) * 100)}%`)
            progressFillElem.style.setProperty('width', `${progressPercentage}%`, 'important');
            console.log("🎨 Progress fill width set to:", progressPercentage + '%');
            console.log("📊 Progress Logic:", {
              currentStock: stockQty,
              threshold: stockLimit,
              percentage: progressPercentage,
              meaning: `${progressPercentage}% of threshold remaining`
            });
            
            // Height (matches React: height: '100%')
            progressFillElem.style.setProperty('height', '100%', 'important');
            // Ensure the fill is laid out and visible
            progressFillElem.style.setProperty('display', 'block', 'important');
            progressFillElem.style.setProperty('flex', '0 0 auto', 'important');
            progressFillElem.style.setProperty('position', 'relative', 'important');
            
            // Fill color (matches React: backgroundColor: formData.barHexColor)
            const fillColor = config.bar_hex_color || '#00ff00';
            console.log("🎨 Setting progress fill color to:", fillColor);
            progressFillElem.style.setProperty('background-color', fillColor, 'important');
            
            // Verify the color was applied
            const appliedColor = window.getComputedStyle(progressFillElem).backgroundColor;
            console.log("✅ Applied color:", appliedColor);
            console.log("🎨 Progress fill color set to:", fillColor);
            
            // Check progress bar background color too
            const progressBarBgColor = window.getComputedStyle(progressBarElem).backgroundColor;
            console.log("🎨 Progress bar background color:", progressBarBgColor);
            
            // Defer dimension check until after paint
            requestAnimationFrame(() => {
              const rect = progressFillElem.getBoundingClientRect();
              console.log("📏 Progress fill dimensions (after paint):", {
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
              });
            });
            
            // Debug styling removed - progress bar should now show correct colors
            console.log("✅ Progress fill styling complete - no debug borders");
            
            // Border radius (matches React: borderRadius: formData.progressBarStyle === 'rounded' ? `${formData.progressBarHeight / 2}px` : '0px')
            const height = config.progress_bar_height || 8;
            const borderRadius = config.progress_bar_style === 'rounded' ? height / 2 : 0;
            progressFillElem.style.setProperty('border-radius', `${borderRadius}px`, 'important');
            console.log("🎨 Progress fill border radius set to:", borderRadius + 'px');
            
            // Transition (matches React: transition: 'width 0.3s ease-in-out')
            progressFillElem.style.setProperty('transition', 'width 0.3s ease-in-out', 'important');
            console.log("✅ Progress fill styled");
            
            // Force reflow to ensure styles are applied
            progressFillElem.offsetHeight;
            
          } else {
            console.warn("⚠️ Progress fill element not found!");
          }
        } else {
          console.log("🚫 Progress bar disabled or container not found");
        }
    } else {
      // Hide the entire wrapper if inventory is above limit
      if (wrapper) {
        wrapper.style.display = 'none';
      }
    }
  }

  const variantRadios = document.querySelectorAll("fieldset.product-form__input input[type='radio']");
  const variantRows = document.querySelectorAll(".variant-row");
  console.log("Variant Rows value: ", variantRows);

  // Create mapping from variant names to variant IDs
  let valueToVariantIdMap = {};
  variantRows.forEach(row => {
    let titleEl = row.querySelector(".variant-title");
    let variantName = titleEl ? titleEl.textContent.trim().toLowerCase() : null;

    if (variantName) {
      valueToVariantIdMap[variantName] = row.dataset.variantId;
    }
  });
  console.log("Value -> VariantId Map:", valueToVariantIdMap);

  // Add event listeners for variant selection
  variantRadios.forEach(radio => {
    radio.addEventListener("change", (event) => {
      let selectedValue = event.target.value.trim().toLowerCase();
      let activeVariantId = valueToVariantIdMap[selectedValue];

      if (activeVariantId) {
        console.log("✅ Active Variant ID:", activeVariantId);

        // Highlight active row
        variantRows.forEach(row => {
          row.classList.toggle("active", row.dataset.variantId === activeVariantId);
        });

        // Update Stock message
        updateStockMessage(activeVariantId, variants, stockLimit, msgTemplate, allowedVariantIds);
      } else {
        console.warn("❌ No Variant ID Match:", selectedValue);
      }
    });
  });

  // Initialize with first variant on page load
  if (!document.querySelector('.variant-row.active') && variantRows.length > 0) {
    const firstRow = variantRows[0];
    firstRow.classList.add('active');
    const activeVariantId = firstRow.dataset.variantId;
    console.log("Initial Active Variant ID:", activeVariantId);
    updateStockMessage(activeVariantId, variants, stockLimit, msgTemplate, allowedVariantIds);
  }
}

function applyDesignConfig(designConfig, wrapper, messageElem, progressBarElem, progressFillElem, containerElem) {
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

  // Apply message styling
  if (messageElem) {
    if (designConfig.messageSize !== undefined) {
      messageElem.style.fontSize = `${designConfig.messageSize}px`;
    }
    if (designConfig.messageHexColor) {
      messageElem.style.color = designConfig.messageHexColor;
    }
  }
}


function isProductMatching(selectedVariants) {
  if (!selectedVariants || selectedVariants.length === 0) {
    return true; // If no variants selected, show on all products
  }
  
  // Get current product handle from URL
  const path = window.location.pathname;
  const productMatch = path.match(/\/products\/([^\/]+)/);
  if (!productMatch) {
    return false; // Not on a product page
  }
  
  const currentProductHandle = productMatch[1];
  console.log("🔍 Current Product Handle:", currentProductHandle);
  
  // Check if current product is in selected variants
  for (let product of selectedVariants) {
    if (product.handle === currentProductHandle) {
      console.log("✅ Product matches selected variant:", product.handle);
      return true;
    }
  }
  
  console.log("❌ Product does not match any selected variants");
  return false;
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
 * Check if stock countdown should display on current page based on settings
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
