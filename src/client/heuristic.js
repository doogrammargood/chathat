// This file will contain functions to evaluate board positions and recommend moves.
// It will use alpha-beta pruning with a heuristic function,
// Moreover, there will be a Bot object, that you can feed moves, without restarting its evaluation.
// More information can be found at the end of this file.


function evaluateGame(game, previousValues, previousMove){ //previousValues are a list of the values of each subBoard. If undefined, we will compute everything anew.;
  function evaluateBoard(board){ // returns the value of a board, assuming control over the squares is known..
    if (previousValues && previousMove){
      if (! isChildBoardOfState(board.name, previousMove)){
        return previousValues[board.name];
      }
    }

    function evaluateLine(s1, s2, s3, won){
      //s1, s2, s3 are squares.
      //free tells you whether the board has been won or not.

      function evaluateSquare(s){
        var nextState = game.nextState(s.memberOf, s.nextBoard);
        if (s.isTerminal){
          if (s.token === 'X'){         //The terminal squares do not unambigously lead
            return 1;                   //to any particular board. For boards of 3 levels or more,
          } else if (s.token === 'O'){  //it will depend on the state of the game.
            return -1;
          } else {return 0;}
        } else {
          return evaluateBoard(game.findBoard(nextState));
        }
      } //end of evaluateSquare

      var x = evaluateSquare(s1); //These values are in {1, -1} in the terminal boards.
      var y = evaluateSquare(s2); //They grow on the parent boards. I am not sure how to control this.
      var z = evaluateSquare(s3);
      var sum = x+y+z;
      return ( (x*y + y*z + x*z + 1) * (sum**3 + 0.75*sum) / (4 * 29.25 * 8) );
      console.log('Do not call evaluateSquare on a captured board, dummy!');
    } //end of evaluateLine

    var total = 0;
    var i = 0;
    var won = board.winner;
    if (won === 'X'){
      listOfBoardValues[board.name] = 1;
      return 1;
    } else if (won === 'O') {
      listOfBoardValues[board.name] = -1;
      return -1;
    }
    for (i = 0; i < 3; i++){
      total += evaluateLine(board.squares[0][i], board.squares[1][i], board.squares[2][i], won);
    }
    for (i = 0; i < 3; i++){
      total += evaluateLine(board.squares[i][0], board.squares[i][1], board.squares[i][2], won);
    }
    total += evaluateLine(board.squares[0][0], board.squares[1][1], board.squares[2][2], won); //diagonal
    total += evaluateLine(board.squares[2][0], board.squares[1][1], board.squares[0][2], won); //antidiagonal
    listOfBoardValues[board.name] = total;
    return listOfBoardValues[board.name];
  } //end of evaluateBoard

  var listOfBoardValues = game.subBoards.map(function(element){
    return undefined;
  });
  if (previousValues){
    listOfBoardValues = previousValues.slice(); //the .slice() copies previousValues to a new array.
  }
                        //This is for memoization. The values will be stored in the order in which they're computed.
                        //It's hard to say how exactly this new order corresponds to the old order.
  evaluateBoard(game.subBoards[0]);
  previousValues = previousValues;
  return listOfBoardValues;
}

// Since the game is recursive, it makes sense to apply a recursive hueristic function:
// If we define it on a board whose squares are given definite values, we can propogate this function up.
// Each board has a heuristic which is the sum of the values for each of the 8 lines (ways to  win).

//Heuristic on each line:
//f(x,y,z) = (xy + yz + xz + 1) * (s^3 + 0.75*s) / (4 * 29.25) (while unwon; s=x+y+z)
//         = 1 or -1 (After victory)

// The first factor is meant to discount lines that are likely to be blocked.
// It must be an even function since it should apply equally to X and O. This forces it to be of this form.
// The second factor describes the control over each line. It must be an odd function.
//    Call the second factor g = s^3 + a*s
//    We can reason about its values in the discrete case:
//       g must satisfy g(2) > 2*g(1)
//          Otherwise, two disconnected squares would be preferable to one that was aligned.
//          This always holds.
//       g must satisfy g(3) > 3*g(2)
//          Otherwise, having an L shape would be preferable to having a line.
//    These considerations force 0 < a < 3/2. Taking the average gives a = 0.75
// Finally, the factor at the end is for normalization to the interval [-1/8, 1/8].
//    This interval was chosen because it should be better to own a board than very nearly own all 8 lines that comprise it.

// The heuristic function's plans:

// evaluateGame
// . . |
// . . V
// evaluateBoard <-----|
// . . | . . . . . . . |
// . . V . . . . . . . |
// evaluateLine . . . .|
// . . | . . . . . . . |
// . . V . . . . . . . |
// evaluateSquare -----|
