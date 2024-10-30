// app/routes/api/products.js
import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

// Handle CRUD operations in the action
export const action = async ({ request }) => {
  console.log("Action method called with method:", request.method);
  const { admin } = await authenticate.admin(request);
  
  const method = request.method;
  let result;

  switch (method) {
    case "POST":
      const createBody = await request.json();
      result = await admin.graphql(
        `mutation createProduct($title: String!) {
          productCreate(input: { title: $title }) {
            product {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }`,
        { variables: { title: createBody.title } }
      );
      break;

    case "PUT":
      const updateBody = await request.json();
      result = await admin.graphql(
        `mutation updateProduct($id: ID!, $title: String!) {
          productUpdate(input: { id: $id, title: $title }) {
            product {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }`,
        { variables: { id: updateBody.id, title: updateBody.title } }
      );
      break;

    case "DELETE":
      const deleteBody = await request.json();
      result = await admin.graphql(
        `mutation deleteProduct($id: ID!) {
          productDelete(input: { id: $id }) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }`,
        { variables: { id: deleteBody.id } }
      );
      break;

    default:
      return json({ error: "Invalid request method" }, { status: 405 });
  }

  const responseData = await result.json();
  return json(responseData);
};

// Optional loader function for GET requests (e.g., to list all products)
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `query getProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
          }
        }
      }
    }`
  );

  const data = await response.json();
  return json(data.data.products.edges.map(edge => edge.node));
};
