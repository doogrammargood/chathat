// This file will contain the alpha-beta pruning algorithm, given a heuristic function which can be found in heuristic.

function Bot(obj){
  //this.currentGame = Object.create(this.baseGame); //another copy that represents the bot's mind.
  function GameTree (obj){
    function Node(obj){
      // obj is an object containing the following: {data: {heuristic}, h
                                                  //parent: Node,
                                                  //children: [nodes],
                                                  //unexploredMoves: all available moves,
                                                  //toPlay: 'X' or 'O'
                                                  //moveToGetHere: the last move that was played
                                                  //depth: the distance from the root.
      this.data = obj.data; //data contains: heuristic (The array from the heuristic function), minimax: the current minimax value,
      this.depth = obj.depth;
      this.parent = obj.parent;
      this.children = obj.children; //
      this.unexploredMoves = obj.unexploredMoves;
      this.toPlay = obj.toPlay;
      this.moveToGetHere = obj.moveToGetHere;
      this.addChild = function(obj){ //expects: obj = {game:_, move:__}
        if (obj.game.playMove(obj.move) !== 'collision'){
          var heuristic = evaluateGame(obj.game, this.data.heuristic, obj.move);
          this.children.push(new Node({data: {heuristic: heuristic, minimax: undefined},
                                       parent: this,
                                       children: [],
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
    this.currentGame = copyGame(obj.game);
    this.rootGame = copyGame(obj.game); //copies the game.
    this.depth = obj.depth;
    this.rootNode = new Node({data: {heuristic: evaluateGame(this.rootGame), minimax: undefined},
                                    parent: undefined,
                                    children: [],
                                    depth: 0,
                                    unexploredMoves: this.rootGame.validMoves(),
                                    toPlay: this.currentGame.currentPlayer});

    this.startABTree = function(){ // creates an alpha-beta pruned tree.
                                    // Pseudocode from https://www.youtube.com/watch?v=zp3VMe0Jpf8
      var maxDepth = this.depth;
      this.beforeReturn = function(newMinimax){
        node.data.miminax = newMinimax;
        var length = this.currentGame.moveHistory.length;
        if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
        if (this.currentGame.moveHistory.length !== length -1){console.log('this should only happen once.');}
      }
      this.maxValue = function(node, a, b){//
        if (node.depth - this.rootNode.depth >= maxDepth){ //If this node is terminal,
          node.data.minimax = node.data.heuristic[0];
          if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
          return node.data.minimax;
        }
        node.data.minimax = -Infinity;
        let newMinimax;
        let nextNode;
        if (this.currentGame.validMoves().length === 0){ // This will occur when the game ends.
          if (this.currentGame.winner === 'X'){
            node.data.minimax = 50;
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            return 50;
          } else if (this.currentGame.winner === 'O'){
            node.data.minimax = -50;
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            return -50;
          } else {node.data.minimax = 0;
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            return 0;}
        }

        for (let index = 0; index < node.children.length; index++){ //loops through children that already exist.
          nextNode = node.children[index];
          this.currentGame.playMove(nextNode.moveToGetHere);
          newMinimax = this.minValue(nextNode, a, b);
          if (newMinimax > node.data.minimax) {node.data.minimax = newMinimax;}
          if (newMinimax >= b) {
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            node.children = node.children.sort(function(al,bert){return (bert.data.minimax - al.data.minimax); }); //descending order
            return node.data.minimax;
          }
          if (newMinimax > a) {a = newMinimax;}
        }

        while(node.unexploredMoves.length > 0){ //loops through the unexplored moves
          nextNode = node.addChild({game: this.currentGame, move: node.unexploredMoves[0]}); //This reduces node.unexploredMoves, so the loop terminates.
          newMinimax = this.minValue(nextNode, a, b);
          if (newMinimax > node.data.minimax) {node.data.minimax = newMinimax;}
          if (newMinimax >= b) {
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            node.children = node.children.sort(function(al,bert){return (bert.data.minimax - al.data.minimax); }); //descending order
            return node.data.minimax;
          }
          if (newMinimax > a) {a = newMinimax;}
        }
        if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
        node.children = node.children.sort(function(al,bert){return (bert.data.minimax - al.data.minimax); }); //descending order
        return node.data.minimax;
      }

      this.minValue = function(node, a, b){
        if (node.depth - this.rootNode.depth >= maxDepth){
          node.data.minimax = node.data.heuristic[0];
          if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
          return node.data.heuristic[0];
        }
        node.data.minimax = Infinity;
        let newMinimax;
        let nextNode;
        if (this.currentGame.validMoves().length === 0){ // This will occur when the game ends.
          if (this.currentGame.winner === 'X'){
            node.data.minimax = 50;
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            return 50;
          } else if (this.currentGame.winner === 'O'){
            node.data.minimax = -50;
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            return -50;
          } else {node.data.minimax = 0;
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            return 0;}
        }
        for (let index = 0; index < node.children.length; index++){ //loops through children that already exist.
          //console.log('its paying off');
          nextNode = node.children[index];
          this.currentGame.playMove(nextNode.moveToGetHere);
          newMinimax = this.maxValue(nextNode, a, b);
          if (newMinimax < node.data.minimax) {node.data.minimax = newMinimax;}
          if (newMinimax <= a) {
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            node.children = node.children.sort(function(al,bert){return (al.data.minimax - bert.data.minimax); }); //ascending order.
            return node.data.minimax;}
          if (newMinimax <= b) {b = newMinimax;}
        }
        while(node.unexploredMoves.length > 0){
          nextNode = node.addChild({game: this.currentGame, move: node.unexploredMoves[0]});
          newMinimax = this.maxValue(nextNode, a, b);
          if (newMinimax < node.data.minimax) {node.data.minimax = newMinimax;}
          if (newMinimax <= a) {
            if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
            node.children = node.children.sort(function(al,bert){return (al.data.minimax - bert.data.minimax); }); //ascending order.
            return node.data.minimax;}
          if (newMinimax <= b) {b = newMinimax;}
        }
        //We sort the nodes so that when we check the minimax in the future, we'll start by checking the minimax branch.
        node.children = node.children.sort(function(al,bert){return (al.data.minimax - bert.data.minimax); }); //ascending order.
        if (this.currentGame.moveHistory.length > this.rootGame.moveHistory.length){this.currentGame.undoMove();}
        return node.data.minimax;
      }
      let minimax;
      if (this.rootNode.toPlay === 'X'){
        var length = this.currentGame.moveHistory.length;
        minimax = this.maxValue(this.rootNode, -Infinity, Infinity);
        if (this.rootGame.validMoves().length !== this.rootNode.children.length){
          console.log('horrible error')
        }
        return minimax;
      }
      else if(this.rootNode.toPlay === 'O'){
        var length = this.currentGame.moveHistory.length;
        minimax = this.minValue(this.rootNode, -Infinity, Infinity);
        if (this.rootGame.validMoves().length !== this.rootNode.children.length){console.log('horrible error');}
        return minimax;
      }
    }
    this.startABTree(); //Builds the ab-tree.
    this.recommendMove = function(){
      var optimal = this.rootNode.data.minimax;
      //this.currentGame = copyGame(this.rootGame); //THIS IS A HACK. For some reason, currentGame and rootGame are getting desynchronized.
      var recommendations = this.rootNode.children.filter(function(child){
        return child.data.minimax === optimal;
      });
      if (recommendations.length === 0){
        console.log(optimal);
        console.log(this.rootNode);
        console.log(this.currentGame);
        console.log(this.rootGame);
         return 'Game Over';}
      return recommendations[0].moveToGetHere; //if no argument is given, we return the move to make. The argument is ignored.
    }
    this.recursiveRemove = function(node){
      //removes the given node and all its descendants.
      var index = 0;
      while(node.children.length > 0){
        this.recursiveRemove(node.children[0]);
        node.children = node.children.slice(1,node.children.length);
        }
      node.children = [];
      node = null;
      return 'removed';
    }
    this.receiveMove = function(move){ //This function should take a move and make that move
      if (! this.rootGame.validMoves().includes(parseInt(move))){
        console.log('That move is not valid.');
        console.log(move);
        console.log(this.rootGame);
        console.log(this.currentGame);
      }
      this.rootGame.playMove(move); //Mavke the move on the root game.
      this.currentGame.playMove(move);
      var nodesToRemove = this.rootNode.children.filter(function(child){
        return child.moveToGetHere !== parseInt(move);
      }); //These nodes represent moves which did not occur.
      while (nodesToRemove.length > 0){
        this.recursiveRemove(nodesToRemove.shift());
      }
      this.rootNode.children = this.rootNode.children.filter(function(child){return (child.moveToGetHere === parseInt(move));});
      this.rootNode = this.rootNode.children[0]; // there should be only one node there
      this.rootNode.parent = null; //remove the old rootNode.
    }
  } // this bracket closes GameTree

  this.gameTree = new GameTree({game: obj.game, depth: 6});
  this.gameTree.startABTree();
  //await the creation of the gameTree.

  //var updater = setInterval(function(){plotAndScheme();}, 3000);
  this.recommendMove = function(){ return this.gameTree.recommendMove();}

  this.receiveMove = function(move){

      var recommendation;
      this.gameTree.receiveMove(move);
      this.gameTree.startABTree();
      recommendation = this.gameTree.recommendMove();
      return recommendation;
  }
}

copyGame = function(game){
  //creates a new game with the same moves as the original.
  var movelist = game.moveHistory.map(function(move){
    return move[0];
  }).slice();
  var move;
  var newGame = new Game({numberOfLevels: game.numberOfLevels});
  while (movelist.length > 0){
    move = movelist.shift();
    newGame.playMove(move);
  }
  return newGame;
}
