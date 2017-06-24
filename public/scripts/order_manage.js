$(document).ready(function() {
  function updateTime(id, min) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        type: 'PUT',
        url: `/api/orders/${id}/update_time?_method=PUT`,
        data: { min: min }
      })
      .done(function(result) {
        resolve(result);
      })
      .fail(function(err){
        reject(err);
      })
    });
  }

  function complete(id) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        type: 'PUT',
        url: `/api/orders/${id}/complete?_method=PUT`
      })
      .done(function(result) {
        window.location.href = "/order_management";
        resolve(result);
      })
      .fail(function(err) {
        reject(err);
      })
    });
  }

  function getCustomer(id) {
    return new Promise(function(resolve, reject) {
      $.get(`/api/customers/${id}/`, function(customer) {
        renderCustomerItems(customer);
        resolve(customer);
      }).fail(function(err) {
        reject(err);
      });
    });
  }

  function getOrderItems(id) {
    return new Promise(function(resolve, reject){
      $.get(`/api/orders/${id}/order_items`, function(items) {
        renderOrderItems(items);
        resolve("success");
      }).fail(function(err) {
        reject(err);
      });
    });
  }

  function renderCustomerItems(customer) {
    $("#customer-name").text(customer.name);
    $("#customer-phone").text(customer.phone);
  }

  function renderOrderItems(items) {
    $("#order_detail").show();
    $(".order-items").children().remove();
    items.forEach( function(item, index) {
      $(".order-items").append(createOrderElement(item));
    });
  }

  function createOrderElement(item) {
    return `<li>
              <div class="row item-id" data-order-id=${item.order_id}>
                <div class="column small-3 text-center"><img class="thumbnail" src="../public/images/products/${item.image}"></div>
                <div class="column small-9">
                  <h5>${item.name}</h5>
                  x ${item.qty}<br />
                  ${item.price}
                </div>
              </div>
            </li>`;
  }

  $(".orders").click(function(event) {
    let order_id = $(this).attr("data-order-id");
    let customer_id = $(this).attr("data-customer-id");
    let current_time = moment(new Date());
    let end_time = moment($(this).attr("data-end-time"));
    // console.log(current_time);
    // console.log(end_time);
    // console.log(end_time.diff(current_time, 'minute'));
    getOrderItems(order_id)
    .then(getCustomer(customer_id))
    .then(function() {
      $("#minus-update-time").click(function(event) {
        updateTime(order_id, -10);
      });
      $("#plus-update-time").click(function(event) {
        updateTime(order_id, +10);
      });
      $("#complete").click(function(event) {
        complete(order_id);
      });
    })
    .catch(function(err) {
      console.log(err);
    })
  });

  $("#order_detail").hide();

});
