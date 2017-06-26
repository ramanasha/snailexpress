$(document).ready(function() {
  let dueTimer = null;
  let order_id;
  let customer_id;

  // update time (current time + 5 sec);
  function udpateDemoTime(id) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        type: 'PUT',
        url: `/api/orders/${id}/update_demo_time?_method=PUT`,
      })
      .done(function(result) {
        updateDueTime(id);
        resolve(result);
      })
      .fail(function(err){
        reject(err);
      })
    });
  }

  // extend or reduce due time
  function updateTime(id, min) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        type: 'PUT',
        url: `/api/orders/${id}/update_time?_method=PUT`,
        data: { min: min }
      })
      .done(function(result) {
        updateDueTime(id);
        resolve(result);
      })
      .fail(function(err){
        reject(err);
      })
    });
  }

  // complete order
  function complete(id) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        type: 'PUT',
        url: `/api/orders/${id}/complete`
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

  // get customer infomation
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

  // get order item
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

  // render customer infomation
  function renderCustomerItems(customer) {
    $("#customer-name").text(customer.name);
    $("#customer-phone").text(customer.phone);
  }

  // render order items
  function renderOrderItems(items) {
    $("#order_detail").show();
    $(".order-items").children().remove();
    items.forEach( function(item, index) {
      $(".order-items").append(createOrderElement(item));
    });
  }

  // start due time checker (check it every 10 sec)
  function startDueTimeChecker(id) {
    updateDueTime(id);
  }

  // get due time from server
  function updateDueTime(id) {
    $.get(`/api/orders/${id}/due`, function(dueTime) {
      $('#dueTimer').countdown(dueTime, {elapse: true})
      .on('update.countdown', function(event) {
        if (event.elapsed) {
          $(this).css("color", "red");
        } else {
          $(this).css("color", "black");
        }
        $(this).html(event.strftime('%H:%M:%S'));
      });
    }).fail(function(err) {
      console.log(err);
    });
  }

  // create order element
  function createOrderElement(item) {
    return `<li>
              <div class="row item-id" data-order-id=${item.order_id}>
                <div class="column small-3 text-center">
                  <img class="thumbnail" src="/images/products/${item.image}">
                </div>
                <div class="column small-9">
                  <h5>${item.name}</h5>
                  x ${item.qty}<br />
                  ${item.price}
                </div>
              </div>
            </li>`;
  }

  $(".orders").click(function(event) {
    order_id = $(this).attr("data-order-id");
    customer_id = $(this).attr("data-customer-id");
    order_status = $(this).attr("data-status");
    getOrderItems(order_id)
    .then(getCustomer(customer_id))
    .then(function() {
      if (order_status === 'incomplete') {
        startDueTimeChecker(order_id);
      } else {
        $('#dueTimer').countdown('stop');
        $('#dueTimer').text("");
      }
    })
    .catch(function(err) {
      console.log(err);
    })
  });

  $("#demo-time").click(function(event) {
    event.preventDefault();
    udpateDemoTime(order_id);
  });

  $("#minus-update-time").click(function(event) {
    event.preventDefault();
    updateTime(order_id, -10);
  });

  $("#plus-update-time").click(function(event) {
    event.preventDefault();
    updateTime(order_id, +10);
  });

  $("#complete").click(function(event) {
    event.preventDefault();
    complete(order_id);
  });

  $("#order_detail").hide();

});
