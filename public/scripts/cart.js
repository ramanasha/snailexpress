function addItem (inventoryId, quantity){
  var cart = getCart();
  cart.push({
    "inventoryId": inventoryId,
    "quantity": quantity
  })
  saveCart(cart);
}

function updateItem (inventoryId, quantity) {
  var cart = getCart();
  for (var item of cart) {
    if (item.inventoryId === inventoryId) {
       item.quantity = quantity;
    }
  }
  saveCart(cart);
}

function deleteItem (inventoryId) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].inventoryId === inventoryId) {
      cart.splice(i, 1);
      break;
    }
  }
  saveCart(cart);
}

function getCart() {
    var cookie = Cookies.get('cart');
  var cart;
  if (!cookie) {
    cart = [];
  } else {
    cart = JSON.parse(cookie);
  }
  return cart;
}

function saveCart(cart) {
  Cookies.set('cart', JSON.stringify(cart));
}