// Product data
let products;

// Fetch data from external JSON file
fetch("./data.json")
  .then((res) => res.json())
  .then((data) => {
    products = data;
    displayProducts(); // Initialize after data is loaded
  })
  .catch((error) => {
    console.error("Error loading data:", error);
    // Fallback message if JSON fails to load
    document.querySelector(".product-items").innerHTML =
      "<p>Error loading products. Please check that data.json exists in the correct location.</p>";
  });

// Shopping Cart Implementation
let cartItems = new Map();
let productItems = document.querySelector(".product-items");
let cartContainer = document.querySelector(".carContainer");

function displayProducts() {
  // Create cart display elements
  let showAllChoisProducts = document.createElement("div");
  cartContainer.appendChild(showAllChoisProducts);
  showAllChoisProducts.className = "showAllChoisProducts";

  let ordersContainer = document.createElement("div");
  ordersContainer.className = "ordersContainer";
  cartContainer.appendChild(ordersContainer);

  let cartTotalContainer = document.createElement("div");
  cartTotalContainer.className = "cartTotalContainer";
  cartContainer.appendChild(cartTotalContainer);

  // Display products
  products.forEach((productData, index) => {
    let items = document.createElement("div");
    items.className = "items";
    items.dataset.productId = index;
    productItems.appendChild(items);

    // Use placeholder images since we can't load external assets
    const placeholderImage = `data:image/svg+xml,%3Csvg width='251' height='200' viewBox='0 0 251 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='251' height='200' rx='8' fill='%23${Math.floor(
      Math.random() * 16777215
    ).toString(
      16
    )}'/%3E%3Ctext x='125.5' y='105' text-anchor='middle' font-family='Arial' font-size='14' fill='white'%3E${
      productData.name
    }%3C/text%3E%3C/svg%3E`;

    items.innerHTML = `
                    <img class="image" src="${
                      productData.image.desktop
                    }" alt="${productData.name}">
                    <div class="addToCart">
                    <img src="./assets/images/icon-add-to-cart.svg">Add To Cart
                    </div>
                    <div class="info">
                        <p class="category">${productData.category}</p>
                        <h3 class="name">${productData.name}</h3>
                        <p class="price">${productData.price.toFixed(2)}</p>
                    </div>
                `;

    let addToCart = items.querySelector(".addToCart");
    addToCart.addEventListener("click", function () {
      addItemToCart(productData, index, items);
    });
  });

  updateCartDisplay();
}

function addItemToCart(productData, productId, itemElement) {
  if (!cartItems.has(productId)) {
    cartItems.set(productId, {
      ...productData,
      quantity: 0,
      productId: productId,
      itemElement: itemElement,
    });
  }

  let cartItem = cartItems.get(productId);
  cartItem.quantity = 1;

  updateProductButton(itemElement, cartItem);
  updateCartDisplay();
}

function updateProductButton(itemElement, cartItem) {
  let addToCart = itemElement.querySelector(".addToCart, .addedToCart");

  if (cartItem.quantity === 0) {
    addToCart.className = "addToCart";
    addToCart.innerHTML = `<img src="./assets/images/icon-add-to-cart.svg">Add To Cart`;

    addToCart.addEventListener("click", function () {
      addItemToCart(cartItem, cartItem.productId, itemElement);
    });
  } else {
    addToCart.className = "addedToCart";
    addToCart.innerHTML = `
                    <div class="decrement">-</div>
                    <div class="quantity">${cartItem.quantity}</div>
                    <div class="increment">+</div>
                `;

    let incrementBtn = addToCart.querySelector(".increment");
    let decrementBtn = addToCart.querySelector(".decrement");
    let quantityDisplay = addToCart.querySelector(".quantity");

    incrementBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      cartItem.quantity++;
      quantityDisplay.textContent = cartItem.quantity;
      updateCartDisplay();
    });

    decrementBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (cartItem.quantity > 1) {
        cartItem.quantity--;
        quantityDisplay.textContent = cartItem.quantity;
        updateCartDisplay();
      } else {
        removeItemFromCart(cartItem.productId);
      }
    });
  }
}

