// js/script.js

let cart = JSON.parse(localStorage.getItem('cart')) || [];

/* =========================
   КОРЗИНА (ИСПРАВЛЕНО)
========================= */

function addToCart(button, name, price, event) {
    console.log('🛒 Добавляем:', name, price);
    
    let imageSrc = '';

    /* ДЛЯ СЛАЙДЕРОВ НА ГЛАВНОЙ */
    const sliderCard = button.closest('.slider-card');
    if(sliderCard) {
        const image = sliderCard.querySelector('img');
        if(image) {
            imageSrc = image.src;
        }
    }

    /* ДЛЯ КАТАЛОГА */
    const productCard = button.closest('.product-card');
    if(productCard) {
        const image = productCard.querySelector('.product-image');
        if(image) {
            imageSrc = image.src;
        }
    }

    cart.push({
        name,
        price,
        image: imageSrc
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    console.log('✅ Товар добавлен. В корзине:', cart.length);
    alert('Товар добавлен в корзину!');
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if(cartCount) {
        cartCount.innerText = cart.length;
    }
}

/* =========================
   ВЫВОД КОРЗИНЫ
========================= */

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    if (!cartItems) return;

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="">
                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <p>${item.price} ₽</p>
                    <button onclick="removeFromCart(${index})">Удалить</button>
                </div>
            </div>
        `;
    });

    totalPrice.innerText = `Общая сумма: ${total} ₽`;
}

/* =========================
   УДАЛЕНИЕ ИЗ КОРЗИНЫ
========================= */

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

/* =========================
   МОДАЛКА ФОТО
========================= */

function openImage(src) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    if(modal && modalImage) {
        modal.classList.add('active');
        modalImage.src = src;
    }
}

/* =========================
   СЛАЙДЕР
========================= */

function scrollSlider(id, direction) {
    const slider = document.getElementById(id);
    if(!slider) return;
    const scrollAmount = 380;
    slider.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

/* =========================
   СМЕНА ЦВЕТА ТОВАРА (ИСПРАВЛЕНО)
========================= */

function changeProductImage(element, newImage) {
    const productCard = element.closest('.product-card');
    if(!productCard) return;
    
    const image = productCard.querySelector('.product-image');
    if(!image) return;

    /* меняем фото */
    image.src = newImage;

    /* активный кружок */
    const dots = productCard.querySelectorAll('.color-dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    element.classList.add('active');
}

/* =========================
   ЗАКРЫТИЕ SUCCESS MODAL
========================= */

function closeSuccessModal() {
    document.getElementById('successModal')?.classList.remove('active');
}

/* =========================
   ЗАГРУЗКА СТРАНИЦЫ
========================= */

document.addEventListener('DOMContentLoaded', function () {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    displayCart();

    /* закрытие модалки */
    const modal = document.getElementById('imageModal');
    if(modal) {
        modal.addEventListener('click', function () {
            modal.classList.remove('active');
        });
    }

    /* форма заказа */
    const orderForm = document.getElementById('orderForm');
    if(orderForm) {
        orderForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const customer = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;

            let total = 0;
            cart.forEach(item => {
                total += item.price;
            });

            if (cart.length === 0) {
                alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
                return;
            }

            try {
                const response = await fetch('/api/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customer,
                        phone,
                        address,
                        items: cart,
                        total
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if(data.success) {
                    alert(`Заказ №${data.orderId} успешно оформлен!`);
                    localStorage.removeItem('cart');
                    cart = [];
                    displayCart();
                    updateCartCount();
                    const successModal = document.getElementById('successModal');
                    if(successModal) successModal.classList.add('active');
                } else {
                    alert('Ошибка при оформлении заказа: ' + (data.error || 'Неизвестная ошибка'));
                }

            } catch(error) {
                console.error('Ошибка:', error);
                alert('Ошибка соединения с сервером. Убедитесь, что сервер запущен (node server.js)');
            }
        });
    }
});

/* =========================
   ФИЛЬТРЫ КАТАЛОГА
========================= */

function filterProducts(category, button) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const productCategory = product.dataset.category;
        if (category === 'all' || productCategory.includes(category)) {
            product.style.display = 'flex';
            setTimeout(() => {
                product.classList.remove('hide');
            }, 10);
        } else {
            product.classList.add('hide');
            setTimeout(() => {
                product.style.display = 'none';
            }, 300);
        }
    });

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}

/* =========================
   URL FILTER
========================= */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if(category) {
        const button = document.querySelector(`.filter-btn[onclick*="${category}"]`);
        if(button) {
            filterProducts(category, button);
        }
    }
});

/* =========================
   SORT PRODUCTS
========================= */

function sortProducts(type) {
    const productsContainer = document.querySelector('.products');
    const products = Array.from(document.querySelectorAll('.product-card'));

    products.sort((a, b) => {
        const priceA = parseInt(a.querySelector('.price').innerText.replace('₽', '').trim());
        const priceB = parseInt(b.querySelector('.price').innerText.replace('₽', '').trim());
        const nameA = a.querySelector('h3').innerText.toLowerCase();
        const nameB = b.querySelector('h3').innerText.toLowerCase();

        switch(type) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'name-asc':
                return nameA.localeCompare(nameB);
            case 'name-desc':
                return nameB.localeCompare(nameA);
            default:
                const orderA = parseInt(a.dataset.order);
                const orderB = parseInt(b.dataset.order);
                return orderA - orderB;
        }
    });

    products.forEach(product => {
        productsContainer.appendChild(product);
    });
}

/* =========================
   BURGER MENU
========================= */

document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    if(burger && menu){
        burger.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }
});