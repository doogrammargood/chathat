function Square(obj) {
	//obj.nextBoard: char 1-9
	//obj.memberOf: string.
	if (obj===void(0)){
		console.log('Use an empty object with this constructor.');
		obj = {};
	}
	this.token = null;
    this.nextBoard = obj.nextBoard; //a character 1-9 which is used to determine the next board

		var memberOf = obj.memberOf; //the board which this square is in.
		this.identifier = memberOf*9 + this.nextBoard
    isValidSquare = function(mark){
    	if(mark === 'X' || mark === 'O'){
    		return(true);
    	}
    	return(false);
    }

    this.markSquare = function(mark){
		if (isValidSquare(mark)){
			if (this.token){
				console.log('Space is occupied');
				return 'collision';
			}
			this.token = mark;
			return memberOf;
		}else{
			console.log('failed to mark square. Maybe try using upper case?');
		}
	}
}

function Board(obj){
	//obj.name
	var row = [];
	var i = 0;
	var j = 0;
	this.squares = [];
	this.name = obj.name; //0 for the main board
	for (i = 0; i < 3; i++){
		for (j = 0; j < 3; j++){
			row.push(new Square({nextBoard: 3*i+j+1, memberOf: this.name}));
		}
		this.squares.push(row);
		row = [];
	}
	this.winner = null; //changed to 'X' or 'O' when someone wins
	this.isFull = false;
	this.openSquares = 9;

	this.checkVictory = function(lastMove){
		if (lastMove){ //If we're told the last move...
			if (this.squares[lastMove.x][0].token === this.squares[lastMove.x][1].token
				&& this.squares[lastMove.x][1].token === this.squares[lastMove.x][2].token){
					console.log('winner set vertically');
					this.winner = this.squares[lastMove.x][0].token;
					return this.winner;
			}//vertically

			if (this.squares[0][lastMove.y].token === this.squares[1][lastMove.y].token
				&& this.squares[1][lastMove.y].token === this.squares[2][lastMove.y].token){
					console.log('winner set horizontally');
					this.winner = this.squares[0][lastMove.y].token;
					return this.winner;
			}//horizontally

			if (lastMove.x === lastMove.y
				&& this.squares[0][0].token === this.squares[1][1].token
				&& this.squares[1][1].token === this.squares[2][2].token){
					console.log('winner set diagonally');
					this.winner = this.squares[0][0].token;
					return this.winner;
			}//diagonally

			if (lastMove.x + lastMove.y === 2
                && this.squares[0][2].token === this.squares[2][0].token
                && this.squares[2][0].token === this.squares[1][1].token){
									console.log('winner set antidiagonally');
                   this.winner = this.squares[1][1].token;
                   return this.winner;
            }//diagonally the other way
			return null;

		} else{
			console.log("Please pass the last move into the checkVictory function.");
			//TODO: write a function which tests if anyone has won, without looking at the last move.
		}
	}

	this.markSquare = function(obj){
		//obj.index (which square to mark)
		//obj.token ('X' or 'O')
		if (!this.squares[obj.x][obj.y].token){
			this.openSquares -= 1;
			if (this.openSquares === 0 ){
				this.isFull = true;
			}
		}
		board = this.squares[obj.x][obj.y].markSquare(obj.token);
		if(board === 'collision'){
			return 'collision';
		} else {
			return this;
		}
	}
	this.makeMove = function(obj){
		if (this.isFull){
			return('full board');
		} else {
			obj.index -= 1;
			var yIndex = obj.index % 3;
			var xIndex = Math.floor(obj.index/3);
			if(this.markSquare({x: xIndex, y:yIndex, token: obj.token}) === 'collision'){return('collision');}
			return this.checkVictory({x: xIndex, y: yIndex});
		}
	}
}

function isChildBoardOfState(state, identifier){
	var localIdentifier = identifier;
	var localState = state;
	while(state < localIdentifier){
		localIdentifier = parentState(localIdentifier);
		if(state === localIdentifier){
			return(true);
		}
	}
	return(false);
}

function parentState(state){
	if (state===0){ return(0); }
	return(Math.floor((state-1)/9));
}

function wrappedModulus(a,b){
	var result = a % b;
	if (result === 0){
		return(b);
	} else{
		return(result);
	}
}

