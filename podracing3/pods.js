const podSetting = {

	turnRate : 18.0,
	friction : .85,
	podRadius : 400.0,
	minImpulse : 120

}

function readline() {}


let Point = class {
	constructor(x,y){
		this.x=x;
		this.y=y;
	}
	clone() {
		return new Point(this.x,this.y);
	}
	set(x,y){
		this.x=x;
		this.y=y;
	}
	add(b){
		this.x+=b.x;
		this.y+=b.y;
		return this;
	}
	substract(b){
		this.x-=b.x;
		this.y-=b.y;
		return this;
	}
	multiply(c){
		this.x*=c;
		this.y*=c;
		return this;
	}
	divide(c){
		this.x/=c;
		this.y/=c;
		return this;
	}
	dot(b){
		return this.x*b.x+this.y*b.y;
	}
	angle(){
		return Math.atan2(this.y,this.x)*180/Math.PI;
	}
	equals(b){
		return this.x == b.x && this.y == b.y
	}
	normalize(){
		return this.divide(this.absValue());
	}
	absValue(){
		return Math.sqrt(this.dot(this));
	}
	static getNorm(angle) {
		return new Point(Math.cos(angle*Math.PI/180),Math.sin(angle*Math.PI/180))
	}
	distance(pointB){
		return this.clone().substract(pointB).absValue();
	}

}


