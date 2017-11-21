// This file will contain the alpha-beta pruning algorithm, given a heuristic function which can be found in heuristic.

function Bot(obj){
  this.baseGame = Object.create(obj.game); //copies the game.
  //this.currentGame = Object.create(this.baseGame); //another copy that represents the bot's mind.
  function GameTree (obj){
    function Node(obj){
      // obj is an object containing the following: {data: {}, heuristic, minimax value.
                                                  //parent: Node,
                                                  //children: [[moveNumber, nextNode],
                                                  //unexploredMoves: all available moves,
                                                  //toPlay: 'X' or 'O'
                                                  //moveToGetHere: the last move that was played
      this.data = obj.data;
      this.depth = 0;
      this.parent = obj.parent;
      this.children = obj.children; //
      this.unexploredMoves = obj.unexploredMoves;
      this.toPlay = obj.toPlay;
      this.moveToGetHere = obj.moveToGetHere;
      this.addChild = function(obj){
        if (obj.game.playMove(obj.move) === 'success'){
          var heuristic = evaluateGame(obj.game, this.data.heuristic, obj.move);
          this.children.push(new Node({data: {heuristic: heuristic, minimax: undefined},
                                       parent: this,
                                       children:[],
                                       unexploredMoves: obj.game.validMoves(),
                                       moveToGetHere: obj.move,
                                       toPlay: obj.game.currentPlayer}));
          this.unexploredMoves = this.unexploredMoves.filter(function(move){
            return move != obj.move;
          });
          return this.children[this.children.length - 1]; //return the node that was just created.
        } else {console.log('The bot made an illegal move!');}
      }
      this.calculateMinimax = function(){ // examines the minimax values of the children and sets the current value accordingly.
        var childrenMinimax;
        if (this.unexploredMoves.length > 0){
          console.log('dont calculate minimax until all the children of the node have been explored.')
        }
        childrenMinimax = this.children.map(function(child){
          return child.minimax;
        });
        if (this.toPlay === 'X'){
          this.minimax = childrenMinimax.reduce(function(a,b){
            return Math.max(a, b);
          });
        } else if (this.toPlay === 'O'){
          this.minimax = childrenMinimax.reduce(function(a,b){
            return Math.min(a, b);
          });
        }
      }
    }
    this.currentGame = Object.create(obj.game);
    this.rootNode = new Node({data: {heuristic: evaluateGame(obj.game), minimax: undefined},
                                    parent: undefined,
                                    children: [],
                                    unexploredMoves: obj.game.validMoves(),
                                    toPlay: this.currentGame.currentPlayer});
    this.currentNode = this.rootNode;

    this.startTree = function(){ //when the GameTree is instantiated, we fill it out to a particular depth;
      var depth = 0; // the current depth of currentGame
      var maxDepth = 2;
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
    this.updateMinimax = function(){
      this.currentNode = this.rootNode;
      var visitedNodes = [this.rootNode];

      this.recursiveUpdateMinimax = function(){
        var unVisitedNodes = this.currentNode.children.filter(function(item){return ! visitedNodes.includes(item);}); //the nodes that haven' been visited in this transversal.
        if (unVisitedNodes.length > 0){ //if there is an unexplored node...
          visitedNodes.push(this.currentNode);
          console.log(unVisitedNodes);
          this.currentNode = unVisitedNodes[unVisitedNodes.length - 1]; // go to it.
        } else{
          if (this.currentNode.children.length === 0){ // if it's on the perpihery...
            this.currentNode.data.minimax = this.currentNode.data.heuristic; // approximate the minimax value by the heuristic.
            visitedNodes.push(this.currentNode);
          } else {this.currentNode.calculateMinimax();}
          this.currentNode = this.currentNode.parent; //otherwise, go back.
          if (this.currentNode === this.rootNode){return 'updatedMinimax';}
        }
        return undefined
      }
      while (this.recursiveUpdateMinimax() !== 'updatedMinimax'){
        //donothing.
      }
    }
    this.recommendMove = function(){
      this.updateMinimax();
      var rootOptimal = this.rootNode.data.minimax;
      var recommendation = this.rootNode.children.filter(function(child){
        return child.data.minimax === rootOptimal;
      })[0].moveToGetHere;
      console.log(this.rootNode);
      return recommendation;
    }

  }
  this.gameTree = new GameTree({game: this.baseGame});
  this.recommendMove = function(){ return this.gameTree.recommendMove();}
}
