var displaySize = [];
var dataSize = (2)**11;

var data = new Float32Array(dataSize);
var buffer = new Float32Array(dataSize);
var cumulativeAverage = new Float32Array(dataSize);
var radiusTemp = new Float32Array(dataSize);
var radiusGlob,angleGlob;
var soundSignal = new FFTSignal();
var coloringCarrier = new Float32Array(dataSize);

var handleSuccess = function(stream) {
  var context = new AudioContext();
  var source = context.createMediaStreamSource(stream);
  var processor = context.createScriptProcessor((2)**10, 1, 1);
  var analyzator = context.createAnalyser();


  analyzator.fftSize=dataSize;
  analyzator.smoothingTimeConstant = 0.8;

  source.connect(analyzator);
  analyzator.connect(processor);

  processor.onaudioprocess = function(e) {
    // Do something with the data, i.e Convert this to WAV
    //data= e.inputBuffer.getChannelData(0);
    analyzator.getFloatFrequencyData(data);
    soundSignal.writeBuffer(data);
  };



};

navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);

function setup() {
  createCanvas(displayWidth, displayHeight);
  displaySize=[displayWidth, displayHeight];
  colorMode(HSB,360,100,100,1);
  angleMode(DEGREES);
  [radiusGlob,angleGlob]=dataHandling.fitOctavic(dataSize,height*.45,"spiral","normal");
  radiusTemp=radiusGlob;
}
function draw() {
  background('#000000');

  noFill();
  //buffer = updateCMA(data);
  stroke(color("white"));
  //drawFft(buffer);
  stroke(color("red"));
  //drawFft(cumulativeAverage);
  translate(width/2,height/2);
  //backgroundImage.circles(Math.log(dataSize)/Math.log(2));
  //backgroundImage.spiral(Math.log(dataSize)/Math.log(2));
  //plotRadial2(radiusTemp,radiusGlob,angleGlob);
  //backgroundImage.segments(36);
  //dataHandling.plotRadial(radiusGlob,angleGlob);
  if (typeof soundSignal.signal != 'undefined') {
    soundSignal.readBuffer();
    dataHandling.plotArcs(radiusTemp,angleGlob,coloringCarrier);
    radiusTemp = soundSignal.fitOnRange(radiusGlob,height*.45/10);
    coloringCarrier = soundSignal.fitOnRange(0,100);
  };
}


