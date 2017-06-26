// spriral shape from https://processing.org/discourse/beta/num_1223582667.html
new p5(function(sketch) {
  var timer = 0, w, h, oldMouseX, oldMouseY, canvas;

  sketch.preload = function() {
    w = $('#hypno').width(),
    h = $('#hypno').height();
    console.log(w);
  }

  sketch.setup = function() {
    canvas = sketch.createCanvas(w,h);
  }

  sketch.draw = function() {
    if (sketch.mouseX == oldMouseX && sketch.mouseY == oldMouseY) {
      timer++;
    } else {
      timer = 0;
      $('.instructions').css('display','none');
    }
    oldMouseX = sketch.mouseX;
    oldMouseY = sketch.mouseY;
    if (timer > 30) {
      $('.instructions').css('display','block');
    }

    sketch.noFill();
    sketch.background(255,255,255,127);
    var inc = sketch.mouseX /(w/8) > 1 ? sketch.mouseX /(w/8) : 1;
    var iter = sketch.mouseY /(h/5) > 1 ? sketch.mouseY /(h/5) : 1;
    for (var i = 0; i< iter; i++) {
      //var yR = random(height);
      //var xR = random(width);
      var xR = sketch.noise(i) * canvas.width + sketch.noise(sketch.frameCount) * 10;
      var yR = sketch.noise(iter - i) * canvas.height;
      console.log(xR, yR);
      sketch.push();
      sketch.translate(xR,yR);
      sketch.strokeWeight(2);
      sketch.beginShape();
      sketch.rotate((sketch.frameCount%60)/60 * (2 * sketch.PI));

      for(var j=0;j<1000;j=j+inc) {
        sketch.curveVertex((j*2)*sketch.sin(j/2.0),(j*2)*sketch.cos(j/2.0));
      }

      sketch.endShape();
      sketch.pop();
    }

  }
}, $('#hypno').get(0));