/*loadMap: {
	const map = {
		laps : parseInt(readline()),
		checkpointCount : parseInt(readline()),
		checkpoints : []}
	for (let i = 0; i < map.checkpointCount; i++) {
		var inputs = readline().split(' ').map(Number);
		map.checkpoints.push(new Point(inputs[0],inputs[1]));
	}
}
*/
let Pod = class {
	constructor(x=0.0,y=0.0,vx=0.0,vy=0.0,angle=0.0,chkptId=0,count=0,shield=.0,veloAngle=.0,rotate=.0,boostCount=2){
		this.pos=new Point(x,y);
		this.velo=new Point(vx,vy);
		this.faceAngle=angle;
		this.nextChkpt=chkptId;
		this.countChkpt=count;
		this.shield=shield;

		this.veloAngle=veloAngle;
		this.boostCount=boostCount;

		this.rotate=rotate;
		this.remainingTime=1;
		this.timeSinceChkpt=0;
		this.score= 0;
		this.win=0;

	}

	reset() {
		this.pos.x=mapData.checkpoints[0].x
		this.pos.y=mapData.checkpoints[0].y
		this.velo.x=0;
		this.velo.y=0;
		this.faceAngle=this.pos.clone().substract(mapData.checkpoints[1]).angle();
		this.nextChkpt=1;
		this.countChkpt=0;
		this.shield=0;

		this.veloAngle=0;
		this.boostCount=2;

		this.rotate=0;
		this.remainingTime=1;
		this.timeSinceChkpt=0;
		this.score= 0;
		this.win=0;
	}
	clone(){
		return new Pod(
			this.pos.x,
			this.pos.y,
			this.velo.x,
			this.velo.y,
			this.faceAngle,
			this.nextChkpt,
			this.countChkpt,
			this.shield,
			this.veloAngle,
			this.rotate,
			this.boostCount)
	}
	parser(){
		var tempChkpt=this.nextChkpt;
		[	this.pos.x
			,this.pos.y
			,this.velo.x
			,this.velo.y
			,this.faceAngle
			,this.nextChkpt
		]=readline().split(' ').map(Number);
		(this.faceAngle>180.)&&(this.faceAngle-=360.);
		tempChkpt!=this.nextChkpt&&this.countChkpt++
	}
	
	internalizeInput(tPoint,thrust,boost,shield){
		boost&&(this.boostCount&&(thrust=650.,this.boostCount--)||(thrust=100.));
		shield&&(this.shield=3.)&&(thrust=.0);
		this.shield>.0&&(this.shield--,thrust=.0);
		//Make rotation
		this.rotate = tPoint.substract(this.pos).angle()-this.faceAngle;
		//(Math.abs(rotate)>180)&&(this.rotate=-Math.sign(this.rotate)*(360-this.rotate));
		this.faceAngle += Math.abs(this.rotate)>18 
			? (Math.abs(this.rotate)>180
				?-Math.sign(this.rotate)*podSetting.turnRate
				:Math.sign(this.rotate)*podSetting.turnRate) 
			: this.rotate;

		Math.abs(this.faceAngle)>180&&(this.faceAngle-=Math.sign(this.faceAngle)*360); 

		this.velo
			.multiply(podSetting.friction)
			.add(Point.getNorm(this.faceAngle)
				.multiply(thrust));        

		this.veloAngle=this.velo.angle();

		this.remainingTime=1.0
	}

	detectCollision(tPoint,tVelo,tRadius, remainingTime=1.0){
		let tVector=tPoint.clone().substract(this.pos);
		tVelo.multiply(remainingTime);

		if ((Math.abs(tVector.x)-Math.abs(tVelo.x)>tRadius)||(Math.abs(tVector.y)-Math.abs(tVelo.y)>tRadius)) {
			return -4;
		}

		let absSpeed=tVelo.absValue();		
		let tDistance=tVector.absValue();

		if (tDistance-tRadius-absSpeed>0) {
			return -3;
		}

		let angleDifference=tVelo.angle()-tVector.angle();

		let trajectoryDistance=tDistance*Math.abs(Math.sin(angleDifference/180*Math.PI));

		if(trajectoryDistance>=tRadius) {
			return -2;
		}

		let closestPointDistance_fThis=tDistance*Math.cos(angleDifference/180*Math.PI);
		let collisionDistance=closestPointDistance_fThis-Math.sqrt(Math.pow(tRadius,2)-Math.pow(trajectoryDistance,2));

		if (collisionDistance>absSpeed) {
			return -1;
		}

		return collisionDistance/absSpeed;
	}

	detectPodCollision(pod_B){
		let tVelo=this.velo.clone().substract(pod_B.velo);
		return this.detectCollision(pod_B.pos,tVelo,podSetting.podRadius,this.remainingTime)

	}

	handleBounce(collisionTime,podB) {
		this.pos
			.add(this.velo
				.clone()
				.multiply(collisionTime));

		podB.pos
			.add(podB.velo
				.clone()
				.multiply(collisionTime));

		let m_A=(this.shield>0?10:1);
		let m_B=(podB.shield>0?10:1);

		let collisionNormalVec=this.pos.clone().substract(podB.pos).normalize();
		let moment_A_1 = m_A*this.velo.dot(collisionNormalVec);
		let moment_B_1 = m_B*podB.velo.dot(collisionNormalVec);

		let velocityDifference=this.velo.clone().substract(podB.velo);

		this.velo
			.substract(collisionNormalVec.clone()
				.multiply(2*m_B/(m_A+m_B)
					*velocityDifference.dot(collisionNormalVec)));

		podB.velo
			.substract(collisionNormalVec.clone()
				.multiply(-2*m_A/(m_A+m_B)
					*velocityDifference.multiply(-1)
						.dot(collisionNormalVec.multiply(-1))));

		let moment_A_2 = m_A*this.velo.dot(collisionNormalVec);
		let moment_B_2 = m_B*podB.velo.dot(collisionNormalVec);

		let impulse= Math.abs(moment_A_1) + Math.abs(moment_A_2);

		if (impulse<podSetting.minImpulse) {
			collisionNormalVec.multiply(podSetting.minImpulse/impulse);
			podB.velo.add(collisionNormalVec);
			this.velo.substract(collisionNormalVec);
		}

		this.remainingTime-=collisionTime;
		podB.remainingTime-=collisionTime;
	}

	step(){

		this.pos
			.add(this.velo.clone().multiply(this.remainingTime))
		this.remainingTime=1;
		this.velo.x = Math.trunc(this.velo.x); 
		this.velo.y = Math.trunc(this.velo.y);
		this.pos.x = Math.round(this.pos.x); 
		this.pos.y = Math.round(this.pos.y);
	}

	handleReward() {
			let chkptDist;
		if (this.timeSinceChkpt>49) {
			chkptDist=mapData.checkpoints[this.nextChkpt]
						.clone()
						.substract(mapData.checkpoints[(this.nextChkpt-1)<0?mapData.numCheckpoints-1:this.nextChkpt-1])
						.absValue();
			this.score+=(chkptDist
							-mapData.checkpoints[this.nextChkpt]
								.clone().substract(this.pos).absValue()
						)/chkptDist;

			this.win=-1;
		}
		if (this.pos.distance(mapData.checkpoints[this.nextChkpt])<mapData.chkptRadius) {
			this.nextChkpt=(this.nextChkpt+1)%mapData.numCheckpoints;
			if (this.countChkpt==mapData.numLaps*mapData.numCheckpoints) {
				this.score+=1000;
				this.win=1;
			}
			this.countChkpt++;
			this.score+=(100-this.timeSinceChkpt)/20;
			this.timeSinceChkpt=0;

		} else {
			this.timeSinceChkpt++;
		}
	}

	checkWinCondition() {
		return this.win;
	}

	static handleAllBounce(){

	}

}

/*	
var pod1 = new Pod();
var pod2 = new Pod();
var oPod1 = new Pod();
var oPod2 = new Pod();

var time;
var iterator=0;

// game loop
while (true) {
	
	pod1.parser();
	pod2.parser();
	oPod1.parser();
	oPod2.parser();
	time=Date.now();
	for (var i=0;i<1000000;i++) {let a=iterator;}
	console.error(Date.now()-time);
	// Write an action using console.log()
	// To debug: console.error('Debug messages...');

	iterator++
	// You have to output the target position
	// followed by the power (0 <= thrust <= 100)
	// i.e.: "x y thrust"
	console.log(map.checkpoints[pod1.nextChkpt].join(' ')+ ' 100');
	console.log(map.checkpoints[pod2.nextChkpt].join(' ')+ ' 100');
}
*/