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
  ReactDOM.render(
    <WrapperForDisplayBoard game = {new Game({numberOfLevels: 2})}/>,
    document.getElementById('app')
  );


  var g = new Game({numberOfLevels: 2}); //** takes
  $(".square").click(function(event){

    if (event.target.id){
      g.playMove(event.target.id);
    }
    console.log('game value is now ');
    console.log(evaluateGame(g));
    ReactDOM.render(
      <WrapperForDisplayBoard game = {g}/>,
      document.getElementById('app')
    );
  });

  var input
  var futureBoard;
  $(".square").hover(function(event){
    input = event.target.id;
    if (g.validMoves().includes(parseInt(input))){
      futureBoard = g.nextState(g.state, wrappedModulus(input, 9));
      while(g.subBoards[g.state].isFull){
        futureBoard = parentState(futureBoard); // use popUntilValid
      }
      $("#" + futureBoard).addClass('nextBoard');
    }
  },
  function(){
    if (isChildBoardOfState(g.state, input)){
      $("#" + futureBoard).removeClass('nextBoard');
    }
  }

  );
  $("#botButton").click(function(event){
    var bot = new Bot({game: g});
    var recommended = bot.recommendMove();
    g.playMove(recommended);
    console.log('made the bots move');
    console.log(recommended);
    ReactDOM.render(
      <WrapperForDisplayBoard game = {g}/>,
      document.getElementById('app')
    );
  });
  $(window).keypress(function(event){
    console.log('undo pending');
    g.undoMove();
    ReactDOM.render(
      <WrapperForDisplayBoard game = {g}/>,
      document.getElementById('app')
    );
  });


});
