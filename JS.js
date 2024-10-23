// --- Variables
// <<< WINDOW
let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight-8;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var mode = 0
var modeText = ["PAUSE", "CIRCLE", "FOLLOW", "ZOOM", "SPEED"];

const audio = new Audio('Calm.mp3');
var touches = 0;

// <<< ORBS
let orbs = 500;
let orbsPos = [];

let mouseClicked = false;
let mousePosX = 0;
let mousePosY = 0;

var lastTime = new Date().getTime();

var m = 1;
var speed = .01;

// <<< COLORS
let orbColor = "#f5f5f5";
let fastColor = ["#fac370", "#fab370", "#fa9a70"];


// --- Functions
// <<< ONLOAD
window.onload = (event) => {
	window.addEventListener('mousedown', mouseCoordinates);
	window.addEventListener('mousemove', mouseMove);
	window.addEventListener('mouseup', mouseRelease);
	window.addEventListener("keydown", keyBoard);

	canvas.addEventListener("touchstart", touchDown, false);
  	canvas.addEventListener("touchend", touchUp, false);
  	canvas.addEventListener("touchmove", touchMove, false);

	ctx.canvas.width = width * .985;
	ctx.canvas.height = height * .98;

	setMusic();
	generateOrbs(0);
}

function setMusic() {
	audio.muted = false;
	audio.loop = true;

	audio.addEventListener("canplaythrough", () => {
	   audio.play().catch(e => {
	      window.addEventListener('click', () => {
	         audio.play();
	      }, {
	         once: false
	      });
	   });
	});
}

setInterval(moveOrbs, 10);

function generateOrbs(extra) {
	for (let i = 0; i < orbs; i++) 
		orbsPos.pop();

	orbs += extra;
	orbs = Math.max(0, orbs);

	for (let i = 0; i < orbs; i++) {
		let orb = new Orb(random(10, width-10), random(10, height-10), 
						  random(5, 10), orbColor, 
						  fastColor[random(0, fastColor.length)], random(15, 30), 
						  true, random(25, 200));
		orbsPos.push(orb);
	}
}

function moveOrbs() {
	if (touches <= 1) {
		ctx.fillStyle = "#111";
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		putText();

		var rightNow = new Date().getTime();
		var elapsedTime = rightNow - lastTime;
		lastTime = rightNow;

		for (let i = 0; i < orbsPos.length; i++)
			if (orbsPos[i] != undefined)
				orbsPos[i].move(elapsedTime);
	}
}

// <<< MOUSE
function mouseCoordinates(event) {
	mouseClicked = true;
	mousePosX = event.pageX;
	mousePosY = event.pageY;

	let orb = new Orb(mousePosX, mousePosY, 20, '#5e52e3', "#999", 30, false, 0);
	orbsPos.push(orb);
}

function mouseMove(event) {
	if (mouseClicked) {
		mousePosX = event.pageX;
		mousePosY = event.pageY;

		orbsPos.pop();
		let orb = new Orb(mousePosX, mousePosY, 20, '#5e52e3', "#999", 30, false, 0);
		orbsPos.push(orb);
	}
}

function mouseRelease(event) {
	mouseClicked = false;
	orbsPos.pop();
}

function keyBoard(event) {
	switch (event.key) {
	case " ":
		event.preventDefault();
		mode = (mode < modeText.length-1) ? mode+1 : 0;
		break;
	case "-":
		generateOrbs(-100);
		break;
	case "=":
		generateOrbs(100);
		break;
	}
}

// <<< TOUCHES
function touchDown(event) {
	event.preventDefault();

	touches = event.touches.length;
	if (touches == 1) {
		mouseClicked = true;
		mousePosX = event.touches[0].pageX;
		mousePosY = event.touches[0].pageY;

		var orb = new Orb(mousePosX, mousePosY, 20, '#5e52e3', "#999", 30, false, 0);
		orbsPos.push(orb);
	} else if (touches == 2) {
		mode = (mode < modeText.length-1) ? mode+1 : 0;
	} else {
		if (orbs >= 1000)
			generateOrbs(-900);
		else
			generateOrbs(100);
	}
}

function touchUp(event) {
	event.preventDefault();

	touches = event.touches.length;
	if (touches == 0) {
		mouseClicked = false;
		orbsPos.pop();
	}
}

function touchMove(event) {
	event.preventDefault();
	
	touches = event.touches.length;
	if (mouseClicked && touches == 1) {
		mousePosX = event.touches[0].pageX;
		mousePosY = event.touches[0].pageY;

		orbsPos.pop();
		var orb = new Orb(mousePosX, mousePosY, 20, '#5e52e3', "#999", 30, false, 0);
		orbsPos.push(orb);
	}
}

