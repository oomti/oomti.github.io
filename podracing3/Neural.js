class NeuralNetwork  {

  constructor(inputNodes,hiddenNodes,outputNodes){
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    this.createmodel();
    
  }

  createmodel(){
      this.model = tf.sequential();
      let hiddenFirst = tf.layers.dense({
        units: this.hiddenNodes,
        inputShape: [this.inputNodes],
        activation: 'sigmoid'

      });
      this.model.add(hiddenFirst);
      let hiddenInner = tf.layers.dense({
        units: this.hiddenNodes,
        activation: 'sigmoid'

      });
      this.model.add(hiddenInner);
      let output = tf.layers.dense({
        units: this.outputNodes,
        activation: 'linear'
      });
      this.model.add(output);
    }

  clone(){
    return tf.tidy(() => {
      let newNeural=new NeuralNetwork(this.inputNodes,this.hiddenNodes,this.outputNodes);
      const weights = this.model.getWeights();
      let weightsCopies = [];
      for (var i = 0; i < weights.length; i++) {
        weightsCopies[i] = weights[i].clone();
      }
      newNeural.model.setWeights(weightsCopies);
      return newNeural;
    });
  }

  getGradient(neuralB) {
    
      let gradientWeights = [];
      let weightsA = this.model.getWeights();
      let weightsB = neuralB.model.getWeights();
      
      for (let i = 0; i < weightsA.length; i++) {
        let tensorA = weightsA[i];
        let tensorB = weightsB[i];
        let shape = tensorA.shape;
        let valuesA = tensorA.dataSync().slice();
        let valuesB = tensorB.dataSync().slice();

        for (let j = 0; j < valuesA.length; j++) {
          let w=valuesA[j]-valuesB[j];
          valuesA[j] = w;
        }
        let newTensor = tf.tensor(valuesA, shape);
        gradientWeights[i] = newTensor;
      }
      return gradientWeights;
    

  }

  addGradient(gradientWeights, scalar) {
    tf.tidy(() => {
      let multipliedWeights=[]
      let weights = this.model.getWeights();

      for (let i=0;i<weights.length;i++) {
        let tensorGrad = gradientWeights[i];
        let tensor = weights[i];

        let shape = gradientWeights[i].shape;
        let values = tensor.dataSync().slice();
        let valuesGrad = tensorGrad.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          values[j]=values[j]+scalar*valuesGrad[j]
        }
        let newTensor = tf.tensor(values, shape);
        multipliedWeights[i] = newTensor;
      }
      this.model.setWeights(multipliedWeights);
    });
    return this;
  }




  

  mutate(probability,rate) {
    
    tf.tidy(() => {
      let mutatedWeights = [];
      let weights = this.model.getWeights();
      
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (Math.random() < probability) {
            let w = values[j];
            values[j] = w + p5.prototype.randomGaussian(0,rate);
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
    return this;
  }

  predict(inputs){
    let output;
    tf.tidy(() => {
    let xs = tf.tensor2d([inputs]);
    let ys = this.model.predict(xs);
    output = ys.dataSync();
    
    });
    return output;
  }

  dispose(){
    this.model.dispose();
  }

}
