/*// Create a neural network
let neuralNet = new NeuralNetwork(9,18,5);
let history =[];
let neuralHistory=[];

function getBestIndex(array) {
	let V=-65536,I=0;
	for (let i=0;i<array.length;i++) {
		if (array[i]>V) I=i;
	}
	return I;
}

for (i=0;i<2;i++) {
	let result,fitness,sum,neuralBatch;
	[fitness,neuralBatch,sum] = NeuralNetwork.simulationTest(neuralNet);
	let best=getBestIndex(fitness);
	history.push(fitness[best]);
	neuralHistory.push(neuralBatch[best]);
	
	neuralNet=neuralBatch[best].copy();
	for (j=0;j<neuralBatch.length;j++) {
		neuralBatch[j].dispose();
	}	
	console.log(i);
}
*/