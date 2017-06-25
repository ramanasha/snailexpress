function createProgressBar(selector, startTime, endTime) {
  console.log(startTime, endTime);
  var el = $(selector);
  el.append('<img src="https://placehold.it/100x100" style="position: relative; display:block; transform: translateX(-50%);">');
  el.append('<div class="bar-container" style="background:lightgrey"><span class="bar" style="background: black; height: 10px; display: inline-block"></span></div>');

  var bar = el.find('.bar');
  var img = el.find('img');

  function updateProgressBar() {
    var interval = endTime.getTime() - startTime.getTime();
    var currentTime = new Date().getTime();
    var factor =  1 - ((endTime.getTime() - currentTime) / interval);
    factor = Math.min(1, factor); // cap it at 1
    var width = Math.round(factor * 100, 2) + "%";
    bar.css('width', width);
    img.css('left', width);

    // FIXME we may get an update that extends the progress bar
    if (factor !== 1) {
      setTimeout(updateProgressBar, 50);
    }
  }

  updateProgressBar();
  
  return {
    updateEndTime(time) {
      endTime = time;
    }
  };
}
