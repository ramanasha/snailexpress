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

//Adding an item to the cart
function renderCart() {
  cart.forEach (function (item) {

  });
}

function renderItem(id) {
  console.log("hello");
  $.get("/api/inventories/" + id)
  .done(function(item) {
    console.log(item);
    $('#cart').append(`
      <div class="row">
        <img class="thumbnail" src="${item.image}">
        <h5>${item.name}</h5>
        <p>${item.quantity} snails</p>
        <p>$${item.price*item.quantity} for ${item.quantity} snails</p>
        <div>
          <input type="number" value="1" /><a href="#" class="button changeItemQty">Change Quantity</a>
        </div>
      </div>
    `);
  })
}

$(document).ready(() => {
  $('#inventory').on('click', '.addToCart', function(evt) {
    evt.preventDefault();

    var $button = $(this);
    var $item = $button.closest('.item');
    var id = $item.data('id');
    var quantity = 1;
    // add item to cart/cookie
    addItem(id, quantity);
    // show item in cart/cookie
    renderItem(id);
  })
});
