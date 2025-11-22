import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  BlockStack,
  Grid,
  Button,
  DataTable,
  InlineStack,
  Badge,
  Modal
} from "@shopify/polaris";

import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useToast } from "@shopify/app-bridge-react";
import { useAppQuery } from "../hooks";
import { useAuthenticatedFetch } from "../hooks";
import "@shopify/polaris/build/esm/styles.css";
import { ClipboardIcon,DeleteIcon,EditIcon } from "@shopify/polaris-icons";

export function DashBoard() {
    const toast = useToast();
    const fetchWithAuth = useAuthenticatedFetch();
    const navigate = useNavigate();

    // Delete modal state
    const [deleteModalActive, setDeleteModalActive] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, type }

    const {
        data,
        isLoading,
        error,
        refetch // optional: can be used after delete or toggle
    } = useAppQuery({
        url: '/api/dashboard/list',
        reactQueryOptions: { staleTime: 0 },
    });

    useEffect(() => {
        if (data) {
        console.log('Fetched data:', data);
        }
    }, [data]);

    if (isLoading) return <Text>Loading timers...</Text>;
    if (error) return <Text>Error loading timers!</Text>;

    const mergedTimers = data?.data || [];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
        console.log("Copied", text);
        });
    };

    const editRoutes = {
        "Countdown Timer": "/countdown-timers/edit/",
        "Stock Countdown": "/stock-countdown/edit/",
    };

    const handleEdit = (id, type) => {
        const basePath = editRoutes[type];
        if (basePath) {
            console.log("Navigating to:", `${basePath}${id}`);
            navigate(`${basePath}${id}`);
        } else {
            console.warn(`Unknown type: ${type}`);
        }
    };

    // Open/close delete modal
    const openDeleteModal = (id, type) => {
        setDeleteTarget({ id, type });
        setDeleteModalActive(true);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
        setDeleteModalActive(false);
    };

    // helper at top-level (inside component file scope)
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, type } = deleteTarget;

        // 1) Close modal instantly
        closeDeleteModal();

        // 2) Show the first toast briefly
        toast.show(`Deleting ${type}...`, { duration: 1500 });

        try {
            let endpoint = "";
            if (type === "Countdown Timer") {
                endpoint = `/api/countdown-timers/delete/${id}`;
            } else if (type === "Stock Countdown") {
                endpoint = `/api/stock-countdown/delete/${id}`;
            } 

            const response = await fetchWithAuth(endpoint, { method: "DELETE" });

            // small gap so the second toast doesn't replace the first instantly
            await wait(300);

            if (response.ok) {
                refetch?.();
                toast.show(`${type} deleted`, { duration: 5000 });
            } else {
                toast.show(`Failed to delete ${type}`, { duration: 4000, isError: true });
            }
        }catch (err) {
            console.error("Delete error:", err);
            toast.show(`Error deleting ${type}`, { duration: 4000, isError: true });
        }
    };

    const handleStatusToggle = async (id, type, newStatus) => {
        try {
            let endpoint = "";
            if (type === "Countdown Timer") {
                endpoint = `/api/countdown-timers/status/${id}`;
            } else if (type === "Stock Countdown") {
                endpoint = `/api/stock-countdown/status/${id}`;
            }
            const response = await fetchWithAuth(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_published: newStatus }),
            });
            if (response.ok) refetch();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const features = [
    {
      title: 'Countdown Timer',
      description: 'Advanced countdown timer with customizable design, placement options, and multiple timer types.',
      path: '/setup/countdown-timers',
    },
    {
      title: 'Stock Countdown',
      description:
        'Display low stock alerts with customizable messages, design, and placement options.',
      path: '/setup/stock-countdown',
    },
    // {
    //   title: 'Final Countdown Timer',
    //   description:
    //     'Advanced countdown timer with customizable design, placement options, and multiple timer types.',
    //   path: '/setup/countdown-timers',
    // },
    // {
    //   title: 'Inventory Countdown',
    //   description:
    //     'Display low stock alerts with customizable messages, design, and placement options.',
    //   path: '/setup/inventory-countdown',
    // },
  ];


  return(
    <Page
        fullWidth
        title="Dashboard"
    >
        <Layout>
            <Layout.Section>
                <Card>
                    <Box padding={100}>
                        <BlockStack align="center" gap={400}>
                            <Text as="h1" variant="headingLg" alignment="center" tone="success">
                                Welcome to the dashboard!
                            </Text>
                            <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                                Here you can see all the boosters that you have created. You can also create new boosters.<br/>
                                Supercharge your store's performance with proven conversion optimization tools
                            </Text>
                        </BlockStack>
                    </Box>
                </Card>
            </Layout.Section>

            {/* Start Dashboard */}
            <Layout.Section>
                <Card>
                    <Text as="h2" variant="headingMd">Your Saved Boosters</Text>

                    <DataTable
                        columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                        headings={["Title", "ID", "Type", "Details", "Status", "Actions"]}
                        rows={mergedTimers.map((item) => [
                        // Title
                        <Text>{item.title || "Untitled"}</Text>,

                        // ID + copy button
                        <InlineStack gap="200">
                            <Text>{item.id}</Text>
                            <Button icon={ClipboardIcon} size="slim" 
                                onClick={() => handleCopy(item.id)} 
                            />
                        </InlineStack>,

                        // Type
                        <Badge>{item.type}</Badge>,

                        // Details
                        item.details || "-",

                        // Status + toggle
                        <InlineStack gap="100">
                            <Badge status={item.is_published == 1 ? "success" : "critical"}>
                                {item.is_published == 1 ? "Published" : "Unpublished"}
                            </Badge>
                            <Button
                                size="slim"
                                onClick={() => handleStatusToggle(item.id, item.type, item.is_published == 0)}
                            >
                                {item.is_published == 1 ? "Unpublish" : "Publish"}
                            </Button>
                        </InlineStack>,

                        // Actions
                        <InlineStack gap="200">
                            <Button icon={EditIcon} size="slim" 
                                onClick={() => handleEdit(item.id, item.type)} 
                            />
                            <Button
                                icon={DeleteIcon}
                                size="slim"
                                tone="critical"
                                onClick={() => openDeleteModal(item.id, item.type)}
                            />
                        </InlineStack>,
                    ])}
                    />
                </Card>
            </Layout.Section>
            {/* End Dashboard */}

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteModalActive}
                onClose={closeDeleteModal}
                title={`Delete ${deleteTarget?.type}?`}
                primaryAction={{ content: "Delete", destructive: true, onAction: confirmDelete }}
                secondaryActions={[{ content: "Cancel", onAction: closeDeleteModal }]}
            >
                <Box padding="400">
                    <Text as="p" variant="bodyMd">
                        If you delete this {deleteTarget?.type}, it cannot be undone.
                    </Text>
                </Box>
            </Modal>

            <Layout.Section>
                <Box paddingBlockStart={0}>
                    <Grid columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }} gap="400">
                        {features.map((feature, index) => (
                            <Card key={index} padding="400">
                                <Box paddingBlockEnd="300">
                                    <Text as="h2" variant="headingMd">
                                    {feature.title}
                                    </Text>
                                    <Text as="p" variant="bodyMd" tone="subdued">
                                    {feature.description}
                                    </Text>
                                </Box>
                                <Button 
                                    variant="primary" 
                                    fullWidth
                                    onClick={() => navigate(feature.path)}
                                >
                                    Setup
                                </Button>
                            </Card>
                        ))}
                    </Grid>
                </Box>
            </Layout.Section>
        </Layout>
    </Page>
  );
}