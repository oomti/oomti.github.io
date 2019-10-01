let boost = 0;
let shield = 0;

function mouseClicked() {
  boost = 1;
}

function mouseWheel(event) {
  shield = 1;

}

function normalize(data,min,max) {
	return (data-min*1.5-max*.5)/((max-min)/2);
}

let PodBrothers = class{
	constructor(size, parentNetwork=new NeuralNetwork(9,18,5), parentScore=0, ancestors=[],ancestorsScores=[]) {
		this.podArray=new Array(size);
		this.brains = new Array(size);
		this.score = new Array(size).fill(0);
		this.parent = parentNetwork;
		this.parentScore=parentScore;
		if (ancestors.length>0) 
			this.parentGradient 
				= tf.substract(parentNetwork.model.getWeights()
					,ancestors[ancestors.length-1].model.getWeights())
		for (let i =0; i<size;i++) {
			podArray[i]=new Pod();
			brains[i] = parentNetwork.clone().mutate(model.mutationProbability,model.mutationRate);
			//tf.add(brains[i].model.getWeights(),
		}
	}
}

let model = {

	storedBestNetworks : 15,
	mutationProbability : .1,
	mutationRate : .1,
	gradientAlpha : .02,

	initialize : function(subjects) {
		this.podArray=new Array(subjects);
		this.podBrains=new Array(subjects);
		for (let i=0;i<subjects;i++) {
			this.podArray[i]=new Pod();
			this.podBrains[i]=new NeuralNetwork(9,18,5).mutate(1,1);
			this.scoredNetworks=new Array(this.storedBestNetworks).fill([-100,0]);
			for (let i=0;i<this.scoredBestNetworks;i++) {
				this.scoredNetworks[i][1]=new NeuralNetwork(9,18,5).mutate(1,1);
			}
		}
	},

	activate : function(podsArray, neuralBatch,method='neural') {
		//----------------------
		if (method=='normal') {
			let mouse=convertCoordinatesTo(mouseX,mouseY,'GAME');
			let target = new Point(mouse[0],mouse[1]);
			let distance = target.clone().substract(podsArray[0].pos);
			let thrust = Math.min(p5.prototype.map(distance.absValue(),0,5000,0,100));
			let inputsArray = new Array(podsArray.length).fill([target,0,0,0])
			inputsArray[0] = [target,thrust,boost,shield];

			boost=0;
			shield=0;
			return inputsArray;
		}

		if (method=='neural') {
			let stateVectors = model.getInput(podsArray);
			let controlVectors =new Array(podsArray.length);
			for (let i=0;i<podsArray.length;i++) {
				controlVectors[i]=this.shapeOutput(neuralBatch[i].predict(stateVectors[i]));
			}
			return controlVectors;
		}
	},

	shapeOutput : function(rawControlVector) {
		let x=p5.prototype.map(rawControlVector[0],-18,18,0,mapData.width);
		x>mapData.width&&(x=mapData.width);
		x<0&&(x=0);
		let y=p5.prototype.map(rawControlVector[1],-18,18,0,mapData.height);
		y>mapData.height&&(y=mapData.height);
		y<0&&(y=0);
		let thrust=Math.round(p5.prototype.map(rawControlVector[2],-18,18,0,100));
		thrust>100&&(thrust=100);
		thrust<0&&(thust=0);
		let boost=rawControlVector[3]>0?1:0;
		let shield=rawControlVector[4]>0?1:0;
		return [new Point(x,y),thrust,boost,shield];
	},

	getInput :function(podsArray) {
    	let output=new Array(podsArray.length);
  		for (let i=0;i<podsArray.length;i++) {
  			output[i]=[
  				normalize(podsArray[i].pos.x,0,mapData.width),
  				normalize(podsArray[i].pos.y,0,mapData.height),
  				normalize(podsArray[i].velo.x,0,100),
  				normalize(podsArray[i].velo.y,0,100),
  				normalize(podsArray[i].faceAngle,-180,180),
  				normalize(mapData.checkpoints[podsArray[i].nextChkpt].x,0,mapData.width),
  				normalize(mapData.checkpoints[podsArray[i].nextChkpt].y,0,mapData.height),
  				normalize(mapData.checkpoints[(podsArray[i].nextChkpt+1)%mapData.numCheckpoints].x,0,mapData.width),
  				normalize(mapData.checkpoints[(podsArray[i].nextChkpt+1)%mapData.numCheckpoints].y,0,mapData.height),
			];
  			
  		}
  		return output;
	},

	regenerate : function(neuralNetwork,score) {

		this.scoredNetworks.push([score,neuralNetwork]);
		this.scoredNetworks=this.scoredNetworks.sort((a,b)=>b[0]-a[0]);
		if (typeof this.scoredNetworks[this.scoredNetworks.length-1][1]!="undefined"
				&&this.scoredNetworks[this.scoredNetworks.length-1][1]!=0) 
			this.scoredNetworks[this.scoredNetworks.length-1][1].dispose();
		this.scoredNetworks.pop();
		console.log(`Best score: ${this.scoredNetworks[0][0]}`)

		return this.scoredNetworks[0][1].clone().mutate(.1,1);
	}
}

