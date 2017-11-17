// This file will contain functions to evaluate board positions and recommend moves.
// It will use alpha-beta pruning with a heuristic function,
// Moreover, there will be a Bot object, that you can feed moves, without restarting its evaluation.
// More information can be found at the end of this file.


function evaluateGame(game){
  function evaluateBoard(board){ // returns the value of a board, assuming control over the squares is known..
    //if (not board instanceof Board){
    //  console.log('attempting to evaluate the value of something that is not a board.'); //idk why this might happen.
    //}

    function evaluateLine(s1, s2, s3, free){
      //s1, s2, s3 are squares.
      //free tells you whether the board has been won or not.

      function evaluateSquare(s){
        console.log(board.isTerminal);
        var nextState = game.nextState(s.memberOf, s.nextBoard)
        if (nextState){
          console.log('bottom');
          if (s.token === 'X'){         //The terminal squares do not unambigously lead
            return 1;                               //to any particular board. For boards of 3 levels or more,
          } else if (s.token === 'O'){  //it will depend on the state of the game.
            return -1;
          }
        } else {
          //console.log(game.nextState(s.memberOf, s.nextBoard));
          return evaluateBoard(game.findBoard(game.nextState(s.memberOf, s.nextBoard))); //we find the board associated with the square.
        }
      }

      var x = evaluateSquare(s1);
      var y = evaluateSquare(s2);
      var z = evaluateSquare(s3);
      var sum = x+y+z;

      if (free){
        return (x*y + y*z + x*z + 1) * (1.25*sum^2 - 0.85*sum + 0.15);
      } else{
        return (x*y + y*z + x*z + 1) * (0.25*sum^2 - 0.95*sum - 0.05);
      }
    }

    var total = 0;
    var i = 0;
    var free = board.winner;
    for (i = 0; i < 3; i++){
      total += evaluateLine(board.squares[0][i], board.squares[1][i], board.squares[2][i], free);
    }
    for (i = 0; i < 3; i++){
      total += evaluateLine(board.squares[i][0], board.squares[i][1], board.squares[i][2], free);
    }
    total += evaluateLine(board.squares[0][0], board.squares[1][1], board.squares[2][2], free); //diagonal
    total += evaluateLine(board.squares[2][0], board.squares[1][1], board.squares[0][2], free); //antidiagonal
    return total;
  }

  return evaluateBoard(game.subBoards[0]);
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
//f(x,y,z) = (xy + yz + xz + 1) * (1.25 s^2 - 0.85 s + 0.15) (while unwon)
//         = (xy + yz + xz + 1) * (0.25 s^2 - 0.95 s -0.05) (After victory)

// The first factor is meant to discount lines that are likely to be blocked.
// The second factor comes from fitting a quadratic to the points in the simple case.
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
