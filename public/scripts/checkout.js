$(function() {
  function prependErrors(errors, el) {
    // show only first error
    el.prepend(createErrorElement(errors[0]));
  }
  
  function addErrorsBefore(errors, el) {
    // show only first error
    el.before(createErrorElement(errors[0]));
  }
  
  function createErrorElement(error) {
    return $('<div class="small alert callout input-error">' + error + '</div>');
  }
  
  $('form.credit').submit(function(event) {
    var $this = $(this);
    $this.find('.input-error').remove();
    
    var data = {};
    data.contact = {
      name: $this.find('.name').val(),
      phone: $this.find('.phoneno').val()
    };
    
    data.payment = {
      type: "credit",
      credit: {
        card_no: $this.find('.card_number').val(),
        card_cvc: $this.find('.card_cvc').val(),
        card_expiry_month: $this.find('.card_expiry_month').val(),
        card_expiry_year: $this.find('.card_expiry_year').val()
      }
    };
    
    data.order = {
      special_requests: "", // FIXME
      restaurant_id: 1, // temporary for one restaurant
      min: 30, // FIXME need to calculate server side
    };
    
    data.order.items = getCart().map(function(item) {
      return {id: item.inventoryId, qty: item.quantity};
    });
    
    event.preventDefault();
    $.post({
      url: '/api/orders', 
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json'
    })
    .done(function (response) {
      window.location.href = "/order_status/" + response.order_id;
      // FIXME empty cart
    })
    .fail(function (errors) {
      var response = errors.responseJSON;
      console.log(response);
      if (response) {
        if (response["order.items"]) {
          prependErrors(response["order.items"], $this);
        }
        if (response["order.special_requests"]) {
          addErrorsBefore(response["order.special_requests"], $this.find('.special_requests'));
        }
        if (response["contact.name"]) {
          addErrorsBefore(response["contact.name"], $this.find('.name'));
        }
        if (response["contact.phone"]) {
          addErrorsBefore(response["contact.phone"], $this.find('.phoneno'));
        }
        if (response["payment.credit.card_no"]) {
          addErrorsBefore(response["payment.credit.card_no"], $this.find('.card_number'));
        }
        if (response["payment.credit.card_cvc"]) {
          addErrorsBefore(response["payment.credit.card_cvc"], $this.find('.card_cvc'));
        }
        if (response["payment.credit.card_expiry_month"]) {
          addErrorsBefore(response["payment.credit.card_expiry_month"], $this.find('.card_expiry_month'));
        }
        if (response["payment.credit.card_expiry_year"]) {
          addErrorsBefore(response["payment.credit.card_expiry_year"], $this.find('.card_expiry_year'));
        }
        if (response["order.restaurant_id"] ||
            response["order.payment"] ||
            response["order.payment.type"] ||
            response["id"] || // order.items[] error
            response["qty"] // order.items[] error
           ) {
          // shouldn't have this happen... give human error message
          // probably a schema error
          prependErrors(["Something went wrong. Try again later."], $this);
        }
      }
    });
  });
});