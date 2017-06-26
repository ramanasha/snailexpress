function createProgressBar(selector, startTime, endTime) {
  var el = $(selector);
  el.hide();
  el.append('<img class="bar-icon" src="/images/bar-icon.jpg">');
  el.append('<div class="bar-container"><span class="bar"></span></div>');
  el.append('<div class="bar-description">Order progress</div>');
  
  var bar = el.find('.bar');
  var img = el.find('img');
  var complete = false;
  
  function updateProgressBar() {
    el.show();
    var interval = endTime.getTime() - startTime.getTime();
    var currentTime = new Date().getTime();
    var factor =  1 - ((endTime.getTime() - currentTime) / interval);
    factor = Math.min(1, factor); // cap it at 1
    var width = factor * 100 + "%";
    bar.css('width', width);
    img.css('left', width);
    if (!complete) {
      setTimeout(updateProgressBar, 200);
    }
  }

  updateProgressBar();
  
  return {
    updateEndTime(time) {
      endTime = time;
    },
    updateStatus(isComplete) {
      complete = isComplete;
    }
  };
}
