function createProgressBar(selector, startTime, endTime, status) {
  var $el = $(selector);
  var $container = $('<div class="container"></div>');
  $el.append($container);
  
  $container.append('<span class="bar-icon"><img src="/images/bar-icon.jpg"></span>');
  $container.append('<div class="bar-container"><span class="bar"></span></div>');
  $container.append('<div class="bar-description"></div>');
  var $bar = $container.find('.bar');
  $bar.hide();
  var $icon = $container.find('.bar-icon');
  $icon.hide();
  var $desc = $container.find('.bar-description');
  
  function updateDescription() {
    var text = "Order " + status.toLowerCase() + ". ";
    
    if (status.toLowerCase() === 'pending') {
      $desc.removeClass('alert success info warning').addClass('warning');
    } else if (status.toLowerCase() === 'processing') {
      if (moment().isBefore(endTime)) {
        $desc.removeClass('alert success info warning').addClass('info');
        text += "Should be ready " + moment(endTime).fromNow() + ".";
      } else if (moment().subtract(5, 'minutes').isBefore(endTime)) {
        $desc.removeClass('alert success info warning').addClass('warning');
        text += "Should have been ready " + moment(endTime).fromNow() + ".";
      } else {
        $desc.removeClass('alert success info warning').addClass('alert');
        text += "Should have been ready " + moment(endTime).fromNow() + ".";
      }
    } else if (status.toLowerCase() === 'complete') {
      $desc.removeClass('alert success info warning').addClass('success');
    } 
    $desc.text(text);
  }
  
  function updateImage() {
    if (status === 'processing') {
      if (moment().subtract(6, 'minutes').isAfter(endTime)) {
        $icon.removeClass('min1 min2 min3 min4 min5 min6').addClass('min6');
      } else if (moment().subtract(5, 'minutes').isAfter(endTime)) {
        $icon.removeClass('min1 min2 min3 min4 min5 min6').addClass('min5');
      } else if (moment().subtract(4, 'minutes').isAfter(endTime)) {
        $icon.removeClass('min1 min2 min3 min4 min5 min6').addClass('min4');
      } else if (moment().subtract(3, 'minutes').isAfter(endTime)) {
        $icon.removeClass('min1 min2 min3 min4 min5 min6').addClass('min3');
      } else if (moment().subtract(2, 'minutes').isAfter(endTime)) {
        $icon.removeClass('min1 min2 min3 min4 min5 min6').addClass('min2');
      } else if (moment().subtract(1, 'minutes').isAfter(endTime)) {
        $icon.removeClass('min1 min2 min3 min4 min5 min6').addClass('min1');
      } else {
        $icon.removeClass('min1 min2 min3 min4 min5 min6');
      }
    } else {
      $icon.removeClass('min1 min2 min3 min4 min5 min6');
    }
  }
  
  function updateProgressBar() {
    if (status !== "pending") {
      $bar.show();
      $icon.show();
    } else {
      $bar.hide();
      $icon.hide();
    }
    
    var interval = endTime.getTime() - startTime.getTime();
    var currentTime = new Date().getTime();
    var factor =  1 - ((endTime.getTime() - currentTime) / interval);
    factor = Math.min(1, factor); // cap it at 1
    var width = factor * 100 + "%";
    $bar.css('width', width);
    $icon.css('left', width);
    
    if (status.toLowerCase() === 'pending') {
      $bar.removeClass('alert success info warning').addClass('warning');
    } else if (status.toLowerCase() === 'processing') {
      if (moment().isBefore(endTime)) {
        $bar.removeClass('alert success info warning').addClass('info');
      } else if (moment().subtract(5, 'minutes').isBefore(endTime)) {
        $bar.removeClass('alert success info warning').addClass('warning');
      } else {
        $bar.removeClass('alert success info warning').addClass('alert');
      }
    } else if (status.toLowerCase() === 'complete') {
      $bar.removeClass('alert success info warning').addClass('success');
    } 
  }

  function updateAll() {
    updateDescription();
    updateImage();
    updateProgressBar();
    setTimeout(updateAll, 200);
  }
  
  updateAll();
  
  return {
    updateEndTime(time) {
      endTime = time;
    },
    updateStatus(newStatus) {
      status = newStatus;
    }
  };
}
