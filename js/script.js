(function() {

	/** Config **/

	// Debug mode
	var DEBUG = false;

	// Should mouse control hiding and showing of connections?
	var MOUSE_INPUT = false;

	// Background Color of canvas element
	var BG_COLOR = '#000000';

	// Current point amount
	var POINTS_AMOUNT = 0;

	// Margin of points on canvas (The lower, the more points. Values under 10 might hang the application.)
	var MARGIN = 40;

	// Boundary of point relative to point of origin
	var BOUNDARY = 50;

	// Velocity multipliers
	var VMX = 1.7;
	var VMY = 1.7;

	// Radius multiplier
	var RM = 2.5;

	// Minimum distance for connection to occur
	var MIN_DIST = 50;

	// Connection limit for each point
	var MAX_NEAR = 5;

	// Mouse show radius
	var MOUSE_RADIUS = 500;

	/** End Config **/

	var doublePI = Math.PI * 2;

	var canvas = document.getElementById('canv');
	canvas.style.background = BG_COLOR;

	var ctx = canvas.getContext('2d');
	ctx.font = '10px Arial';

	var mouse = {
		x: canvas.width / 2,
		y: canvas.height / 2
	}

	var points = [];

	function Point(x, y) {
		this.aX = x;
		this.aY = y;
		this.x = Math.random() * (x - (x - BOUNDARY)) + (x - BOUNDARY);
		this.y = Math.random() * (y - (y - BOUNDARY)) + (y - BOUNDARY);
		this.vx = Math.random() * VMX - 1;
		this.vy = Math.random() * VMY - 1;
		this.radius = Math.random() * RM;
		this.opacity = 0.15;
		this.near = [];
	}

	Point.prototype.draw = function() {
		var color = 'rgba(255, 255, 255, ' + this.opacity + ')';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, doublePI);
		ctx.fillStyle = color;
		ctx.fill();
	};

	Point.prototype.drawConnections = function() {
		for (var i = 0; i < this.near.length; i++) {
			var color = 'rgba(92, 193, 211, ' + this.opacity + ')';
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.near[i].x, this.near[i].y);
			ctx.lineWidth = 1.5 - distance(this, this.near[i]) / MIN_DIST;
			ctx.strokeStyle = color;
			ctx.stroke();
		}
	};

	Point.prototype.move = function() {
		if (this.x > canvas.width || this.x < 0) {
			this.vx = -this.vx;
		}

		if (this.y > canvas.height || this.y < 0) {
			this.vy = -this.vy;
		}
		this.x += this.vx;
		this.y += this.vy;
	};

	function drawScene() {
		resizeCanvas();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		findNear();


		for (var i = 0; i < POINTS_AMOUNT; i++) {
			var point = points[i];
			var dist = distance({x: mouse.x, y: mouse.y}, point);

			if (dist < MOUSE_RADIUS) {
				point.opacity = 1 - dist / MOUSE_RADIUS + 0.15;
			} else {
				point.opacity = 0.15;
			}

			point.draw();
			if (!MOUSE_INPUT) {
				point.drawConnections();
			}

			if (point.opacity > 0.3 && MOUSE_INPUT) {
				point.drawConnections();
			}
			point.move();
		}

		if (DEBUG) {
			ctx.rect(2, 5, 95, 145);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
			ctx.fill();
			ctx.fillStyle = 'white';
			ctx.fillText('W: ' + canvas.width, 10, 20);
			ctx.fillText('H: ' + canvas.height, 10, 30);
			ctx.fillText('mX: ' + mouse.x, 10, 40);
			ctx.fillText('mY: ' + mouse.y, 10, 50);
			ctx.fillText('Points: ' + POINTS_AMOUNT, 10, 60);
			ctx.fillText('Margin: ' + MARGIN, 10, 70);
			ctx.fillText('Boundary: ' + BOUNDARY, 10, 80);
			ctx.fillText('VMX: ' + VMX, 10, 90);
			ctx.fillText('VMY: ' + VMY, 10, 100);
			ctx.fillText('RM: ' + RM, 10, 110);
			ctx.fillText('MIN_DIST: ' + MIN_DIST, 10, 120);
			ctx.fillText('MAX_NEAR: ' + MAX_NEAR, 10, 130);
			ctx.fillText('M_RADIUS: ' + MOUSE_RADIUS, 10, 140);
		}

		requestAnimationFrame(drawScene);
	}

	function findNear() {
		for (var i = 0; i < POINTS_AMOUNT; i++) {
			var p1 = points[i];
			p1.near = [];

			for (var j = 0; j < POINTS_AMOUNT; j++) {
				var p2 = points[j];
				if (p1 !== p2) {
					var dist = distance(p1, p2);

					if (dist < MIN_DIST) {
						if (p1.near.length < MAX_NEAR) {
							p1.near.push(p2);
						}
					}
				}
			}
		}
	}

	function distance(p1, p2) {
		var xd = p1.x - p2.x;
		var yd = p1.y - p2.y;
		return Math.sqrt(xd*xd + yd*yd);
	}

	function initEvents() {
		window.addEventListener('resize', resizeCanvas, false);
		canvas.addEventListener('mousemove', mouseHandler, false);
	}

	function initPoints() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = MARGIN; i < canvas.width; i += MARGIN) {
			for (var j = MARGIN; j < canvas.height; j += MARGIN) {
				points.push(new Point(i, j));
				POINTS_AMOUNT++;
			}
		}
	}

	function mouseHandler(e) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	}

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	resizeCanvas();
	initEvents();
	initPoints();
	drawScene();
})();