// <<< HELPERS
function random(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function putText() {
	ctx.shadowBlur = 0;
	ctx.globalAlpha = .4;
	
	ctx.font = "24px serif";
 	ctx.fillStyle = "#968df0";
  	ctx.fillText("press space", 10, 15);

	ctx.font = "48px serif";
 	ctx.fillStyle = "#968df0";
  	ctx.fillText(modeText[mode], 8, 55);

  	ctx.font = "24px serif";
 	ctx.fillStyle = "#968df0";
  	ctx.fillText(("- " + orbs + " +"), 10, height-20);
}


// --- Class
class Orb {
	constructor(_posX, _posY, _radius, _color, _fast, _stroke, _static, _way) {
		this.posX = _posX;
		this.posY = _posY;
		this.radius = _radius;
		this.static = _static;

		this.color = _color;
		this.fastColor = _fast;
		this.fillColor = _color;
		this.stroke = _stroke;

		this.step = 0;
		this.offset = {x: random(5, 50), y: random(5, 50)};

		this.angle = Math.random() * Math.PI * 2;
		this.inPos = true;
		this.goTo = {x: _posX, y: _posY};
		this.wayLen = _way;

		this.vel = {x: 0, y: 0};

		this.draw();
	}

	draw() {
		ctx.beginPath();

		ctx.globalAlpha = 1;
		ctx.shadowBlur = this.stroke;
		ctx.shadowColor = "white";

		ctx.arc(this.posX + this.vel.x, this.posY + this.vel.y, this.radius, 0, 2 * Math.PI, false);
	   	ctx.fillStyle = this.fillColor;
	    ctx.fill();
	}

	move(elapsedTime) {

		if (this.static) {
			if (mouseClicked) {
				
				switch (mode) {
				case 0:
					this.stop();
					break;
				case 1:
				 	this.aroundMouse(elapsedTime);
				 	break;
				case 2:
				 	this.followSmoothly(elapsedTime, mousePosX, mousePosY, 10);
				 	break;
				case 3:
				 	this.zoom();
				 	break;
				 case 4:
				 	this.accelarate(elapsedTime);
				 	break;
				}

			} else {
				this.fillColor = this.color;
				this.wander(elapsedTime, this.wayLen, 100);
			}
		}

		
		if (this.posX <= 1 || this.posX >= width-1 || this.posY <= 1 || this.posY >= height-1) {
			this.posX = width/2;
			this.posY = height/2;
			this.goTo.x = this.posX-10;
			this.goTo.y = this.posY-10;
		}

		this.draw();
	}

	wander(elapsedTime, way, power) {
		if (this.vel.x != 0) this.vel.x = Math.ceil(this.vel.x * .5);
		if (this.vel.y != 0) this.vel.y = Math.ceil(this.vel.y * .5);

		// step - длина одного прохода
		// elapsedTime - скорость одного прохода
		// angle - возможный угол поворота
		// power - увеличение длины прохода

		if (!this.inPos) {
			if (this.step >= way) {
				this.inPos = true;
				this.step = 0;
			}
			
			this.followSmoothly(elapsedTime*5, this.goTo.x, this.goTo.y, 1)
			this.step += 1;

		} else {
			if (this.goTo.x < -2000) this.goTo.x += 500;
			if (this.goTo.x > 2000)  this.goTo.x -= 500;
			if (this.goTo.y < -2000) this.goTo.y += 500;
			if (this.goTo.y > 2000)  this.goTo.y -= 500;

			this.angle += .1;
			switch (random(0, 4)) {
			case 0:
				this.goTo.x += Math.cos(this.angle) * power;
				this.goTo.y += Math.sin(this.angle) * power;
				break;
			case 1:
				this.goTo.x -= Math.cos(this.angle) * power;
				this.goTo.y += Math.sin(this.angle) * power;
				break;
			case 2:
				this.goTo.x += Math.cos(this.angle) * power;
				this.goTo.y -= Math.sin(this.angle) * power;
				break;
			case 3:
				this.goTo.x -= Math.cos(this.angle) * power;
				this.goTo.y -= Math.sin(this.angle) * power;
				break;
			}

			this.inPos = false;
		}
	}

	stop() {
		this.posX = this.posX;
		this.posY = this.posY;
	}

	aroundMouse(elapsedTime) {
		let radius = 200;
		if (Math.abs(this.posX - mousePosX) > radius || Math.abs(this.posY - mousePosY) > radius)
			this.followSmoothly(elapsedTime, mousePosX, mousePosY, 20);
		else {
			this.followSmoothly(elapsedTime, 
				mousePosX + (radius - this.offset.x) * Math.cos(this.step),
				mousePosY + (radius - this.offset.y) * Math.sin(this.step),
				15);
			this.step += .01;
		}
	}

	followSmoothly(elapsedTime, x, y, power) {
		let moveX = Math.abs(x - this.posX);
		let moveY = Math.abs(y - this.posY);
		let angle = Math.atan(moveY / moveX);

		let s = speed * elapsedTime * power;
		this.posX += (x - this.posX > 0) ? s*Math.cos(angle) : -s*Math.cos(angle);
		this.posY += (y - this.posY > 0) ? s*Math.sin(angle) : -s*Math.sin(angle);
	}

	zoom() {
		let acc = {x: 0, y: 0}

	    let delta = {x: mousePosX - this.posX, y: mousePosY - this.posY}
	    let dist = Math.sqrt( delta.x * delta.x + delta.y * delta.y) || 1;
	    let force = (dist - this.radius) / dist * m;

    	acc.x -= delta.x * force / 6.5;
    	acc.y -= delta.y * force / 6.5;

	    this.vel.x = this.vel.x * .85 + acc.x * m;
	    this.vel.y = this.vel.y * .85 + acc.y * m;
	}

	accelarate(elapsedTime) {
		this.wander(elapsedTime*10, this.wayLen/20, 200);
		this.fillColor = this.fastColor;
	}
}