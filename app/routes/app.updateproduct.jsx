// AddProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
  AppProvider,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Page,
  Banner,
} from '@shopify/polaris';
import { useFetcher, json, useLocation } from '@remix-run/react';
import { authenticate } from "../shopify.server";

// Exported Action for updating
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const productId = formData.get("productId"); // Get productId

  if (!title) {
    return json({ success: false, error: "Title is required." });
  }

  const input = {
    id: productId, // Include the product ID for updating
    title: title.trim(),
    bodyHtml: description?.trim() || "", // Ensure description is included
  };

  try {
    const response = await admin.graphql(
      `
      mutation UpdateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            descriptionHtml
          }
          userErrors {
            field
            message
          }
        }
      }
      `,
      { variables: { input } }
    );

    const { productUpdate } = response;
    if (productUpdate.userErrors && productUpdate.userErrors.length > 0) {
      return json({ success: false, error: productUpdate.userErrors[0].message });
    }

    return json({ success: true, response: productUpdate.product });
  } catch (error) {
    return json({ success: false, error: "Failed to update product." });
  }
};

const AddProductForm = () => {
  const fetcher = useFetcher();
  const location = useLocation();
  const id = location.state?.id; // Get the product ID
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing product details when the component mounts


  const handleSubmit = (event) => {
    event.preventDefault();
    fetcher.submit(
      { title, description, productId: id }, // Include productId
      { method: 'post' } // Ensure action path is correct
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        setSuccess('Product updated successfully!'); // Update message for editing
        setError('');
        setTitle('');
        setDescription('');
      } else {
        setError(fetcher.data.error);
        setSuccess('');
      }
    }
  }, [fetcher.data]);

  return (
    <AppProvider>
      <Page title={id ? "Edit Product" : "Add New Product"}>
        {error && <Banner status="critical">{error}</Banner>}
        {success && <Banner status="success">{success}</Banner>}
        <Card sectioned>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Product Title"
                value={title}
                onChange={setTitle}
                autoComplete="off"
                requiredIndicator
              />
              <TextField
                label="Description"
                value={description}
                onChange={setDescription}
                multiline={4}
                autoComplete="off"
              />
              <Button submit primary loading={fetcher.state === 'submitting'}>
                {id ? "Update Product" : "Add Product"}
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </AppProvider>
  );
};

export default AddProductForm;
