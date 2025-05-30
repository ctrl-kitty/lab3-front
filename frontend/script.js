document.addEventListener('DOMContentLoaded', async () => {
  try {
const response = await fetch(`http://${window.location.hostname}:3000/api/products`);    const data = await response.json();
    renderProducts(data.products);
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    document.getElementById('products').innerHTML = 
      '<p style="text-align:center;color:#e74c3c;">Не удалось загрузить товары. Пожалуйста, попробуйте позже.</p>';
  }
});

function renderProducts(products) {
  const container = document.getElementById('products');
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="text-align:center;">Товары не найдены</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <h3>${product.name}</h3>
      <div class="price">${product.price.toLocaleString()} руб.</div>
      <div class="description">${product.description}</div>
      <div class="categories">
        ${product.categories.map(cat => `<span>${cat}</span>`).join('')}
      </div>
      <button class="btn">Подробнее</button>
    `;
    container.appendChild(card);
  });
}