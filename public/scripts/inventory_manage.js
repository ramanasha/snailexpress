$(document).ready(function() {
  let isCreateMode = true;
  let itemId = null;
  function resetForm() {
    $("#name").val("");
    $("#price").val("");
    $("#stock").val("");
    $("#weight").val("");
    $("#calories").val("");
    $("#description").val("");
    $("#file").val("");
  }

  function createInventory() {
    // Get form
    let form = $('#form-inventory')[0];
    // Create an FormData object
    let data = new FormData(form);

    $.ajax({
      method: "POST",
      enctype: 'multipart/form-data',
      url: "/api/inventories",
      data: data,
      processData: false,
      contentType: false
    })
    .done(function(result) {
      window.location.href = "/inventory_management";
    })
    .fail(function(err) {
      console.log(err);
    });
  }

  function updateInventory() {
    // Get form
    let form = $('#form-inventory')[0];
    // Create an FormData object
    let data = new FormData(form);
    $.ajax({
      method: "PUT",
      enctype: 'multipart/form-data',
      url: `/api/inventories/${itemId}?_method=PUT`,
      data: data,
      processData: false,
      contentType: false
    })
    .done(function(result) {
      window.location.href = "/inventory_management";
    })
    .fail(function(err) {
      console.log(err.responseText);
    });
  }

  function deleteInventory() {
    // Get form
    let form = $('#form-inventory')[0];
    // Create an FormData object
    let data = new FormData(form);

    $.ajax({
      method: "DELETE",
      url: `/api/inventories/${itemId}?_method=DELETE`,
      data: data,
      processData: false,
      contentType: false
    })
    .done(function(result) {
      window.location.href = "/inventory_management";
    })
    .fail(function(err) {
      console.log(err);
    });
  }

  $("#button-new").click(function(event) {
    event.preventDefault();
    resetForm();
    isCreateMode = true;
    $("#modal-title").text("Create");
  });

  $("#button-submit").click(function(event) {
    event.preventDefault();
    if (isCreateMode) {
      createInventory();
    } else {
      updateInventory();
    }
  })

  $(".button-mod").click(function(event) {
    event.preventDefault();
    isCreateMode = false;
    $("#modal-title").text("Update");
    itemId = $(this).closest(".table-item").find(".item-id").text();
  });

  $(".button-del").click(function(event) {
    event.preventDefault();
    itemId = $(this).closest(".table-item").find(".item-id").text();
    deleteInventory();
  });

  // fill data into form when an inventory clicked
  $(".table-item").click(function(event) {
    $("#name").val($(this).find(".item-name").text());
    $("#price").val($(this).find(".item-price").text().replace("$", ""));
    $("#stock").val($(this).find(".item-stock").text());
    $("#weight").val($(this).find(".item-weight").text());
    $("#calories").val($(this).find(".item-calories").text());
    $("#description").val($(this).find(".item-description").text());
    $("#file").val($(this).find(".item-image").text());
  });

});
