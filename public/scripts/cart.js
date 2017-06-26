function getCart (){
  var cookie = Cookies.get('cart');
  var cart;
  if (!cookie) {
    cart = [];
  } else {
    cart = JSON.parse(cookie);
  }
  return cart;
}

function getCartItemById(cart, id) {
  return cart.find((cartItem) => cartItem.inventoryId === id)
}
function addItem (inventoryId, quantity){
  var cart = getCart();
  var existingCartItem = getCartItemById(cart, inventoryId);
  if (existingCartItem) {
    existingCartItem.quantity = parseInt(existingCartItem.quantity) + parseInt(quantity);
  } else {
    cart.push({
      inventoryId,
      quantity
    });
  }

  Cookies.set('cart', JSON.stringify(cart));
}

function updateItem (inventoryId, quantity) {
  var cart = getCart();
  for (var item of cart) {
    if (item.inventoryId === inventoryId) {
       item.quantity = quantity;
    }
  }
  Cookies.set('cart', JSON.stringify(cart));
}

function removeItem (inventoryId) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].inventoryId === inventoryId) {
      cart.splice(i, 1);
      break;
    }
  }
  Cookies.set('cart', JSON.stringify(cart));
}

// //http://spin.js.org/
// function loadingSpinner () {
//   var opts = {
//     lines: 13 // The number of lines to draw
//   , length: 28 // The length of each line
//   , width: 14 // The line thickness
//   , radius: 42 // The radius of the inner circle
//   , scale: 1 // Scales overall size of the spinner
//   , corners: 1 // Corner roundness (0..1)
//   , color: '#000' // #rgb or #rrggbb or array of colors
//   , opacity: 0.25 // Opacity of the lines
//   , rotate: 0 // The rotation offset
//   , direction: 1 // 1: clockwise, -1: counterclockwise
//   , speed: 1 // Rounds per second
//   , trail: 60 // Afterglow percentage
//   , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
//   , zIndex: 2e9 // The z-index (defaults to 2000000000)
//   , className: 'spinner' // The CSS class to assign to the spinner
//   , top: '50%' // Top position relative to parent
//   , left: '50%' // Left position relative to parent
//   , shadow: false // Whether to render a shadow
//   , hwaccel: false // Whether to use hardware acceleration
//   , position: 'absolute' // Element positioning
//   }
// var target = document.getElementById('foo')
// var spinner = new Spinner(opts).spin(target);
//   $('#mySpinner').addClass('spinner');
//   success: (data) => {
//     //the spinner will disappear when the data is successfully shown on page
//     $('#mySpinner').removeClass('spinner');
// }

//Shows cart items
function renderCart() {
  var cart = getCart();

  // Cart is empty case
  if (cart.length === 0) {
    $('#cart').children().remove();
    $('#cart').html('<div>Cart is empty.</div>');
    return;
  }

  $('#cart').children().remove();

  $('#cart').html('<div>Loading...</div>');
  // loadingSpinner();

  var allItems = Promise.all(cart.map((cartItem) => $.get("/api/inventories/" + cartItem.inventoryId)));
  allItems.then((items) => {
    $('#cart').children().remove();

    items.sort((a, b) => a.name > b.name);
    items.forEach((item) => {
      renderItem(item, getCartItemById(cart, item.id).quantity);
    });
    if (items.length > 0) {
      $('#cart').append('<a href="/checkout" class="button" style="display:block; margin-top:12%">Check Out</a>');
    }

    cartUpdated();

  });
}
function renderItem(item, quantity) {
  $('#cart').append(`
    <div class="row cart-item" data-id="${item.id}">
      <img class="thumbnail" src="${item.image}">
      <h5>${item.name}</h5>
      <p>${quantity} package(s)</p>
      <p>Price: $${item.price}</p>
      <p>Total Price: $${item.price*quantity}</p>
      <div>
        <input type="number" id="update-quantity-${item.id}" value="${quantity}" />
        <button class="button change-cart-item-quantity">Change Quantity</button>
      </div>
      <div>
        <button class="button remove-cart-item">Remove</button>
      </div>
    </div>
  `);
}

//updating cart event handlers
function cartUpdated() {
  $('.change-cart-item-quantity').on('click', function(evt){
    evt.preventDefault();
    var $button = $(this);
    var $item = $button.closest('.cart-item');
    var id = $item.data('id');
    var quantity = $(`#update-quantity-${id}`).val();
    updateItem(id, quantity);
    renderCart();
  });
  $('.remove-cart-item').on('click', function(evt){
    evt.preventDefault();
    var $button = $(this);
    var $item = $button.closest('.cart-item');
    var id = $item.data('id');
    removeItem(id);
    renderCart();
  });
}

$(document).ready(() => {
  //page loads
  renderCart();

  //clicking on Add to Cart event handler
  $('#inventory').on('click', '.addToCart', function(evt) {
    evt.preventDefault();
    var $button = $(this);
    var $item = $button.closest('.item');
    var id = $item.data('id');
    var quantity = $(`#add-quantity-${id}`).val();
    console.log(quantity);
    // add item to cart/cookie
    addItem(id, quantity);
    $(`#add-quantity-${id}`).val(1);
    // show item in cart/cookie
    // renderItem(id);
    renderCart();
  })
});