function removeItemFromCart(productId) {
  let cartItem = cartItems.get(productId);
  if (cartItem) {
    cartItem.quantity = 0;
    updateProductButton(cartItem.itemElement, cartItem);
    cartItems.delete(productId);
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  let ordersContainer = cartContainer.querySelector(".ordersContainer");
  let cartTotalContainer = cartContainer.querySelector(".cartTotalContainer");
  let showAllChoisProducts = cartContainer.querySelector(
    ".showAllChoisProducts"
  );

  ordersContainer.innerHTML = "";
  cartTotalContainer.innerHTML = "";

  let totalQuantity = 0;
  let totalPrice = 0;

  cartItems.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
    totalPrice += cartItem.price * cartItem.quantity;

    let order = document.createElement("div");
    order.className = "order";
    order.innerHTML = `
                    <div class="orders">
                        <div class="infoOrders">
                            <div class="nameProductChoise">${
                              cartItem.name
                            }</div>
                            <div class="quantityOrders">
                                <span class="quantityNumber">${
                                  cartItem.quantity
                                }x</span>
                                <span class="priceOrder">@ ${cartItem.price.toFixed(
                                  2
                                )}</span>
                                <span class="totalPrice">${(
                                  cartItem.price * cartItem.quantity
                                ).toFixed(2)}</span>
                            </div>
                        </div>
                        <div class="removeOrder" data-product-id="${
                          cartItem.productId
                        }">
                            ✕
                        </div>
                    </div>
                `;

    let removeBtn = order.querySelector(".removeOrder");
    removeBtn.addEventListener("click", function () {
      removeItemFromCart(cartItem.productId);
    });

    ordersContainer.appendChild(order);
  });

  if (totalQuantity > 0) {
    showAllChoisProducts.innerHTML = `<h5 class="yourCart">Your Cart (${totalQuantity})</h5>`;

    cartTotalContainer.innerHTML = `
                    <div class="orderTotal">
                        <div>Order Total: <span class="totalNumber">${totalPrice.toFixed(
                          2
                        )}</span></div>
                    </div>
                    <div class="carbon">
                        <img src="./assets/images/icon-carbon-neutral.svg"> This is <strong>carbon-neutral</strong> delivery
                    </div>
                    <button class="confirmOrder">Confirm Order</button>
                `;

    let confirmOrder = cartTotalContainer.querySelector(".confirmOrder");
    if (confirmOrder) {
      confirmOrder.addEventListener("click", function () {
        showOrderConfirmation();
      });
    }
  } else {
    showAllChoisProducts.innerHTML = `
                    <h5 class="yourCart">Your Cart (0)</h5>
                    <div style="display: flex; justify-content: center;"><img src="./assets/images/illustration-empty-cart.svg" ></div>
                    <p class="emptyP">Your added items will appear here</p>
                `;
  }
}

function showOrderConfirmation() {
  let overlay = document.querySelector(".overly");
  let orderSummary = document.getElementById("orderSummary");

  let summaryHTML = "";
  cartItems.forEach((cartItem) => {
    summaryHTML += `
                    <div class="allOrg">
                      <div class="org">
                        <img
                          src="${cartItem.image.thumbnail}"
                          alt=""
                          style="width: 50px;"
                        />
                        <div style="flex-direction: column">
                          <span>${cartItem.name}</span>
                          <div style="justify-content: flex-start;">
                            <span style="color: var(--Red);margin: 0 10px;">${
                              cartItem.quantity
                            }x</span>
                            <span><span style="color: var(--Rose-800)">@</span> ${cartItem.price.toFixed(
                              2
                            )}</span>
                        </div>
                        </div>
                        <span style="font-weight: bold">${(
                          cartItem.price * cartItem.quantity
                        ).toFixed(2)}</span>
                      </div>
                    </div>
                `;
  });

  let totalPrice = Array.from(cartItems.values()).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  summaryHTML += `<div style="border-top: 2px solid #eee; padding-top: 15px; margin-top: 15px; font-weight: bold;"><span>Total</span><span>${totalPrice.toFixed(
    2
  )}</span></div>`;

  orderSummary.innerHTML = summaryHTML;
  overlay.style.display = "flex";

  document.getElementById("closeModal").onclick = () => {
    overlay.style.display = "none";
    cartItems.clear();
    updateCartDisplay();
    // Reset all product buttons
    document.querySelectorAll(".addedToCart").forEach((btn) => {
      btn.className = "addToCart";
      btn.innerHTML = `<img src="./assets/images/icon-add-to-cart.svg">Add To Cart`;
    });
  };

  overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("overly")) {
      overlay.style.display = "none";
    }
  });
}
