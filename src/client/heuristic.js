// This file will contain functions to evaluate board positions and recommend moves.
// It will use alpha-beta pruning with a heuristic function,
// Moreover, there will be a Bot object, that you can feed moves, without restarting its evaluation.
// More information can be found at the end of this file.


function evaluateGame(game, previousValues, previousMove){ //previousValues are a list of the values of each subBoard. If undefined, we will compute everything anew.
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
      }

      var x = evaluateSquare(s1);
      var y = evaluateSquare(s2);
      var z = evaluateSquare(s3);
      var sum = x+y+z;
      if (won){
        return (x*y + y*z + x*z + 1) * (0.25*sum**3 - 0.75*sum);
      } else{
        return (x*y + y*z + x*z + 1) * ((1/12)*sum**3 - (11/12)*sum);
      }
    }

    var total = 0;
    var i = 0;
    var won = board.winner;
    for (i = 0; i < 3; i++){
      total += evaluateLine(board.squares[0][i], board.squares[1][i], board.squares[2][i], won);
    }
    for (i = 0; i < 3; i++){
      total += evaluateLine(board.squares[i][0], board.squares[i][1], board.squares[i][2], won);
    }
    total += evaluateLine(board.squares[0][0], board.squares[1][1], board.squares[2][2], won); //diagonal
    total += evaluateLine(board.squares[2][0], board.squares[1][1], board.squares[0][2], won); //antidiagonal
    listOfBoardValues[board.name] = total;
    return total;
  }
  var listOfBoardValues = game.subBoards.map(function(element){
    return undefined;
  });
  if (previousValues){
    listOfBoardValues = previousValues;
  }
                        //This is for memoization. The values will be stored in the order in which they're computed.
                        //It's hard to say how exactly this new order corresponds to the old order.
  evaluateBoard(game.subBoards[0]);
  return listOfBoardValues;
}

// Since the game is recursive, it makes sense to apply a recursive hueristic function:
// If we define it on a board whose squares are given definite values, we can propogate this function up.
// The function is the first proposal:
//    For each of the 8 line to win, that line is worth
//    0 points if empty or blocked
//    1, -1 points if one square is occupied
//    3, -3 points if two squares are occupied     Its necessary that this is more than 2, or we be counting tokens.
//    9, -9 the first time a line is occupied.        This must be more than 3+3
//    5, -5 the second and third time a line is occupied. //Note that 5+5 > 9, and 5+3 < 9.
// Is it true that whenever the heuristic function is positive, either the board is empty or X has won it?

//Heuristic on each line:
//f(x,y,z) = (xy + yz + xz + 1) * (0.25*s^3 + 0.75*s) (while unwon)
//         = (xy + yz + xz + 1) * (1/12 s^2 + 10/12) (After victory)

// The first factor is meant to discount lines that are likely to be blocked.
// The second factor comes from fitting curve of the form ax^3+bx to the points 1,1 and 3,9 or 3,5.
// This form was chosen because it is an odd function.
// Actually, note that this gives no advantage to having only one square in a line.

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

// I plan on mutating game to memoize parts of the heuristic function.
// For this reason, I should plan on creating a copy of the board for the bot to consider.
