
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (Math.floor(max)- Math.ceil(min) + 1)) + min; 
  //The maximum is inclusive and the minimum is inclusive 
}

let mapData = {
	checkpointMin : 2,
	checkpointMax : 8,
	width : 16000,
	height : 9000,
	chkptRadius : 600.0,
	maximumLaps : 6,

	getLapDistance : function() {
		let sum=0;
		this.distances=[]
		for (let i=0;i<this.numCheckpoints;i++) {
			this.distances.push(this.checkpoints[i].distance(this.checkpoints[(i+1)%this.numCheckpoints]));
			sum+=this.distances[i];
		}
		return sum;
	},

	generateCheckpoints : function() {
		for (let i=0;i<this.numCheckpoints;i++) {
			this.checkpoints[i]=new Point(getRandomIntInclusive(this.chkptRadius,this.width-this.chkptRadius)
				,getRandomIntInclusive(this.chkptRadius,this.height-this.chkptRadius));
			let notTested=true;
			
			while (notTested) {
				for (let j=0;j<i;j++) notTested=(notTested&&(this.checkpoints[i].distance(this.checkpoints[j])>2*this.chkptRadius));
				notTested=!notTested;
				if (notTested) this.checkpoints[i].set(getRandomIntInclusive(0,this.width),getRandomIntInclusive(0,this.height));
			}
		}
	},

	initialize : function() {
		this.numCheckpoints=getRandomIntInclusive(this.checkpointMin,this.checkpointMax);
		this.numLaps=getRandomIntInclusive(1,this.maximumLaps);
		this.checkpoints=new Array(this.numCheckpoints);
		this.generateCheckpoints();
		this.totalLapDistance=this.getLapDistance();
		console.log(`Map initialized: ${this.numLaps} laps, ${this.numCheckpoints} checkpoints. Total Distance: ${this.getLapDistance()}`);
	}
}
