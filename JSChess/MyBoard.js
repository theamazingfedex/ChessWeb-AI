const baseUrl = window.location.href // <- ends with '/'
const URLS = {
  home: `${baseUrl}`,
  newGame: `${baseUrl}newgame/`,
  moveSan: `${baseUrl}move/san/`,
  moveUci: `${baseUrl}move/uci/`,
  getSanMove: `${baseUrl}move/san/get/`,
  submitBug: `${baseUrl}mail/`
}
const defaultFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function callAjax(url, callback){
    $.ajax({
      url: url,
      crossDomain: true,
      success: callback
    })
}

document.addEventListener("DOMContentLoaded", () => {

// var $select =
var data = [['random', 'Random Moves'], ['stockfish', 'Stockfish Engine'], ['local', 'Local Opponent']]
var SELECTED_DIFFICULTY = "stockfish";
var $selector = $("#difficultySelector");
var $submitBug = $("#submitBugButton");

for(var [val, text] in data) {
    $("<option />", {value: data[val][0], text: data[val][1]}).appendTo($selector);
}
$selector.val(SELECTED_DIFFICULTY);
$selector.on('change', (e) => {
  if (game.fen() != defaultFEN) {
    $selector.prop('disabled', true)
    return;
  }
  SELECTED_DIFFICULTY = e.target.value;
  $selector.val(SELECTED_DIFFICULTY);
});

$submitBug.on('click', submitBugReport);

var $resetButton = $('#resetButton').on('click', (e) => {
  resetBoard();
});


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
      // Update the server board with random moves also?
      if (SELECTED_DIFFICULTY === 'random'){
        makeRandomMove();
      } else if (SELECTED_DIFFICULTY === 'local'){
        return;
      }
      else {
        getMoveFromServer();
      }
    }
  });
}

var resetBoard = function() {
  game.reset();
  board.position(defaultFEN);
  $selector.prop('disabled', false);
  updateStatus();
}


var getMoveFromServer = function() {
  callAjax(`${URLS.getSanMove}${encodeFen(game.fen())}`, getMoveFromServerCallback);
}
var makeRandomMove = function() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  move = possibleMoves[randomIndex]
  game.move(move);
  //board.position(game.fen());
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

  $selector.prop('disabled', true);
  $submitBug.prop('disabled', false);
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


function encodeFen(fen){
  // return encodeURI(fen);
  return encodeURI(fen).replace(/\//g, 'Þ');
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

function submitBugReport(e) {
  pgn = encodeURI(game.pgn());
  url = URLS.submitBug + pgn;
  // alert('pinging: ' + url);
  $submitBug.prop('disabled', true)
  callAjax(url, (res) => {
    if (res == 0) {
      console.log('ChessWeb bug submitted successfully.');
    } else {
      console.log(res);
      $submitBug.prop('disabled', false)
    }
  });
}

});

var board,
  game = new Chess(),
  statusElement = $('#status'),
  fenElement = $('#fen'),
  pgnElement = $('#pgn');
const coordsMap = ['a','b','c','d','e','f','g','h'];
function numbersToCoords(from, to) {
  var fromLetter = from % 8;
  var fromNum = Math.ceil(from / 8);
  var toLetter = to % 8;
  var toNum = Math.ceil(to / 8);

  return [coordsMap[fromLetter] + fromNum, coordsMap[toLetter] + toNum, [from, to]]
}
var getMoveFromServerCallback = function(res) {
    res = JSON.parse(res);
    move = numbersToCoords(res['from_square'], res['to_square'])
    console.log('move: ', move);
    // alert('move: ' + move)
    console.log('moving: ', move)
    game.move({
      from: move[0],
      to: move[1],
      promotion: 'q'
    });
    board.position(game.fen());
    updateStatus();
}

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

