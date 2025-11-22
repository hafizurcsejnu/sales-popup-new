import { ResourcePicker } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Button, Box, InlineStack, BlockStack, Text, Card, Icon, Divider, Modal, Checkbox, Spinner } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { DeleteIcon, EditIcon, XSmallIcon } from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../../hooks";

const VariantPicker = ({ selected = [], onSelect, error }) => {
  const app = useAppBridge();
  const fetchWithAuth = useAuthenticatedFetch();
  const [selectedItems, setSelectedItems] = useState(selected);
  const [selectedVariants, setSelectedVariants] = useState(selected);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalVariants, setModalVariants] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // parent থেকে selected update হলে local state update
  useEffect(() => {
    console.log("🔵 Parent থেকে আসা selected:", selected);
    if (selected?.length > 0) {
      setSelectedVariants(selected);
    }
  }, [selected]);
  
  useEffect(() => {
    setSelectedItems(selected);
  }, [selected]);

  // --- Image helpers to normalize different shapes from App Bridge selection ---
  const extractImageSrc = (imageLike) => {
    if (!imageLike) return null;
    if (typeof imageLike === 'string') return imageLike;
    return (
      imageLike.src ||
      imageLike.url ||
      imageLike.originalSrc ||
      imageLike.original_url ||
      imageLike.previewImage?.src ||
      imageLike.preview_image?.src ||
      null
    );
  };

  const getProductImage = (product) => {
    return (
      extractImageSrc(product?.image) ||
      extractImageSrc(product?.featuredImage) ||
      extractImageSrc(product?.featuredMedia?.preview?.image) ||
      extractImageSrc(product?.images && product.images[0]) ||
      extractImageSrc(product?.media && product.media[0]?.preview?.image) ||
      extractImageSrc(product?.variants && product.variants[0]?.image) ||
      null
    );
  };

  const getVariantImage = (variant) => extractImageSrc(variant?.image) || null;

  const getTotalVariantsCount = (productLike, fallbackSelectedCount) => {
    return (
      productLike?.totalVariants ||
      productLike?.variantsCount ||
      productLike?.totalVariantsCount ||
      productLike?.total ||
      productLike?.total_count ||
      productLike?.variants?.length ||
      fallbackSelectedCount ||
      0
    );
  };

  const isGid = (id) => typeof id === 'string' && id.startsWith('gid://');
  const normalizeSelectionId = (id) => (isGid(id) ? id : undefined);

  const toProductGid = (id) => {
    if (!id) return undefined;
    if (isGid(id)) return id;
    const str = String(id).trim();
    return str ? `gid://shopify/Product/${str}` : undefined;
  };

  const toVariantGid = (id) => {
    if (!id) return undefined;
    if (isGid(id)) return id;
    const str = String(id).trim();
    return str ? `gid://shopify/ProductVariant/${str}` : undefined;
  };

  const buildInitialSelectionIds = (items) => {
    const ids = [];
    for (const p of items) {
      const variantIds = (p.variants || [])
        .map(v => normalizeSelectionId(v.id) || toVariantGid(v.id))
        .filter(Boolean)
        .map(id => ({ id }));
      if (variantIds.length > 0) {
        ids.push(...variantIds);
      } else {
        const pid = normalizeSelectionId(p.id) || toProductGid(p.id);
        if (pid) ids.push({ id: pid });
      }
    }
    return ids;
  };

  // Grouped by product with nested variants so the picker counts products correctly
  const buildGroupedInitialSelectionIds = (items) => {
    return items.map(p => {
      const pid = normalizeSelectionId(p.id) || toProductGid(p.id);
      const variantIds = (p.variants || [])
        .map(v => normalizeSelectionId(v.id) || toVariantGid(v.id))
        .filter(Boolean)
        .map(id => ({ id }));
      if (variantIds.length > 0) {
        return { id: pid, variants: variantIds };
      }
      return { id: pid };
    }).filter(entry => entry.id);
  };

  // For the main picker: show correct product count by selecting only product IDs
  const buildProductOnlyInitialIds = (items) => {
    const unique = new Map();
    for (const p of items) {
      const pid = normalizeSelectionId(p.id) || toProductGid(p.id);
      if (pid && !unique.has(pid)) unique.set(pid, { id: pid });
    }
    return Array.from(unique.values());
  };

  const formatSelectionProduct = (product) => {
    const selectedVariantObjects = (product.variants || []).map(v => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      inventoryQuantity: v.inventoryQuantity || 0,
    }));

    return {
      id: product.id,
      title: product.title || "Untitled",
      handle: product.handle,
      image: getProductImage(product),
      price: product.variants?.[0]?.price || "0.00",
      totalVariants: getTotalVariantsCount(product, selectedVariantObjects.length),
      variants: selectedVariantObjects,
    };
  };

  const handlePickerSelect = (selection) => {
    // Normalize to array of selected products with only selected variants, but keep totalVariants via best-effort
    const formatted = selection.map(formatSelectionProduct);
    setSelectedItems(formatted);
    if (onSelect) onSelect(formatted);
  };

  const removeProduct = (productId) => {
    const updatedItems = selectedItems.filter(item => item.id !== productId);
    setSelectedItems(updatedItems);
    if(onSelect) onSelect(updatedItems);
  };

  const editProductVariants = async (productId) => {
    const product = selectedItems.find(item => item.id === productId);
    if (!product) return;

    setModalProduct(product);
    setModalLoading(true);
    setIsVariantModalOpen(true);

    try {
      // Expect product.id may be GID; extract numeric if necessary
      const numericId = String(product.id).includes('/Product/') ? String(product.id).split('/').pop() : product.id;
      const res = await fetchWithAuth(`/api/stock-countdown/inventory?productId=${encodeURIComponent(numericId)}`);
      if (!res.ok) throw new Error(`Inventory fetch failed: ${res.status}`);
      const data = await res.json();
      const edges = data?.product?.variants?.edges || [];
      const selectedSet = new Set((product.variants || []).map(v => String(v.id)));

      const allVariants = edges.map(e => {
        const node = e.node || {};
        return {
          id: node.id,
          title: node.title,
          price: node.price ?? node.priceV2?.amount ?? product.price,
          inventoryQuantity: node.inventoryQuantity ?? 0,
          image: node.image || null,
          selected: selectedSet.has(String(node.id)),
        };
      });

      // Fallback: if no edges, show already selected
      const initialVariants = allVariants.length > 0 ? allVariants : (product.variants || []).map(v => ({
        id: v.id,
        title: v.title,
        price: v.price,
        inventoryQuantity: v.inventoryQuantity || 0,
        image: v.image || null,
        selected: true,
      }));

      setModalVariants(initialVariants);
    } catch (e) {
      console.error('Failed to load variants', e);
      // Fallback to selected-only
      const initialVariants = (product.variants || []).map(v => ({
        id: v.id,
        title: v.title,
        price: v.price,
        inventoryQuantity: v.inventoryQuantity || 0,
        image: v.image || null,
        selected: true,
      }));
      setModalVariants(initialVariants);
    } finally {
      setModalLoading(false);
    }
  };


  const openResourcePicker = () => {
    const picker = ResourcePicker.create(app, {
      resourceType: ResourcePicker.ResourceType.Product,
      options: {
        showVariants: true,
        selectMultiple: true,
        // Preselect products with their selected variants grouped
        initialSelectionIds: buildGroupedInitialSelectionIds(selectedItems),
      },
    });

    picker.subscribe(ResourcePicker.Action.SELECT, (payload) => {
      console.log("✅ Selected products/variants:", payload.selection);
      handlePickerSelect(payload.selection);
    });

    picker.dispatch(ResourcePicker.Action.OPEN);
  };

  return (
    <Box paddingBlockStart={300}>
        <Button onClick={openResourcePicker}>Select Product Variants</Button>
        {error && (
          <Box paddingBlockStart={200}>
            <div style={{ color: '#d72c0d', fontSize: '14px' }}>{error}</div>
          </Box>
        )}
        {/* Selected Products Display */}
        {selectedItems.length > 0 && (
          <Box paddingBlockStart={200}>
            <Card padding="300">
              <BlockStack gap="0">
                {selectedItems.map((product, index) => {
                  const selectedVariantsCount = product.variants.length;
                  const totalVariantsCount = product.totalVariants || product.variants.length;
                  const hasMultipleTotalVariants = totalVariantsCount > 1;
                  
                  return (
                    <Box key={product.id} padding="0">
                      <InlineStack align="space-between" blockAlign="start">
                        {/* Left side: Image and Product Info */}
                        <InlineStack gap="300" blockAlign="start">
                          {/* Product Image */}
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f6f6f7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.title}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'contain',
                                  objectPosition: 'center'
                                }}
                              />
                            ) : (
                              <div style={{ 
                                color: '#8c9196', 
                                fontSize: '12px',
                                textAlign: 'center',
                                padding: '8px'
                              }}>
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="semibold">
                              {product.title}
                            </Text>
                            
                            {!hasMultipleTotalVariants ? (
                              <Text variant="bodySm" tone="subdued">
                                ${product.price}
                              </Text>
                            ) : (
                              <Text variant="bodySm" tone="subdued">
                                ({selectedVariantsCount} of {totalVariantsCount} variants selected)
                              </Text>
                            )}
                          </BlockStack>
                        </InlineStack>

                        {/* Right side: Action buttons */}
                        <InlineStack gap="200">
                          {hasMultipleTotalVariants && (
                            <Button
                              variant="tertiary"
                              size="slim"
                              icon={EditIcon}
                              onClick={() => editProductVariants(product.id)}
                              accessibilityLabel={`Edit variants for ${product.title}`}
                            />
                          )}
                          <Button
                            variant="tertiary"
                            size="slim"
                            icon={XSmallIcon}
                            onClick={() => removeProduct(product.id)}
                            accessibilityLabel={`Remove ${product.title}`}
                          />
                        </InlineStack>
                      </InlineStack>

                      {index < selectedItems.length - 1 && (
                        <Box paddingBlock="300">
                          <Divider />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </BlockStack>
            </Card>
          </Box>
        )}

        {/* Variant selection modal for a single product */}
        {isVariantModalOpen && (
          <Modal
            open
            onClose={() => setIsVariantModalOpen(false)}
            title={modalProduct ? `Edit variants — ${modalProduct.title}` : 'Edit variants'}
            primaryAction={{
              content: 'Done',
              onAction: () => {
                if (!modalProduct) return;
                // Build selected variants from the full modalVariants list so new picks are saved
                const selectedVariantDetails = modalVariants
                  .filter(v => v.selected)
                  .map(v => ({
                    id: v.id,
                    title: v.title,
                    price: v.price,
                    inventoryQuantity: v.inventoryQuantity || 0,
                    image: v.image || null,
                  }));

                const updatedProduct = {
                  ...modalProduct,
                  variants: selectedVariantDetails,
                  totalVariants: Array.isArray(modalVariants) ? modalVariants.length : (modalProduct.totalVariants || selectedVariantDetails.length),
                };

                const updatedItems = selectedItems.map(p => p.id === modalProduct.id ? updatedProduct : p);
                setSelectedItems(updatedItems);
                if (onSelect) onSelect(updatedItems);
                setIsVariantModalOpen(false);
              }
            }}
            secondaryActions={[{ content: 'Cancel', onAction: () => setIsVariantModalOpen(false) }]}
          >
            <Modal.Section>
              {modalLoading ? (
                <Box padding="200"><Spinner accessibilityLabel="Loading variants" /></Box>
              ) : (
                <BlockStack gap="300">
                  {/* Header row */}
                  {/* <InlineStack align="space-between" blockAlign="center">
                    <Text variant="bodySm" tone="subdued">
                      Select variants
                    </Text>
                    <Button onClick={() => setIsVariantModalOpen(false)} variant="tertiary" size="slim">Close</Button>
                  </InlineStack> */}

                  {/* Column labels */}
                  {/* <InlineStack align="space-between" blockAlign="center" gap="300">
                    <Box style={{ width: 24 }}></Box>
                    <Box style={{ width: 48 }}></Box>
                    <Box style={{ flex: 2 }}>
                      <Text tone="subdued">Variant</Text>
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text tone="subdued">Available</Text>
                    </Box>
                    <Box style={{ flex: 1, textAlign: 'right' }}>
                      <Text tone="subdued">Price</Text>
                    </Box>
                  </InlineStack> */}

                  {/* Variants list - selected first */}
                  <BlockStack gap="200">
                    {[...modalVariants].sort((a,b) => (b.selected === true) - (a.selected === true)).map(v => (
                      <InlineStack key={v.id} align="space-between" blockAlign="center" gap="300">
                        {/* Checkbox */}
                        <Box style={{ width: 24 }}>
                          <Checkbox
                            label=""
                            checked={!!v.selected}
                            onChange={(checked) => {
                              setModalVariants(prev => prev.map(x => x.id === v.id ? { ...x, selected: checked } : x));
                            }}
                          />
                        </Box>

                        {/* Variant image */}
                        <Box style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f6f6f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getVariantImage(v) ? (
                            <img src={getVariantImage(v)} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <Text tone="subdued" variant="bodySm">—</Text>
                          )}
                        </Box>

                        {/* Title */}
                        <Box style={{ flex: 2 }}>
                          <Text>{v.title}</Text>
                        </Box>

                        {/* Available */}
                        <Box style={{ flex: 1 }}>
                          <Text tone={Number(v.inventoryQuantity) > 0 ? 'success' : 'critical'}>
                            {Number(v.inventoryQuantity) > 0 ? `In stock (${v.inventoryQuantity})` : 'Out of stock'}
                          </Text>
                        </Box>

                        {/* Price */}
                        <Box style={{ flex: 1, textAlign: 'right' }}>
                          <Text>${v.price ?? '—'}</Text>
                        </Box>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </BlockStack>
              )}
            </Modal.Section>
          </Modal>
        )}
    </Box>
  );
};

export default VariantPicker;
