#!/usr/bin/python3

from flask import Flask, request, redirect, url_for, send_from_directory, session
from flask_cors import CORS, cross_origin
from waitress import serve
import serverutils as utils
import os, sys, time, stat, json, chess, chess.uci, settings, mailserver

HOST_NAME = '0.0.0.0'
PORT_NUMBER = os.environ.get('PORT') or 8080
DIR_PATH = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__)
cors = CORS(app)
app.debug = True
app.config['SECRET_KEY'] = os.urandom(24)
app.config['CORS_HEADERS'] = 'Content-Type'

board = chess.Board()
if sys.platform == 'win32':
  engine = chess.uci.popen_engine(DIR_PATH + "/stockfish_8_x64.exe")
else:
  st = os.stat(DIR_PATH + "/stockfish_8_x64")
  os.chmod(DIR_PATH + "/stockfish_8_x64", st.st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
  engine = chess.uci.popen_engine(DIR_PATH + "/stockfish_8_x64")

engine.uci()

@app.route('/')
def root():
  return send_from_directory('./JSChess', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
  return send_from_directory('./JSChess', path)

@app.route('/mail/<pgn>')
def send_mail(pgn):
  return mailserver.send_email(pgn)

@app.route('/move/uci/<source>/<target>')
def move_uci(source, target):
  move = chess.Move.from_uci(str(source + target))
  board.push(move)
  return board.fen()

@app.route('/move/san/<destination>')
def move_san(destination):
  board.push_san(destination)
  return board.fen()

@app.route('/move/san/get/')
@app.route('/move/san/get/<fen>')
def get_san_move(fen):
  fen = utils.decode_fen(fen)
  engine.position(chess.Board(fen))
  command = engine.go(movetime=1000)
  # print('sending move:: ', command[0])
  ret = json.dumps(command[0].__dict__)
  # print('sending return value: ', ret)
  return ret

@app.route('/newgame/')
@app.route('/newgame/<fenstr>')
def new_game(fenstr=""):
  if (fenstr != ""):
    fen = utils.decode_fen(fenstr)
    try:
      board = chess.Board(fen=fen)
    except Exception:
      return "Invalid FEN string"
  else:
    board = chess.Board()

  session['fen_str'] = board.fen()
  return board.fen()



if __name__ == '__main__':
    # wsgi_app = static.Cling('./JSChess')
    print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER))
    # try:
    serve(
      app,
      host=HOST_NAME,
      port=PORT_NUMBER
      # listen="*:"+str(PORT_NUMBER)
    )
        # httpd.serve_forever()
    # except KeyboardInterrupt:
    #     pass
    # httpd.server_close()
    # print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER))
