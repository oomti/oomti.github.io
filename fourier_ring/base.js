var backgroundImage = {
  circles : function(numCircles) {

    var dMax = height;
    for (var i=1; i<=numCircles; i++) {
      stroke(map(i, 0, numCircles, 0, 360),100,100);
      circle(0,0,map(i,0,numCircles, 0, dMax*.45));
    }
  },
  
  spiral : function(numSteps) {
    push();
    rotate(-90);
    var radius = 0;
    var angle = 0; 
    var x,y;
    var factorAlpha = (height*.45)/360/numSteps;
    noFill();
    beginShape();
    while (angle<360*numSteps) {
      stroke(180,100,30);
      radius = factorAlpha*angle;
      x = cos(angle)*radius;
      y = sin(angle)*radius;
      if (radius > height*.45/12) {
        vertex(x,y);
      };
      angle = angle+ 5;
    }
    endShape();
    pop();  
  },
 
  segments : function(segmentNumber) {
    push();
  
    rotate(180-360/segmentNumber/2)
    for (var i=0; i<segmentNumber; i++) {
      stroke(360/(segmentNumber-1)*i,100,100);
      line(0,height*.45/12,0,height*.5);
      rotate(360/segmentNumber);
    }
    pop();  
  }
};

var dataHandling = {
  tones : 36,
  width : 1000,
  height : 800,

  //mode: spiral, expspiral, circular, 
  //scaling: normal, log, other?
  fitOctavic : function(dataSize,radMax,mode = "spiral", scaling="normal") {
    var radius = new Float32Array(dataSize);
    var angle = new Float32Array(dataSize);
    var i;
    switch(scaling) {
      case "normal":
        for (i=0; i<dataSize;i++) {
          angle[i] = Math.log(i+1)/Math.log(2)*360;
        };
        break;
      case "log":
        for (i=0; i<dataSize;i++) {
          angle[i] = i*360/this.tones;
        };
        break;
    };
    switch(mode) {
      case "spiral":
        var factorAlpha = (radMax)/360/Math.floor(Math.log(dataSize)/Math.log(2));
        for (i=0;i<dataSize;i++) {
          radius[i]=angle[i]*factorAlpha;
        };
        break;
      case "circular":
        for (i=0;i<dataSize-1;i++) {
          radius[i] = map(Math.floor(angle[i]/360), 0, Math.floor(angle[angle.length-1]/360), 0 , radMax);
        };
        break;
    }
  return [radius, angle];
  },

  plotRadial : function(radius,angle) {
    var x,y;
    push();
    rotate(-90);

    for (var i=0; i<radius.length;i++) {
    x = radius[i]*cos(angle[i]);
    y = radius[i]*sin(angle[i]); 
    stroke(angle[i]%360,100,100);
    
    circle(x,y,2);  

    };
    pop();
  },

  plotArcs : function(radius,angle,coloring) {
    push();
    rotate(-90);
    var previous=0;
    for (var i=0;i<radius.length-25;i=i+5**Math.floor(Math.log(i+1)/Math.log(200))) {
      end = angle[i]+(angle[i+5**Math.floor(Math.log(i+1)/Math.log(200))]-angle[i])/2;
      //end = angle[i+5**Math.floor(Math.log(i+1)/Math.log(100))]
      start =angle[i]-(angle[i]-angle[previous])/2;  
      stroke(angle[i]%360,100,coloring[i]);
      strokeWeight(coloring[i]/20);
      arc(0,0,radius[i]*2,radius[i]*2,start,end);
      previous=i;
    };
    pop();
  },
  
  plotCartesian : function(x,y) {
        

  } 
};


