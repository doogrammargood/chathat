// This file will contain the alpha-beta pruning algorithm, given a heuristic function which can be found in heuristic.

function Bot(obj){
  this.baseGame = Object.create(obj.game); //copies the game.
  this.currentGame = Object.create(baseGame); //another copy that represents the bot's mind.
  function GameTree(obj){
    function Node(obj){
      // obj is an object containing the following: {data: {}, parent: Node, children: [[moveNumber, nextNode]
      this.data = obj.data; // should store the value of the heuristic function.
                            // data = {}
      this.depth = 0;
      this.parent = obj.parent;
      this.children = obj.children; //
      this.unexploredMoves = obj.unexploredMoves;
      this.addChildren = function(obj){
        // expect a game or a game and a move.
        if (obj.move === null){ //if no move is provided, expand the node for all possible moves.
          var validMoves = obj.game.vaildMoves;
          for (var move in validMoves){
            // record the move, evaluate the heuristic function, then return
          }
        } else {
          obj.game.playMove(obj.move);
          var heuristic = evaluateGame(obj.game);
          this.children.push(new Node({data: {heuristic: heuristic},
                                       parent: this,
                                       children:[],
                                       unexploredMoves: object.game.validMoves}));
          this.
          return this.children[this.children.length - 1]; //return the node that was just created.
        }
      }
    }

    this.rootNode = obj.data;
    this.currentNode = this.root;

    function (){ //when the GameTree is instantiated, we fill it out to a particular depth;
      function deepenNode(node, game){
        var unexploredMoves = game.validMoves -
      }
      for (var move in currentGame.validMoves){
        this.currentNode = this.currentNode.addChildren({game: currentGame, move: move});

      }
    }();

  }


}
