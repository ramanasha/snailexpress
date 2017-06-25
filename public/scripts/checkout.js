$(function() {
  $('form.credit').submit(function(event) {
    var $this = $(this);
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
      restaurants_id: 1, // temporary for one restaurant
      min: 30, // FIXME need to calculate server side
    };
    
      data.order.items = getCart();
    
    console.log(data);
    event.preventDefault();
  });
});