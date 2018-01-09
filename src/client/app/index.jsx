import React from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";

function WrapperForDisplayBoard(props){
  var futureActiveBoards = [];
  function calculateDecorations(props){
    var game = props.game;
    if (!game.hasMoved){ return(null);}
    var levels = game.numberOfLevels;
    var localState = game.state;
    for (var i = 0; i < levels - 1; i++){
      futureActiveBoards.push(localState);
      localState = parentState(game.nextState(localState,1));
    }
    return({highlightedActiveBoards: futureActiveBoards});
  };
  var decorationObject = calculateDecorations(props);
  return(<DisplayBoard game = {props.game} decorationObject = {decorationObject} boardNumber = {0}/>);
}

function DisplayBoard(props){
  var level = getBoardLevel(props.boardNumber);
  var game = props.game;
  var decorationObject = props.decorationObject;
  var boardNumber = props.boardNumber;
  var boardClassName = "board blvl" + level + " " + game.subBoards[boardNumber].winner;
  function addDecorations(props){
    if (props.decorationObject === null){return(null);}
    for(i = 0; i < props.game.numberOfLevels - 1; i++){
      if (decorationObject.highlightedActiveBoards[i] === boardNumber && game.state != 0){
        boardClassName += " active" + i;
      }
    }
  }
  addDecorations(props);
  //if (props.game.state === props.boardNumber) {boardClassName += " active0";}
  var board = props.game.subBoards[props.boardNumber];
  if (level >= props.game.numberOfLevels){ //If this is a terminal board...
    var squareList = board.squares[0].concat(board.squares[1], board.squares[2]);
    var squareList = squareList.map(function(input){
      var token = input.token;
      if (token===null) {token = "\n";}
      var squareClass = "square " + token;
      return (<div className = "squareBoarder" key = {input.identifier}>
                <div className = {squareClass} id = {input.identifier} >
                </div>
              </div>);
    });
    return (<div className = {boardClassName} id = {props.boardNumber}>
              {squareList}
            </div>
            );
  }else{
    var boardList = Array.apply(null, {length: 9}).map(Number.call, Number);
    boardList = boardList.map(function(i){return(i+1);});
    boardList = boardList.map(function(i){
      var nextBoardNumber = props.game.nextState(props.boardNumber, i);
      return(<DisplayBoard game = {props.game} decorationObject = {props.decorationObject} boardNumber = {nextBoardNumber} key = {nextBoardNumber}/>);
    });
    return(
            <div className = {boardClassName} id = {props.boardNumber}>
              {boardList}
            </div>
    );
  }
}


class App extends React.Component {
  render(){
    return <p> Hello React!</p>;
  }
}

/*-------*/
$(document).ready(function(){
  var botCreated = false; //Initially, there is no bot present.
  var bot;
  var botMove;
  ReactDOM.render(
    <WrapperForDisplayBoard game = {new Game({numberOfLevels: 2})}/>,
    document.getElementById('app')
  );

  function play(move){ //plays the move, and renders said move.
    g.playMove(move);
    ReactDOM.render(
      <WrapperForDisplayBoard game = {g}/>,
      document.getElementById('app')
    );
  }

  var g = new Game({numberOfLevels: 2, playerX: 'Jonathan'}); //** takes
  $("#app").on('click', ".square", function(event){
    play(event.target.id);
    if(botCreated && ! g.winner){
      var botMove = bot.receiveMove(event.target.id);
      play(botMove);
      bot.receiveMove(botMove);
    }
  });

  var input
  var futureBoard;
  var parentBoard;
  $('#app').on("mouseenter", ".square", function(event){
    input = event.target.id;
    if (g.validMoves().includes(parseInt(input))){
      futureBoard = g.nextState(parentState(input), wrappedModulus(input, 9));
      while(g.subBoards[g.state].isFull){
        futureBoard = parentState(futureBoard); // use popUntilValid
      }
      parentBoard = parentState(futureBoard);
      $("#" + futureBoard).addClass('nextBoard');
      if (g.numberOfLevels === 3 && g.state === 0){
        $("#" + parentBoard).addClass('reactive1'); //this is a hack. reactive1 looks just like active1
      }
    }
  }

  );
  $('#app').on('mouseleave', '.square', function(){
    $("#" + futureBoard).removeClass('nextBoard');
    $("#" + parentBoard).removeClass('reactive1');
  })
  $("#toggleSize").click(function(event){
    console.log('newGame');
    bot = null;
    botCreated = false;
    var levels = g.numberOfLevels;
    levels = (levels%3) + 1;
    g = new Game({numberOfLevels: levels});
    ReactDOM.render(
      <WrapperForDisplayBoard game = {g}/>,
      document.getElementById('app')
    );
  });
  $("#playBot").click(function(event){
    if (botCreated) {return null;} //Do nothing, because there's already a bot.
    else { //create the bot, have it make a move and give it back its own move.
      botCreated = true;
      bot = new Bot({game: g});
      var botMove = bot.recommendMove();
      play(botMove);
      bot.receiveMove(botMove);
      console.log(bot);
    }

  })
  $("#undoMove").click(function(event){
    g.undoMove();
    if(botCreated){
      bot = new Bot({game: g});
    }
    ReactDOM.render(
      <WrapperForDisplayBoard game = {g}/>,
      document.getElementById('app')
    );
  });
});
