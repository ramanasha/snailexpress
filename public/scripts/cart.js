function addItem (inventoryId, quantity){
  var cookie = Cookies.get('cart');
  var cart;
  if (!cookie) {
    cart = [];
  } else {
    cart = JSON.parse(cookie);
  }
  cart.push({
    "inventoryId": inventoryId,
    "quantity": quantity
  })
  Cookies.set('cart', JSON.stringify(cart));
}

function updateItem (inventoryId, quantity) {
  var cookie = Cookies.get('cart');
  var cart;
  if (!cookie) {
    cart = [];
  } else {
    cart = JSON.parse(cookie);
  }
  for (var item of cart) {
    if (item.inventoryId === inventoryId) {
       item.quantity = quantity;
    }
  }
  Cookies.set('cart', JSON.stringify(cart));
}

function deleteItem (inventoryId) {
  var cookie = Cookies.get('cart');
  var cart;
  if (!cookie) {
    cart = [];
  } else {
    cart = JSON.parse(cookie);
  }
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].inventoryId === inventoryId) {
      cart.splice(i, 1);
      break;
    }
  }
  Cookies.set('cart', JSON.stringify(cart));
}
