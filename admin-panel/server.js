const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        if (req.method === 'GET' && parsedUrl.pathname === '/api/products') {
            await getProducts(res);
        } else if (req.method === 'POST' && parsedUrl.pathname === '/api/products') {
            await addProduct(req, res);
        } else if (req.method === 'PUT' && parsedUrl.pathname === '/api/products') {
            await updateProduct(req, res, parsedUrl.query.id);
        } else if (req.method === 'DELETE' && parsedUrl.pathname === '/api/products') {
            await deleteProduct(res, parsedUrl.query.id);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
});

async function readProducts() {
    const data = await fs.promises.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeProducts(products) {
    await fs.promises.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

async function getProducts(res) {
    const data = await readProducts();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

async function addProduct(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    
    req.on('end', async () => {
        try {
            const newProduct = JSON.parse(body);
            const data = await readProducts();
            
            const newId = data.products.reduce((max, product) => 
                Math.max(max, product.id), 0) + 1;
            
            const productToAdd = {
                id: newId,
                name: newProduct.name || 'Без названия',
                price: newProduct.price || 0,
                description: newProduct.description || '',
                categories: newProduct.categories || []
            };
            
            data.products.push(productToAdd);
            await writeProducts(data);
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(productToAdd));
        } catch (error) {
            console.log(error)
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid product data' }));
        }
    });
}

async function updateProduct(req, res, id) {
    if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Product ID is required' }));
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk.toString());
    
    req.on('end', async () => {
        try {
            const updatedFields = JSON.parse(body);
            const data = await readProducts();
            const productIndex = data.products.findIndex(p => p.id === parseInt(id));
            
            if (productIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Product not found' }));
                return;
            }
            
            data.products[productIndex] = {
                ...data.products[productIndex],
                ...updatedFields,
                id: parseInt(id)
            };
            
            await writeProducts(data);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data.products[productIndex]));
        } catch (error) {
            console.log(error)
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid product data' }));
        }
    });
}

async function deleteProduct(res, id) {
    if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Product ID is required' }));
        return;
    }

    try {
        const data = await readProducts();
        const initialLength = data.products.length;
        
        data.products = data.products.filter(p => p.id !== parseInt(id));
        
        if (data.products.length === initialLength) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
            return;
        }
        
        await writeProducts(data);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } catch (error) {
        console.log(error)
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

server.listen(PORT, () => {
    console.log(`Admin server running on port ${PORT}`);
});