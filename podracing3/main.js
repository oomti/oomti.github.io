const w=1600*2/3;
const h=900*2/3;




tf.setBackend('cpu');
function preload() {


}

var slider;
function setup() {	
	createCanvas(1200,700);
	angleMode(DEGREES);
	slider = createSlider(0, 350, 10);
	slider.position(10, 10);
	slider.style('width', '80px');
}

mapData.initialize();
simulation.mode='parallel';
model.initialize(200);
simulation.initSimulation(model.podArray);
simulation.notFinished=true;
let score=new Array(model.podArray.length)
a=new NeuralNetwork(9,18,5);
b=new NeuralNetwork(9,18,5);
a.getGradient(b);
function draw() {
	frameRate(slider.value());
	background(120);
	drawCheckpoints(map(600,0,mapData.height,0,h));
	{
		let inputsArray=model.activate(model.podArray,model.podBrains,simulation.controller);
			simulation.oneTurn(model.podArray,inputsArray);

			if (simulation.visualize) {
				drawPodArray(model.podArray);
			}

			simulation.notFinished=false;
			for (let i=0;i<model.podArray.length;i++) {
				if (model.podArray[i].checkWinCondition()==0) {
					simulation.notFinished=true}
				
				if (simulation.mode=='parallel'&&model.podArray[i].checkWinCondition()!=0){
					model.podBrains[i]=model.regenerate(model.podBrains[i],model.podArray[i].score,i);
					model.podArray[i].reset()}

				if (simulation.mode=='batch'&&model.podArray[i].checkWinCondition()!=0) {
					score[i]=model.podArray[i].score}
			}
	}
}