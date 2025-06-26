const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
// Hello World route at root endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware setup
app.use(bodyParser.json());

// Custom middleware for request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Custom middleware for authentication (simplified example)
const authenticate = (req, res, next) => {
  const authToken = req.headers['authorization'];
  // In a real app, you would validate the token properly
  if (!authToken || authToken !== 'Bearer valid-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  // Optional query parameters for filtering
  const { category, inStock } = req.query;
  let filteredProducts = [...products];
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (inStock) {
    const inStockBool = inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === inStockBool);
  }
  
  res.json(filteredProducts);
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products - Create a new product (with authentication)
app.post('/api/products', authenticate, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newProduct = {
    id: (products.length + 1).toString(),
    name,
    description,
    price: Number(price),
    category,
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product (with authentication)
app.put('/api/products/:id', authenticate, (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const { name, description, price, category, inStock } = req.body;
  const updatedProduct = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    description: description || products[productIndex].description,
    price: price !== undefined ? Number(price) : products[productIndex].price,
    category: category || products[productIndex].category,
    inStock: inStock !== undefined ? Boolean(inStock) : products[productIndex].inStock
  };
  
  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

// DELETE /api/products/:id - Delete a product (with authentication)
app.delete('/api/products/:id', authenticate, (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).end();
});

// Custom middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;