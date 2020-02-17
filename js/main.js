(async function() {
    class Products {
        constructor({
                        products,
                        textButton,
                        textActiveButton,
                        currentSortDirection,
                        rootEl,
                    }) {
            this.defaultData = [...products];
            this.currentData = [...products];
            this.textButton = textButton;
            this.textActiveButton = textActiveButton;
            this.currentSortDirection = currentSortDirection;
            this.rootEl = rootEl;
        }

        sort(event) {
            event.preventDefault();

            if (this.currentSortDirection === 'desc') {
                this.currentSortDirection = 'asc';
                event.target.textContent = 'Asc';
            } else {
                this.currentSortDirection = 'desc';
                event.target.textContent = 'Desc';
            }

            this.render();
        }

        search(event) {
            event.preventDefault();

            if (event.target.value.length > 2) {
                const reg = new RegExp(`^${event.target.value}`, 'i');
                this.currentData = this.defaultData.filter(product => reg.test(product.title));

                if (this.currentData.length) {
                    this.render();
                } else {
                    this.rootEl.innerHTML = '<div class="cart">No results...</div>';
                }
            } if (event.target.value === '') {
                this.render(true);
            }
        }

        render(isDefault) {
            this.rootEl.innerHTML = '';
            const data = isDefault ? this.defaultData : this.currentData;
            const sortedData = data.sort((a, b) => {
                const sortCondition = this.currentSortDirection === 'desc'
                    ? a.price.value > b.price.value
                    : a.price.value < b.price.value;

                return sortCondition ? 1 : -1;
            });

            for (let i = 0; i < sortedData.length; i++) {
                const product = sortedData[i];
                const cartEl = document.createElement('section');
                cartEl.classList.add('cart');

                cartEl.innerHTML = `
        <div class="cart__image-block">
          <img class="cart__image" src="${product.imageLink}" alt="${product.title}">
        </div>
        <div class="cart__text">
          <div class="cart__title">${product.title}</div>
          <div class="cart__desc">${product.description}</div>
        </div>
        <div class="cart__price-block">
          <div class="cart__price">$${product.price.value}</div>
          <a href="#" class="cart__button">${this.textButton}</a>
        </div>
      `;

                this.rootEl.appendChild(cartEl);

                const buttonEl = cartEl.querySelector('a');
                buttonEl.addEventListener('click', toggleBasket(product.id));

                if (currentBasket.includes(product.id)) {
                    buttonEl.classList.add('_active');
                    buttonEl.textContent = this.textActiveButton;
                }
            }
        }
    }

    const productsData = await fetch('http://localhost:3000/api/products')
        .then(response => response.json())
        .then(data => data)
        .catch(err => {
            console.log(err);
            return [];
        });

    const productsEl = document.getElementById('products');
    const sortEl = document.getElementById('sort');
    const searchEl = document.getElementById('search');

    const products = new Products({
        products: productsData,
        textButton: 'Add to Basket',
        textActiveButton: 'Remove from Basket',
        currentSortDirection: 'asc',
        rootEl: productsEl,
    });

    let currentBasket = [];

    const renderBasket = () => {
        const countEl = document.getElementById('count');
        const amountEl = document.getElementById('amount');

        const amount = currentBasket.reduce((acc, productId) => {
            const product = products.defaultData.find(item => item.id === productId);
            return acc + product.price.value;
        }, 0);

        countEl.textContent = currentBasket.length;
        amountEl.textContent = `${amount}$`;
    };

    const toggleBasket = productId => event => {
        event.preventDefault();

        if (!currentBasket.includes(productId)) {
            event.target.classList.add('_active');
            event.target.textContent = products.textActiveButton;
            currentBasket.push(productId);
        } else {
            event.target.classList.remove('_active');
            event.target.textContent = products.textButton;
            currentBasket = currentBasket.filter(item => item !== productId);
        }

        renderBasket();
    };

    sortEl.addEventListener('click', products.sort.bind(products));
    searchEl.addEventListener('input', products.search.bind(products));

    products.render();
    renderBasket();

})();