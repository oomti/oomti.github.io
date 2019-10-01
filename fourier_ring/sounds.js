let mic, fft;
let pow2size = 2**13;
var data = new Array(pow2size);
var power = new Array(pow2size);
var databuffer = [];
var smoothfft = Array.apply(null, Array(pow2size)).map(Number.prototype.valueOf,0);
var printed = 0;
var samples = 1000;
var sampStart = -5;
var sampEnd = 5;
var sigmaGlob = 0;
var player = document.getElementById('player');
var graph1= [1,2,3,4,5,6,7,8], graph2= [10,9,8,7,6,5,4,3];
var fftPow = graph1
var fftPha=graph2;

var handleSuccess = function(stream) {
  var context = new AudioContext();
  var source = context.createMediaStreamSource(stream);
  var processor = context.createScriptProcessor(pow2size, 1, 1);
  var analyzator = context.createAnalyser();
  


  analyzator.fftSize=pow2size;

  source.connect(analyzator);
  analyzator.connect(processor);

  processor.onaudioprocess = function(e) {
    // Do something with the data, i.e Convert this to WAV
    data= e.inputBuffer.getChannelData(0);
    //analyzator.getFloatFrequencyData(data);
  };
  


};

//navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);


function setup() {
  createCanvas(1100, 400);
  noFill();
  background(200);
} 
var morletWave;

function draw() {
  background(200);
  /*beginShape();
  databuffer = data;
  var zeroes = Array.apply(null, Array(databuffer.length)).map(Number.prototype.valueOf,0);
  if (databuffer.length>0) {
    transformRadix2(databuffer, zeroes);
  
  
  for (i = 0; i < databuffer.length; i++) {
    power[i]=10*Math.log(databuffer[i]**2 + zeroes[i]**2+1);
    smoothfft[i] = (isNaN(smoothfft[i]) ? 0 : smoothfft[i]*.9 ) + power[i] * 0.1;
    vertex(Math.log(i)*100, map(smoothfft[i], -1, 100, height, 0));
  }
  }
  
  endShape();
  */
  stroke(0);
  drawGraph(graph1, width, height); 
  drawGraph(graph2, width, height);
  stroke(255,0,0);
  drawGraph(fftPow, width, height);

  stroke(0,0,255); 
  drawGraph(fftPha, width, height);

}


function morlet(position,frequency) {
  //var sigma = frequency * 2 * Math.PI;
  sigma = frequency;
  var normalizationConst = (1 + Math.exp(-((sigma)**2))- 2*Math.exp(-.75 * ((sigma)**2)))**.5;
  var admissibilityCriterion  = Math.exp(-.5 *((sigma)**2));
  var coeff = normalizationConst * ((Math.PI)**(-.25))  * Math.exp(-.5 * ((position) ** 2) );
  var re = coeff * ( Math.cos(sigma * position) - admissibilityCriterion);
  var im = coeff * ( Math.sin(sigma * position) - admissibilityCriterion);
  return [re,im];
}

function morletFourier(omega, sigFreq) {
  var sigma = sigFreq * 2 * Math.PI;
  var normalizationConst = (1 + Math.exp(-((sigma)**2))- 2*Math.exp(-.75 * ((sigma)**2)))**.5;
  var admissibilityCriterion  = Math.exp(-.5 *((sigma)**2));
  var coeff = normalizationConst * (Math.PI) ** (-1/4) * (Math.exp(-.5 * (sigma - omega)**2 )- admissibilityCriterion * Math.exp(-.5 * (omega)**2));
  return coeff;
 
}

function drawGraph(array, graphWidth , graphHeight  ) {
  beginShape();
  var x,y;
  for (var index=0; index<array.length;index++) {
    x=reScale(index,0,array.length-1,0,graphWidth);
    y=reScale(array[index],Math.min(...array),Math.max(...array),height, height-graphHeight);
    vertex(x,y);

  }
  endShape();


}

function makeGraph(samples, start,end, param1) {
  var arrayReal = new Array(samples);
  var arrayImag = new Array(samples);

  for (i=0; i<samples;i++) {
    arrayReal[i]= morlet(reScale(i , 0, samples-1, start, end), param1)[0];
    arrayImag[i]= morlet(reScale(i , 0, samples-1, start, end), param1)[1];
  }
  return [arrayReal, arrayImag];
}

function reScale(input, inputRangeMin, inputRangeMax, targetRangeMin, targetRangeMax) {
  var output = (input - inputRangeMin)/(inputRangeMax-inputRangeMin)*(targetRangeMax-targetRangeMin) + targetRangeMin;
  return output;
  
}

function desToRad(real,imag) {
  var rad = new Array(real.length);
  var phase = new Array(real.length);
  for (i=0; i<real.length; i++) {
    rad[i] = ((real[i])**2 + (imag[i])**2)**.5;
    phase[i] = Math.atan2(imag[i],real[i]);
  }
  return [rad,phase]
}

function transformAll(real,imag) {
  var tempRe; 
  tempRe= real;
  var tempIm;
  tempIm = imag;

  transformRadix2(tempRe,tempIm);
  [tempRe,tempIm] = desToRad(tempRe,tempIm);
  return [tempRe,tempIm];
}