let simulation = {

	visualize : true,
	collision : false,
	mode : 'parallel',//possible batch mode
	controller : 'neural',


	initSimulation : function(podsArray) {
		this.time=0;
		this.notFinished=1;
		let startPoint=mapData.checkpoints[0];
		let targetVector=mapData.checkpoints[1].clone().substract(startPoint).normalize();
		let normalVector=new Point(-targetVector.y,targetVector.x);
		for (let i=1;i<=podsArray.length;i++) {
			if (podsArray.length<6) 
				podsArray[i-1].pos=normalVector.clone().multiply(podSetting.podRadius/3.8*i*(i%2?-1:1)).add(startPoint);
			else 
			podsArray[i-1].pos=startPoint.clone();
			podsArray[i-1].faceAngle=targetVector.angle();
			podsArray[i-1].rotate=0;
			podsArray[i-1].nextChkpt=1;
			podsArray[i-1].countChkpt=0
			podsArray[i-1].remainingTime=1;
			podsArray[i-1].timeSinceChkpt=0;
			podsArray[i-1].score=0;
			podsArray[i-1].velo.multiply(0);
		}
	},	

	oneTurn : function(podsArray,inputsArray) {
		this.time++;
		if (this.time==1) {
			for (let i=0;i<podsArray.length;i++) {
				podsArray[i].faceAngle=inputsArray[i][0].clone().substract(podsArray[i].pos).angle();
			}
		}
		for (let i=0;i<podsArray.length;i++) {
			podsArray[i].internalizeInput(...inputsArray[i]);
		}
		if (this.collision) {
			for (let i=0;i<podsArray.length;i++) {
				for (let j=i+1;j<podsArray.length;j++) {
					let collision=podsArray[i].detectPodCollision(podsArray[j]);
					if (collision>0) podsArray[i].handleBounce(collision,podsArray[j]);
				}
			}
		}
		for (let i=0;i<podsArray.length;i++) {
			podsArray[i].step();
			podsArray[i].handleReward();
		}
	},

	turnWrapper : function() {
		let inputsArray=model.activate(podsArray,neuralBatch,this.controller);
			this.oneTurn(podsArray,inputsArray);

			if (this.visualize) {
				drawPodArray(podsArray);
			}

			this.notFinished=false;
			for (let i=0;i<podsArray.length;i++) {
				if (podsArray[i].checkWinCondition()==0) {
					this.notFinished=true}
				
				if (this.mode=='parallel'&&podsArray[i].checkWinCondition()!=0){
					neuralBatch[i]=model.regenerate(neuralBatch[i],podsArray[i].score,i);
					podsArray[i].reset()}

				if (this.mode=='batch'&&podsArray[i].checkWinCondition()!=0) {
					score[i]=podsArray[i].score}
			}
		},

	simulate : function(podsArray,neuralBatch) {
		this.initSimulation(podsArray);
		this.notFinished=true;
		let score=new Array(podsArray.length)

		while (this.notFinished) {
			this.turnWrapper();		
		}
		return score;


	}
}
