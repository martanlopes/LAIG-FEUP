/**
 * Constructor of a Counter object. It displays info about timeleft to play and number of captured pieces for each side 
 *	
 * @constructor GameHistory
 *
 */

function Counter(scene) {

	CGFobject.call(this,scene);
	this.scene = scene;

	this.initObjects();
	this.initMatrixes();

	this.lastCurrentTime = 0;

};

Counter.prototype = Object.create(CGFobject.prototype);
Counter.prototype.constructor = Counter;


/**
 * Initiates the objects that are part of the counter. 
 *	
 * @method initObjects
 *
 */

Counter.prototype.initObjects = function () {

	this.timer = new Timer(this.scene);
	this.pieceCounter = new PieceCounter(this.scene);
	
}

/**
 * Initiates the transformation matrixes that are used to display the timer and the piece counter. 
 *	
 * @method initMatrixes
 *
 */

Counter.prototype.initMatrixes = function () {

	this.transformMatrix = mat4.create();
 	mat4.identity(this.transformMatrix);
 	mat4.translate(this.transformMatrix, this.transformMatrix, [20, 5, 0]);

 	this.originalTransformMatrix = mat4.create();
 	mat4.identity(this.originalTransformMatrix);
 	mat4.copy(this.originalTransformMatrix, this.transformMatrix);

 	this.camera2Matrix = mat4.create();
	mat4.identity(this.camera2Matrix);
	mat4.translate(this.camera2Matrix, this.camera2Matrix, [0, 0, -13]);
	mat4.rotate(this.camera2Matrix, this.camera2Matrix, -Math.PI / 2, [0, 0, 1]);
	mat4.rotate(this.camera2Matrix, this.camera2Matrix, -Math.PI / 2, [0, 1, 0]);

	this.timerMatrix = mat4.create();
	mat4.identity(this.timerMatrix);
	mat4.translate(this.timerMatrix, this.timerMatrix, [0, 3, 0]);

	this.pieceCounterMatrix = mat4.create();
	mat4.identity(this.pieceCounterMatrix);
	mat4.translate(this.pieceCounterMatrix, this.pieceCounterMatrix, [0, -3, 0]);
	
}


/**
 * Function used to display this object.
 *	
 * @method display
 *
 */

Counter.prototype.display = function () {

	this.scene.pushMatrix();
		this.scene.multMatrix(this.originalTransformMatrix);
		if (this.scene.app.interface.perspective == 'Camera 2') this.scene.multMatrix(this.camera2Matrix);

		this.scene.pushMatrix();
			this.scene.multMatrix(this.pieceCounterMatrix);
			this.pieceCounter.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.multMatrix(this.timerMatrix);
		    this.timer.display();
		this.scene.popMatrix();

	this.scene.popMatrix();
}


/**
 * Function used to update/animate this object.
 *	
 * @method update
 * @param	{int} currTime 	sytem time in ms
 *
 */

Counter.prototype.update = function (currTime) {

	
	var deltaTime = 0;
	
	if (this.lastCurrTime != 0)
		deltaTime = currTime - this.lastCurrTime;

	this.lastCurrTime = currTime;

	if (this.scene.board.initialized) {
		this.timer.update(deltaTime);
		this.pieceCounter.update(deltaTime);
	}
	
}