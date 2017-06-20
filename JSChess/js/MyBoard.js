const updateBoardUrl = 'http://localhost:8080/update/'
const baseUrl = window.location.href // <- ends with '/'
const URLS = {
  home: `${baseUrl}`,
  newGame: `${baseUrl}newgame/`,
  moveSan: `${baseUrl}move/san/`,
  moveUci: `${baseUrl}move/uci/`,
  getSanMove: `${baseUrl}move/san/get/`
}

function callAjax(url, callback){
    $.ajax({
      url: url,
      crossDomain: true,
      success: callback
    })
    // var xmlhttp;
    // // compatible with IE7+, Firefox, Chrome, Opera, Safari
    // xmlhttp = new XMLHttpRequest();
    // xmlhttp.onreadystatechange = function(){
    //     if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
    //         callback(xmlhttp.responseText);
    //     }
    // }
    // xmlhttp.open("GET", url, true);
    // xmlhttp.send();
}

var board,
  game = new Chess(),
  statusElement = $('#status'),
  fenElement = $('#fen'),
  pgnElement = $('#pgn');

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var updateServer = function(source, target) {
  callAjax(`${URLS.moveUci}${source}/${target}`, (res) => {
    if (res) {
      // alert('server update response: \n' + res);
      getMoveFromServer();
    }
  });
}

var getMoveFromServer = function() {
  callAjax(`${URLS.getSanMove}${encodeFen(game.fen())}`, (res) => {
    res = JSON.parse(res);
    move = numbersToCoords(res['from_square'], res['to_square'])
    console.log('move: ', move);
    // alert('move: ' + move)
    game.move({
      from: move[0],
      to: move[1],
      promotion: 'q'
    });
    board.position(game.fen());
    updateStatus();
  });
}
var makeRandomMove = function() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  move = possibleMoves[randomIndex]
  game.move(move);
  board.position(game.fen());
  updateStatus();
};

var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  updateStatus();
  updateServer(source, target);
  // window.setTimeout(makeRandomMove, 250);
  // updateStatus();
};

// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  statusElement.html(status);
  fenElement.html(game.fen());
  pgnElement.html(game.pgn());
};

function encodeFen(fen){
  // return encodeURI(fen);
  return encodeURI(fen).replace(/\//g, 'Þ');
}

const coordsMap = ['a','b','c','d','e','f','g','h'];
function numbersToCoords(from, to) {
  var fromLetter = from % 8;
  var fromNum = Math.ceil(from / 8);
  var toLetter = to % 8;
  var toNum = Math.ceil(to / 8);

  return [coordsMap[fromLetter] + fromNum, coordsMap[toLetter] + toNum]
}

var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);

updateStatus();
// ChessBoard('board', 'start')
