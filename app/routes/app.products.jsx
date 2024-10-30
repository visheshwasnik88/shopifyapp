// app/routes/app.products.jsx
import {
  Page,
  Layout,
  Card,
  DataTable,
  Thumbnail,
  Text,
  Button,
  LegacyCard,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData, useFetcher, Navigate, useNavigate } from "@remix-run/react";
//import {  deleteProduct } from './api/controller.js'
// Loader function for fetching products
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  //const { admin } = await authenticate.admin(request);
const responses = await admin.rest.get({
  path: `products`,
  query: {id: 1, title: "title"}
})
console.log("Res",responses)
  const response = await admin.graphql(
    `#graphql
    query getProducts {
      products(first: 3) {
        edges {
          node {
            id
            title
            description
            vendor
            images(first: 1) {
              edges {
                node {
                  src
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
      }
    }`,
  );

  const data = await response.json();
  const products = data.data.products.edges.map((edge) => {
    const node = edge.node;
    const imageSrc = node.images.edges[0]?.node.src || "";
    const price = node.variants.edges[0]?.node.price || "0.00";
    const vendor = node.vendor || "Unknown";
    return {
      id: node.id,
      title: node.title,
      description: node.description,
      imageSrc,
      price,
      vendor,
    };
  });
  return json(products); // Return products as JSON
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const productId = formData.get("id");

  switch (actionType) {
    case "DELETE":
      try {
        const response = await admin.graphql(
          `#graphql
          mutation {
            productDelete(input: { id: "${productId}" }) {
              deletedProductId
              userErrors {
                field
                message
              }
            }
          }`,
        );

        return json({ success: true, response });
      } catch (err) {
        return json({ success: false, error: "Failed to delete product." });
      }
  }
  return null;
};

// ProductTable component for displaying products
export default function ProductTable() {
  const products = useLoaderData();
  const fetcher = useFetcher();
  const navigate= useNavigate()
  const rows = products.map((product) => {
    const description = product.description || "No Description";
    const imageSrc = product.imageSrc || "";
    const price = `${product.price}`;
    const vendor = product.vendor || "Unknown";

    return [
      product.title,
      description,
      <Thumbnail source={imageSrc} alt={product.title} />,
      price,
      vendor,
      <Button onClick={() => deleteHandler("DELETE", product.id)}>
        Delete
      </Button>,
      <Button onClick={() =>  navigate(`/app/updateproduct`, { state:  `${product.id}`})}>Edit</Button>,
    ];
  });

  const deleteHandler = async (actionType, id) => {
    fetcher.submit({ actionType, id }, { method: "delete" });
  };

  return (
    <Page title="Products">
      <Layout>
        <Layout.Section>
          <Card>
            {rows.length > 0 ? (
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={[
                  "Product Title",
                  "Description",
                  "Image",
                  "Price",
                  "Vendor",
                  "",
                  "",
                ]}
                rows={rows}
              />
            ) : (
              <Text>No products available.</Text>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
