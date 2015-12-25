/**
 * Constructor of a Board object. This object is used to save all the required info to display a board space or a piece. 
 *	
 * @constructor Board
 * @param  {CGFScene}	scene	current scene
 *
 */

function Board(scene) {
	CGFobject.call(this,scene);

	this.scene = scene;

	this.initialized = false;

	this.initPrimitives();

	this.initBoardMatrix();

	this.selectedSpaces = [];
	this.orfanPieces = [];

	this.playing = 'black';
}

Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor= Board;


/**
 * Displays board elements (pieces, orfan pieces and board spaces). 
 *	
 * @method display
 *
 */

Board.prototype.display = function () {

	this.scene.pushMatrix();

	for (var y = 0; y < this.matrix.length; y++)
		for (var x = 0; x < this.matrix[y].length; x++) {
			if (this.initialized) this.scene.registerForPick(y * 13 + x + 1, this.matrix[y][x]);
			this.matrix[y][x].display();
		}

	for (var i = 0; i < this.orfanPieces.length; i++)
		this.orfanPieces[i].display();

	this.scene.popMatrix();
}


/**
 * Saves primitives that are used to display pieces and board spaces in order to don't create them everytime that an object 
 * is initialized.
 *	
 * @method initPrimitives
 *
 */

Board.prototype.initPrimitives = function () {

	this.space = new Cube(this.scene, 2, 0.3, 2);
	
	this.cylinder = new Cylinder(this.scene, 0.2, 0.8, 0.8, 1, 20);
	this.top = new MyCircle(this.scene, 0.8, 20);

}


/**
 * Initializes a default morelli game with black pieces on the borders of the board, registring pieces to picking
 *	
 * @method initBoardMatrix
 *
 */

Board.prototype.initBoardMatrix = function () {

	this.matrix = [];

	for (var y = 0; y < 13; y++) {

		this.matrix.push([]);

		for (var x = 0; x < 13; x++) {

			this.matrix[y].push( new BoardSpace(this.scene, x, y, this.space) );

			if (y == 0 || x == 0 || y == 12 || x == 12) 
				this.matrix[y][x].piece = new Piece(this.scene, this.cylinder, this.top);

		}

	}

}



/**
 * Interprets a board string from ProLog and converts it to JavaScript arrays by regular expressions.
 *	
 * @method intrepertPlBoard
 * @param 	{string} 		plBoard  	a string containing a ProLog formated board 
 * @return 	{array}			board   	represents a game state
 *
 */


 Board.prototype.intrepertPlBoard = function (plBoard) {

 	plBoard = plBoard.substring(plBoard.indexOf("[")+1, plBoard.lastIndexOf("]"));
 	plBoard = plBoard.replace(/\]\,/g, "\|\]\,").replace(/\]$/, "\|\]");
 	var lines = plBoard.match(/\[(.*?)\|/g);
 	var board = [];

 	for (var i = 0; i < lines.length; i++) 
 		board.push(lines[i].match(/(\d|-\d+)/g));


 	this.initialized = true;

 	return board;

 }


 /**
 * Displays new game state.
 *	
 * @method intrepertPlBoard
 * @param	{array}		newMatrix	matrix to be displayed
 *
 */


 Board.prototype.replaceMatrix = function (newMatrix, starting) {
 	
 	for (var y = 0; y < this.matrix.length; y++)
		for (var x = 0; x < this.matrix[y].length; x++) {

			if (this.matrix[y][x].piece != null) {
				if (newMatrix[y][x] == '2' && this.matrix[y][x].piece.color == 'black') {

					this.matrix[y][x].animation = new RotationAnimation('white', 'replace');

				} else if (newMatrix[y][x] == '1' && this.matrix[y][x].piece.color == 'white') {

					this.matrix[y][x].animation = new RotationAnimation('black', 'replace');

				} else if (newMatrix[y][x] == '0' && !starting) {

					this.matrix[y][x].piece = null;
					this.matrix[y][x].animation = new SpringAnimation(-40);

				} else if ((newMatrix[y][x] == '0') && starting) {

					this.matrix[y][x].animation = new RotationAnimation('', 'remove');

				}
			} else {
				if ((newMatrix[y][x] == '1' || newMatrix[y][x] == '2')  && starting) {
					var color = newMatrix[y][x] == '1' ? 'black' : 'white';
					this.matrix[y][x].animation = new RotationAnimation(color, 'insert');
				}
			}

		}

 }


/**
 * Updates the whole board, reponsible for animations.
 *	
 * @method update
 * @param	{int}	currTime	system time
 *
 */

Board.prototype.update = function (currTime) {

	for (var y = 0; y < this.matrix.length; y++)
		for (var x = 0; x < this.matrix[y].length; x++)
			this.matrix[y][x].update(currTime);

	for (var i = 0; i < this.orfanPieces.length; i++) {
		
		if (this.orfanPieces[i] != null)
			if (this.orfanPieces[i].animation == null) {
				this.orfanPieces.splice(i, 1);
			} else {
				this.orfanPieces[i].update(currTime);
			}

	}

}


/**
 * Gets the pick history, animates space, and sends move command to prolog
 *	
 * @method pick
 * @param 	{int}		id 		object custom id
 * @param	{Object}	obj	  	picked object
 *
 */

 Board.prototype.pick = function (id, obj) {

 	obj.animation = new SpringAnimation(-50);

 	if (obj.piece != null) { 
 		this.selectedSpaces[0] = obj;
 	} else if (obj.piece == null) {
 		if (this.selectedSpaces.length) {
 			this.selectedSpaces[1] = obj;
 			var piece = this.selectedSpaces;
 			var boardPlList = this.boardToPlList();

 			var request = 'movePiece(' + boardPlList + ',' + piece[0].y + ',' +
 			 piece[0].x + ',' + piece[1].y + ',' + piece[1].x + ','
 			  + this.playing + 'Player)';

			var obj = new Piece(this.scene, this.cylinder, this.top);
			if (this.playing == 'white') obj.color = 'white';

			this.orfanPieces.push(new OrfanPiece(this.scene, obj, piece[0].x, piece[0].y, piece[1].x, piece[1].y));

 			this.requestToPl(request);
 		}
 		this.selectedSpaces = [];
 	}

 }