// This file will contain the alpha-beta pruning algorithm, given a heuristic function which can be found in heuristic.

function Bot(obj){
  this.baseGame = Object.create(obj.game); //copies the game.
  //this.currentGame = Object.create(this.baseGame); //another copy that represents the bot's mind.
  function GameTree (obj){
    function Node(obj){
      // obj is an object containing the following: {data: {}, heuristic, minimax value.
                                                  //parent: Node,
                                                  //children: [[moveNumber, nextNode],
                                                  //unexploredMoves: all available moves
      this.data = obj.data;
      this.depth = 0;
      this.parent = obj.parent;
      this.children = obj.children; //
      this.unexploredMoves = obj.unexploredMoves;
      this.addChild = function(obj){
        if (obj.game.playMove(obj.move) === 'success'){
          var heuristic = evaluateGame(obj.game);
          this.children.push(new Node({data: {heuristic: heuristic, minimax: undefined},
                                       parent: this,
                                       children:[],
                                       unexploredMoves: obj.game.validMoves()}));
          this.unexploredMoves = this.unexploredMoves.filter(function(move){
            return move != obj.move;
          });
          return this.children[this.children.length - 1]; //return the node that was just created.
        } else {console.log('The bot made an illegal move!');}
      }
    }
    this.currentGame = Object.create(obj.game);
    this.rootNode = new Node({data: {heuristic: evaluateGame(obj.game), minimax: undefined},
                                    parent: undefined,
                                    children: [],
                                    unexploredMoves: obj.game.validMoves()});
    this.currentNode = this.rootNode;

    this.startTree = function(){ //when the GameTree is instantiated, we fill it out to a particular depth;
      var depth = 0; // the current depth of currentGame
      var maxDepth = 4;
      this.deepen = function(){//if currentNode is below the max depth and has unexplored children, do the following:
        this.currentNode = this.currentNode.addChild({game: this.currentGame, move: this.currentNode.unexploredMoves[0]}); //hopefully, this will modify currentGame
        depth++;
      }
      this.backTrack = function(){
        this.currentNode = this.currentNode.parent;
        this.currentGame.undoMove();
        depth--;
      }
      this.buildTree = function(){
        if (this.currentNode === this.rootNode && this.currentNode.unexploredMoves.length === 0){
          return 'done';
        }
        if(depth < maxDepth && this.currentNode.unexploredMoves.length > 0){
          this.deepen();
        } else{
          this.backTrack();
        }
      }
      while (this.buildTree() !== 'done'){
        //do nothing. Should run buildTree until it finishes.
      }
    }
    this.startTree();
  }

  this.gameTree = new GameTree({game: this.baseGame});
}
