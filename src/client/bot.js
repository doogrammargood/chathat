// This file will contain the alpha-beta pruning algorithm, given a heuristic function which can be found in heuristic.

function Bot(obj){
  //this.currentGame = Object.create(this.baseGame); //another copy that represents the bot's mind.
  function GameTree (obj){
    function Node(obj){
      // obj is an object containing the following: {data: {}, heuristic, minimax value.
                                                  //parent: Node,
                                                  //children: [[moveNumber, nextNode],
                                                  //unexploredMoves: all available moves,
                                                  //toPlay: 'X' or 'O'
                                                  //moveToGetHere: the last move that was played
                                                  //depth: the distance from the root.
      this.data = obj.data;
      this.depth = obj.depth;
      this.parent = obj.parent;
      this.children = obj.children; //
      this.unexploredMoves = obj.unexploredMoves;
      this.toPlay = obj.toPlay;
      this.moveToGetHere = obj.moveToGetHere;
      this.addChild = function(obj){ //expects: obj = {game:_, move:_,}
        if (obj.game.playMove(obj.move) !== 'collision'){
          var heuristic = evaluateGame(obj.game, this.data.heuristic, obj.move);
          this.children.push(new Node({data: {heuristic: heuristic, minimax: undefined},
                                       parent: this,
                                       children:[],
                                       depth: this.depth + 1,
                                       unexploredMoves: obj.game.validMoves(),
                                       moveToGetHere: obj.move,
                                       toPlay: obj.game.currentPlayer}));
          this.unexploredMoves = this.unexploredMoves.filter(function(move){
            return move !== obj.move;
          });
          return this.children[this.children.length - 1]; //return the node that was just created.
        } else {console.log('The bot made an illegal move!'); console.log(obj.move); console.log(obj.game);}
      }

      this.calculateMinimax = function(){ // examines the minimax values of the children and sets the current value accordingly.
        var childrenMinimax;
        childrenMinimax = this.children.map(function(child){
          return child.data.minimax;
        });
        if (this.children.length === 0) {
          this.data.minimax = this.data.heuristic[0];
        } else{
          if (this.toPlay === 'X'){
            this.data.minimax = childrenMinimax.reduce(function(a,b){
              return Math.max(a, b);
            });
          } else if (this.toPlay === 'O'){
            this.data.minimax = childrenMinimax.reduce(function(a,b){
              return Math.min(a, b);
            });
          }
        }
      }
    } // this bracket closes Node

    this.rootGame = obj.game; //copies the game.
    this.currentGame = copyGame(this.rootGame);
    this.depth = obj.depth;
    this.rootNode = new Node({data: {heuristic: evaluateGame(this.rootGame), minimax: undefined},
                                    parent: undefined,
                                    children: [],
                                    depth: 0,
                                    unexploredMoves: this.rootGame.validMoves(),
                                    toPlay: this.currentGame.currentPlayer});
    this.currentNode = this.rootNode;
    this.startTree = function(){ //when the GameTree is instantiated, we fill it out to a particular depth;
      var depth = 0; // the current depth of currentGame
      var maxDepth = 2;
      this.deepen = function(){//if currentNode is below the max depth and has unexplored children, do the following:
        var nextMove = this.currentNode.unexploredMoves[0];
        this.currentNode = this.currentNode.addChild({game: this.currentGame, move: nextMove}); //hopefully, this will modify currentGame
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
    //this.startTree();

    this.startABTree = function(){ // creates an alpha-beta pruned tree.
                                    // Pseudocode from https://www.youtube.com/watch?v=zp3VMe0Jpf8
      this.currentGame = copyGame(this.rootGame);
      var maxDepth = this.depth;
      this.maxValue = function(node, a, b){//
        if (node.depth - this.rootNode.depth >= maxDepth){ //If this node is terminal,
          node.data.minimax = node.data.heuristic[0];
          this.currentGame.undoMove();
          return node.data.minimax;
        }
        node.data.minimax = -Infinity;
        var newMinimax;
        var nextNode;
        if (this.currentGame.validMoves().length === 0){ // This will occur when the game ends.
          if (this.currentGame.winner === 'X'){
            node.data.minimax = Infinity;
          } else if (this.currentGame.winner === 'O'){
            node.data.minimax = -Infinity;
          } else {node.data.minimax = 0;}
        }

        while(node.unexploredMoves.length > 0){
          nextNode = node.addChild({game: this.currentGame, move: node.unexploredMoves[0]}); //This reduces node.unexploredMoves, so the loop terminates.
          newMinimax = this.minValue(nextNode, a, b);
          if (newMinimax > node.data.minimax) {node.data.minimax = newMinimax;}
          if (newMinimax >= b) {this.currentGame.undoMove(); return node.data.minimax;}
          if (newMinimax > a) {a = newMinimax;}
        }
        this.currentGame.undoMove();
        return node.data.minimax;
      }

      this.minValue = function(node, a, b){
        if (node.depth - this.rootNode.depth >= maxDepth){
          node.data.minimax = node.data.heuristic[0];
          this.currentGame.undoMove();
          return node.data.heuristic[0];
        }
        node.data.minimax = Infinity;
        var newMinimax;
        var nextNode;
        if (this.currentGame.validMoves().length === 0){ // This will occur when the game ends.
          if (this.currentGame.winner === 'X'){
            node.data.minimax = Infinity;
          } else if (this.currentGame.winner === 'O'){
            node.data.minimax = -Infinity;
          } else {node.data.minimax = 0;}
        }
        while(node.unexploredMoves.length > 0){
          nextNode = node.addChild({game: this.currentGame, move: node.unexploredMoves[0]});
          newMinimax = this.maxValue(nextNode, a, b);
          if (newMinimax < node.data.minimax) {node.data.minimax = newMinimax;}
          if (newMinimax <= a) {this.currentGame.undoMove(); return node.data.minimax;}
          if (newMinimax <= b) {b = newMinimax;}
        }
        this.currentGame.undoMove();
        return node.data.minimax;
      }

      return this.maxValue(this.rootNode, -Infinity, Infinity);
    }
    this.startABTree();

    this.expandABTree = function(){
      //Write a method here before its too late!
      return null;
    }

    this.updateMinimax = function(){
      this.currentNode = this.rootNode;
      var visitedNodes = [];
      this.recursiveUpdateMinimax = function(){
        var unVisitedNodes = this.currentNode.children.filter(function(item){return ! visitedNodes.includes(item);}); //the nodes that haven' been visited in this transversal.
        if (unVisitedNodes.length > 0){ //if there is an unexplored node...
          this.currentNode = unVisitedNodes[0]; // go to it.
        } else{
          this.currentNode.calculateMinimax();
          visitedNodes.push(this.currentNode);
          if (this.currentNode === this.rootNode && visitedNodes.includes(this.rootNode)){return 'updatedMinimax';}
          this.currentNode = this.currentNode.parent; //otherwise, go back.
        }
        return undefined;
      }
      while (this.recursiveUpdateMinimax() !== 'updatedMinimax'){
        //donothing.
      }
    }
    this.recommendMove = function(){
      var rootOptimal = this.rootNode.data.minimax;
      var recommendations = this.rootNode.children.filter(function(child){
        return child.data.minimax === rootOptimal;
      });
      return recommendations[0].moveToGetHere;
    }
    this.recursiveRemove = function(node){
      //removes the given node and all its descendants.
      if (node.children.length === 0) {
        node = null; //If this is a terminal node, delete it
      } else {
        for (var child in node.children){
          this.recursiveRemove(child);
        }
        node = null;
      }
      return 'removed';
    }
    this.receiveMove = function(move){ //This function should take a move and make that move
      if (! this.rootGame.validMoves().includes(move)){
        console.log('That move is not valid.');
      }
      this.rootGame.playMove(move); //Mavke the move on the root game.j
      var nodesToRemove = this.rootNode.children.filter(function(child){
        return child.moveToGetHere !== move;
      }); //These nodes represent moves which did not occur.
      for (var potentialNode in nodesToRemove){
        this.recursiveRemove(potentialNode);
      }
      this.rootNode = this.rootNode.children[0]; // there should be only one node there.
      this.rootNode.parent = null; //remove the old rootNode.
    }

  } // this bracket closes GameTree

  var freshGame = copyGame(obj.game);
  this.gameTree = new GameTree({game: freshGame, depth: 4});
  this.recommendMove = function(){ return this.gameTree.recommendMove();}
}

copyGame = function(game){
  //creates a new game with the same moves as the original.
  var movelist = game.moveHistory.map(function(move){
    return move[0];
  });
  var move;
  var newGame = new Game({numberOfLevels: game.numberOfLevels});
  while (movelist.length > 0){
    move = movelist.shift();
    newGame.playMove(move);
  }
  return newGame;
}
