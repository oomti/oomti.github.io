function convertCoordinatesTo(x,y,direction){
	if (direction=='SCREEN') return [map(x,0,mapData.width,0,w),map(y,0,mapData.height,0,h)];
	if (direction=='GAME') return [map(x,0,w,0,mapData.width),map(y,0,h,0,mapData.height)];

}

function drawCheckpoints(radius) {
	push();
	colorMode(HSB);
	let x1,y1,x2,y2
	for (let i=0;i<mapData.numCheckpoints;i++) {
		x1=mapData.checkpoints[i].x;
		y1=mapData.checkpoints[i].y;
		x2=mapData.checkpoints[(i+1)%mapData.numCheckpoints].x;
		y2=mapData.checkpoints[(i+1)%mapData.numCheckpoints].y;
		line(...convertCoordinatesTo(x1,y1,'SCREEN'),...convertCoordinatesTo(x2,y2,'SCREEN'));

		
	}
	for (let i=0;i<mapData.numCheckpoints;i++) {
		fill(map(i,0,mapData.numCheckpoints,0,360),100,100);
		x1=mapData.checkpoints[i].x;
		y1=mapData.checkpoints[i].y;
		circle(...convertCoordinatesTo(x1,y1,'SCREEN'),radius);
		
	}
	pop();
}

function drawPod(pod) {
	push();
	fill(`rgba(${pod.velo.absValue()/20+50}%,${pod.velo.absValue()/20+50}%,${pod.score/20}%,${1-pod.timeSinceChkpt/100})`);
	if (pod.timeSinceChkpt<6) fill(color('red'));
	if (pod.shield>0) fill('rgb(0,255,0)');
	circle(...convertCoordinatesTo(pod.pos.x,pod.pos.y,'SCREEN'),map(200,0,mapData.height,0,h));
	line(...convertCoordinatesTo(pod.pos.x,pod.pos.y,'SCREEN'),...convertCoordinatesTo(pod.pos.x+5*pod.velo.x,pod.pos.y+5*pod.velo.y,'SCREEN'));
	stroke('rgb(120,0,255)');
	strokeWeight(3);
	line(...convertCoordinatesTo(pod.pos.x,pod.pos.y,'SCREEN'),
		...convertCoordinatesTo(pod.pos.x+200*Math.cos(pod.faceAngle/180*Math.PI),pod.pos.y+200*Math.sin(pod.faceAngle/180*Math.PI),'SCREEN'));
	pop();
}

function drawPodArray(podArray) {
	push();
	let N=podArray.length;
	let angle=2*Math.PI/N;
	let radius=mapData.chkptRadius/N;
	let marker;
	for (let i=0;i<N;i++) {
		let dist=podArray[i].pos.distance(mapData.checkpoints[podArray[i].nextChkpt])
		if (dist<6000) fill(`rgba(${map(dist,6000,600,100,0)}%,100%,${map(dist,6000,600,100,0)}%,.5)`);
			else fill(`rgba(100%,100%,100%,${1-podArray[i].timeSinceChkpt/100})`);
		marker=new Point(1.2*(mapData.chkptRadius+radius)*Math.cos(i*angle),1.2*(mapData.chkptRadius+radius)*Math.sin(i*angle)).add(mapData.checkpoints[podArray[i].nextChkpt])
		circle(...convertCoordinatesTo(marker.x,marker.y,'SCREEN'),map(radius,0,mapData.height,0,h));
	}
	
	for (let i=0;i<N;i++) {
		drawPod(podArray[i]);
	}
	pop();



}