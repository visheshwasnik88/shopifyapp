// src/AddProductForm.js

import React, { useState } from 'react';

const AddProductForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const productData = {
            product: {
                title: title,
                body_html: description,
                images: [{ src: image }],
                variants: [{ price: price.toString() }]
            }
        };

        try {
            const response = await fetch('/admin/api/2023-07/products.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': 'YOUR_ACCESS_TOKEN', // Replace with your access token
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Product added successfully:', result);
                alert('Product added successfully!');
                // Reset the form
                setTitle('');
                setDescription('');
                setImage('');
                setPrice('');
            } else {
                console.error('Error adding product:', result);
                alert('Error adding product: ' + result.errors);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Product Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="image">Image URL</label>
                    <input
                        type="text"
                        id="image"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        step="0.01"
                        required
                    />
                </div>
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProductForm;