function Game(obj){
	//obj.playerX
	//obj.playerO
	//obj.numberOfLevels

	this.playerX = obj.playerX;
	this.playerO = obj.playerO;
	this.currentPlayer = 'X';
	this.state = 0; //state tells you which board to play on next. It's an integer.
	this.numberOfLevels = obj.numberOfLevels; //2 is a regular tic tac toe game.
	this.subBoards = [];
	this.hasMoved = false; //This will change become true after the first move has been made. For display purposes.
	//The total number of boards is B=(9^n-1)/8. The other boards will be named '0' + [0..B]
	var numberOfBoards = (9**this.numberOfLevels-1)/8;
	var numberOfNonTerminatingBoards = (9**(this.numberOfLevels-1)-1)/8;
	for (i = 0; i < numberOfBoards; i++){
		this.subBoards.push(new Board({name: i}));
	}
	var modulus = 9**(this.numberOfLevels - 1);
	var smallerModulus = 9**(this.numberOfLevels - 2); //This is an artifact to avoid landing on 009999...

	this.nextState = function(state, play){
		//play is 1-9
		if (this.numberOfLevels === 1){ return(0);} //Quick and dirty fix.
		var newState = wrappedModulus((state*9 + play), 9**(this.numberOfLevels-1));
		if (state < numberOfNonTerminatingBoards/9){
			//This clause is only called when drawing the boards.
		}else if (newState < numberOfNonTerminatingBoards){
			newState += (9**(this.numberOfLevels-1));
		}
		return(newState);
	}

	this.findBoard = function(boardNumber){
	//returns the current board to play on.
		if (boardNumber === void(0)){
			return(this.subBoards[this.state]);
		} else{
				return(this.subBoards[boardNumber]);
			}
	 }

	this.checkVictory = function(){
		this.cascadeVictories = function(){
			var localBoard = this.findBoard();
			var localState = this.state;
			var parentalState = parentState(localState);
			var parentBoard = this.findBoard(parentalState);
			while (localBoard.winner){
				if (localState === 0){
					console.log("and the winner is " + localBoard.winner);
					return(localBoard.winner);}
				parentBoard.makeMove( {index: wrappedModulus( localState, 9), token: this.currentPlayer} );
				localBoard = parentBoard;
				localState = parentalState;
				parentalState = parentState(localState);
				parentBoard = this.findBoard(parentalState);
			}
			return(null);
		}
		return(this.cascadeVictories());
	}

	this.makeMove = function(position){
		var boardToPlayOn = this.state;

		function nextPlayer(currentPlayer){
			if (currentPlayer === 'X'){
				return('O');
			} else {
				return('X');
			}
		}

		this.processInput = function(input){
			//determines if the input was in the active square or not.
			//Sets the boardToPlayOn.
			//Sets input.
			if (isChildBoardOfState(this.state, input)){
			boardToPlayOn = parentState(input);
			return(input - 9*boardToPlayOn);
			}
			else{
				return('outside active board.');
			}
		}
		this.popUntilValid = function(){
			while(this.subBoards[this.state].isFull){
				if (newState === 0){ return('draw'); }
				newState = parentState(newState);
			}
		}
		//position is 1-9
		position = this.processInput(position); //position is now the name of the square. mutates boardToPlayOn.
		if(!position){return('improper input.');}
		if(position === 'outside active board.'){return('outside active board.');}
		var activeBoard = this.findBoard(boardToPlayOn);
		var winner;

		if (activeBoard.makeMove({index: position, token: this.currentPlayer}) === 'collision'){
			return('collision');
		}
		if (winner = this.checkVictory()){ //check for winners
			console.log('we have a winner: ' + winner);
			return winner;
		}
		this.state = this.nextState(boardToPlayOn, position);
		this.popUntilValid();
		this.currentPlayer = nextPlayer(this.currentPlayer);
	}

	this.playMove = function(input){
		if (this.hasMoved === false){
			this.hasMoved = true;
		}
		//any preprocessing can be performed here
			this.makeMove(input);
	}
}

function getBoardLevel(n){
  if (n === 0){
		return(1);
	}
	else{
		for (var i = 0; i < 5; i++){
			if((9**i - 1)/8 > n){
				return(i);
			}
		}
	}
}

function isValidSquareFor(game, number){
	if (getBoardLevel(number) === game.numberOfLevels + 1){
		return true;
	}
	return null;
}
