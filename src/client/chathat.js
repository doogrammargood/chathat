function Square(obj) {
	//obj.nextBoard: char 1-9
	//obj.memberOf: string.
	if (obj===void(0)){
		console.log('Use an empty object with this constructor.');
		obj = {};
	}
	this.token = null;
    this.nextBoard = obj.nextBoard; //a character 1-9 which is used to determine the next board

		this.memberOf = obj.memberOf; //the board which this square is in.
		this.identifier = this.memberOf*9 + this.nextBoard
    isValidSquare = function(mark){
    	if(mark === 'X' || mark === 'O'){
    		return(true);
    	}
    	return(false);
    }

    this.markSquare = function(mark){
		if (isValidSquare(mark)){
			if (this.token && this.memberOf.isTerminal){
				console.log('Space is occupied');
				return 'collision';
			}
			this.token = mark;
			return this.memberOf;
		}else{
			console.log('failed to mark square. Maybe try using upper case?');
		}
	}
}

function Board(obj){
	//obj.name
	//obj.isTerminal
	var row = [];
	var i = 0;
	var j = 0;
	this.squares = [];
	this.name = obj.name; //0 for the main board
	this.isTerminal = obj.isTerminal;
	for (i = 0; i < 3; i++){
		for (j = 0; j < 3; j++){
			row.push(new Square({nextBoard: 3*i+j+1, memberOf: this.name}));
		}
		this.squares.push(row);
		row = [];
	}
	this.winner = null; //changed to 'X' or 'O' when someone wins
		this.horizontalWins = [null, null, null]; //This keeps track of all the ways you could win horizontally.
		this.verticalWins = [null, null, null]; //All the ways you could win vertically
		this.diagonalWins = [null, null]; //Both the ways you could win diagonally.

	this.findWinner = function(){
		var totalWins = [this.horizontalWins, this.verticalWins, this.diagonalWins];
		var flattenedWins = [].concat.apply([], totalWins); //flattenedWins is a
		var numX = flattenedWins.filter(tok => tok === 'X').length;
		var numO = flattenedWins.filter(tok => tok === 'O').length;
		if (numX === numO && numO === 0) {return(null);} //nobody's a winner
		else if (numX > numO){return('X');}
		else if (numX < numO){return('O');}
		else if (numX === numO){return('tie board');}
		else {console.log('error in the findWinner function.');}
		}
	this.isFull = false;
	this.openSquares = 9;

	this.updateVictories = function(lastMove){
		if (lastMove){ //If we're told the last move...
			if (this.squares[lastMove.x][0].token === this.squares[lastMove.x][1].token
				&& this.squares[lastMove.x][1].token === this.squares[lastMove.x][2].token){
					console.log('winner set horizontally');
					this.horizontalWins[lastMove.x] = this.squares[lastMove.x][0].token;
					//this.winner = this.squares[lastMove.x][0].token;
			} else {this.horizontalWins[lastMove.x] = null;}
			//horizontally

			if (this.squares[0][lastMove.y].token === this.squares[1][lastMove.y].token
				&& this.squares[1][lastMove.y].token === this.squares[2][lastMove.y].token){
					console.log('winner set vertically');
					this.verticalWins[lastMove.y] = this.squares[0][lastMove.y].token;
					//this.winner = this.squares[0][lastMove.y].token;
			} else {this.verticalWins[lastMove.y] = null;}
			//vertically

			if (lastMove.x === lastMove.y
				&& this.squares[0][0].token === this.squares[1][1].token
				&& this.squares[1][1].token === this.squares[2][2].token){
					console.log('winner set diagonally');
					this.diagonalWins[0] = this.squares[0][0].token;
					//this.winner = this.squares[0][0].token;
			} else {this.diagonalWins[0] = null;}
			//diagonally

			if (lastMove.x + lastMove.y === 2
                && this.squares[0][2].token === this.squares[2][0].token
                && this.squares[2][0].token === this.squares[1][1].token){
									console.log('winner set antidiagonally');
                   this.diagonalWins[1] = this.squares[1][1].token;
    	} else {this.diagonalWins[1] = null;}
			//diagonally the other way
			return null;

		} else{
			console.log('Please pass the last move into the updateVictories function.')
			//If we are not told the last move, we need to check all 8 possible ways to win.
			var wins = [];
			var temp = null;
			for (var i = 0; i < 3; i++){
				if (this.squares[0][i] === this.squares[1][i]
					&& this.squares[1][i] === this.squares[2][i]){
						//verticals
						this.verticalWins[i](this.squares[0][i]);
					} else {this.verticalWins[i] = null;}
				if (this.squares[i][0] === this.squares[i][1]
					&& this.squares[i][1] === this.squares[i][2]){
						//horizontals
						this.horizontalWins[i] = this.squares[i][0];
					} else {this.horizontalWins[i] = null;}
				if (this.squares[0][0] === this.squares[1][1]
					&& this.squares[1][1] === this.squares[2][2]){
						//diagonal
						this.diagonalWins[0] = this.squares[0][0];
					} else {this.diagonalWins[0] = null;}
				if (this.squares[2][0] === this.squares[1][1]
					&& this.squares[1][1] === this.squares[0][2]){
						//antiDiagonal
						this.diagonalWins[1] = this.squares[2][0];
					} else {this.diagonalWins[1] = null;}
			}
		}
	}

	this.checkVictory = function(lastMove){
		this.updateVictories(lastMove);
		var win = this.findWinner();
		if(win != 'tie board'){
			this.winner = win;
		}
		return(win);
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
	this.state = 0; //state tells you which board to play on now. It's an integer.
	this.numberOfLevels = obj.numberOfLevels; //2 is a regular tic tac toe game.
	this.subBoards = [];
	this.hasMoved = false; //This will change become true after the first move has been made. For display purposes.
	this.winner = null;
	//The total number of boards is B=(9^n-1)/8. The other boards will be named '0' + [0..B]
	var numberOfBoards = (9**this.numberOfLevels-1)/8;
	var numberOfNonTerminatingBoards = (9**(this.numberOfLevels-1)-1)/8;
	for (i = 0; i < numberOfBoards; i++){
		this.subBoards.push(new Board({name: i, isTerminal: (i > numberOfNonTerminatingBoards)}));
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
		if (boardNumber === void(0)){
			//returns the current board to play on if boardNumber is undefined.
			return(this.subBoards[this.state]);
		} else{
				return(this.subBoards[boardNumber]);
			}
	 }

	this.checkVictory = function(boardLastPlayedOn){
		this.cascadeVictories = function(boardLastPlayedOn){
			var localBoard = this.findBoard(boardLastPlayedOn);
			var localState = boardLastPlayedOn;
			var parentalState = parentState(localState);
			var parentBoard = this.findBoard(parentalState);
			while (localBoard.winner){
				if (localState === 0){
					console.log("and the winner is " + localBoard.winner);
					this.winner = localBoard.winner;
					return(localBoard.winner);}
				parentBoard.makeMove( {index: wrappedModulus( localState, 9), token: this.currentPlayer} );
				localBoard = parentBoard;
				localState = parentalState;
				parentalState = parentState(localState);
				parentBoard = this.findBoard(parentalState);
			}
			return(null);
		}
		return(this.cascadeVictories(boardLastPlayedOn));
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
			var newState = this.state;
			console.log('new state is');
			console.log(newState);
			console.log('suboards');
			console.log(this.subBoards[newState]);
			while (this.subBoards[newState].isFull){
				if (newState === 0){ return('draw'); }
				newState = parentState(newState);
			}
			this.state = newState;
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
		if (winner = this.checkVictory(boardToPlayOn)){ //check for winners on the board that was moved on.
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
			if (this.winner === null) {this.makeMove(input);}
	}

	/*this.undoMove = function(previousMove){
		//We assume previousMove is actually the last move that was made.
		//Exactly what this move was will be contained in a server-side
		//object which is an array of the move history.
		this.checkReasonableUndo = function(previousMove){
			if this.boards...
		}
	}*/
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
