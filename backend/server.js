const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.url === '/' && req.method === 'GET') {
        serveFile(res, path.join(__dirname, '../frontend/index.html'), 'text/html');
    } else if (req.url === '/api/products' && req.method === 'GET') {
        getProducts(res);
    } else {
        serveFile(res, path.join(__dirname, '../frontend/index.html'), 'text/html');
    }
});

function getProducts(res) {
    fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Cannot read products file' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        }
    });
}

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

server.listen(PORT, () => {
    console.log(`Main server running on port ${PORT}`);
});