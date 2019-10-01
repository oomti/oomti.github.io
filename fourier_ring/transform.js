var transformQ = {
  freqMin : 15,
  samplingRate : 44100,
  coveredOctaves : 10,
  octaveResolution : 36,
  printFreqs : function() {
    this.size = this.coveredOctaves*this.octaveResolution;
    this.freqs = new Float32Array(this.size);
    this.Q = 1 / ((2)**(1/this.octaveResolution)-1);
    this.freqRange = new Uint32Array(this.size)
    for (var i=0; i<this.size; i++) {
      this.freqs[i]=this.freqMin * (2)**(i / this.octaveResolution);
      this.freqRange[i] = this.samplingRate / this.freqs[i] * this.Q;
      console.log(this.freqs[i], this.freqRange[i]);
    }
  },
  fillFreqCoeffs : function() {
    this.coeffMatrixRe = [];
    this.coeffMatrixIm = [];
    var coeffCurr;
    for (var i=0; i<this.size; i++) {
      this.coeffMatrixRe.push(new Float32Array(this.freqRange[i]));
      this.coeffMatrixIm.push(new Float32Array(this.freqRange[i]));
      for (var j=0; j<this.freqRange[i]; i++) {
        coeffCurr = this.coeff(j, this.freqRange[i]);
        this.coeffMatrixRe[i][j] = coeffCurr[0]*this.filterWindow.hamming(j, this.freqRange[i]);
        this.coeffMatrixIm[i][j] = coeffCurr[1]*this.filterWindow.hamming(j, this.freqRange[i]);
      }
    }
  },
  coeff : function(index, range) {
    var temp = -Math.PI * 2 * this.Q/this.freqRange[index]*index;
    return [Math.cos(temp), Math.sin(temp)];
  },
  filterWindow : {
    hamming : function(index, range) {
      return 25/46 + (1-25/46)*cos(Math.PI*2*index/range);
    }
  }
};

var filters = {
  LPHP : function(data) {
    var lpf = new Float32Array(data.length/2);
    var hpf = new Float32Array(data.length/2);;
    var a,b;
    for (var i=0;i<data.length-1;i=i+2) {
      lpf[i/2] = data[i]/2 + data[i+1]/2;
      hpf[i/2] = data[i]/2 - data[i+1]/2;
    };
  },

}

class FFTSignal {
  constructor() {
    this.inputBuffer = [];
  }
  writeBuffer(input) {
    this.inputBuffer.push(input);
    if (typeof (this.signal) == 'undefined') {
      this.signal = new Float32Array(input.length); 
      this.CMA = new Float32Array(input.length);
      this.temporalMaxim = new Float32Array(input.length);
      this.temporalMin = new Float32Array(input.length);
      this.count = 0;
    };
  }
  readBuffer() {
    while (this.inputBuffer.length>0) {
      this.signal = this.inputBuffer.shift();
      this.count++;
      for (var i=0; i<this.signal.length;i++) {
        this.CMA[i] = this.CMA[i] * (1 - 1/(this.count)**.9) + this.signal[i] /(this.count)**.9;
        //this.signal[i] = this.signal[i] - this.CMA[i];
        (this.signal[i]<this.temporalMaxim[i] ? this.temporalMaxim[i]-=.01 : this.temporalMaxim[i]=Math.abs(this.signal[i]));
        (this.signal[i]>this.temporalMin[i] ? this.temporalMin[i]*=1.01 : this.temporalMin[i]=Math.abs(this.signal[i]));

      };

    }
  }
  fitOnRange(rangeMin,rangeMax) {
    var fittedResult = new Float32Array(this.signal.length);
    for (var i=0;i<this.signal.length;i++) {
      fittedResult[i] = map(this.signal[i],this.CMA[i]-15,-20,(rangeMin.length>1 ? rangeMin[i] : rangeMin),(rangeMin.length>1 ? rangeMin[i] : 0 )+rangeMax);
    };
    return fittedResult;
  }

}                                 
