# import http.server
# import socketserver
# import os

# PORT = os.environ.get('PORT') or 8080

# web_dir = os.path.join(os.path.dirname(__file__), 'JSChess')
# os.chdir(web_dir)

# Handler = http.server.SimpleHTTPRequestHandler
# httpd = socketserver.TCPServer(("", PORT), Handler)
# print("serving at port", PORT)

# httpd.serve_forever()#; except KeyboardInterrupt: pass; httpd.server_close()

def app(environ, start_response):
  data = b"Hello, World!\n"
  start_response("200 OK", [
    ("Content-Type", "text/plain"),
    ("Content-Length", str(len(data)))
  ])
  return iter([data])


def server_app(environ, start_response):
    method = environ.get('REQUEST_METHOD', 'GET')
    if method == 'GET':
        return get_response(start_response)
    elif method == 'POST':
        accept_header = environ.get('HTTP_ACCEPT', '*/*')
        post_data = environ.get('wsgi.input').read()
        return post_response(start_response, accept_header, post_data)

def get_response(start_response):
    data = "Only POST method is allowed. See http://webmention.org/"
    start_response("405", [
        ("Content-Type", "text/plain"),
        ("Content-Length", str(len(data)))
    ])
    return iter([data])

def post_response(start_response, accept_header, post_data):
    print accept_header
    if accept_header in ('application/json', '*/*'):
        return json_response(start_response, post_data)
    elif accept_header in ('text/html',):
        return html_response(start_response, post_data)
    else:
        data = ("Wrong Accept header. We can provide only text/html or"
                " application/json. See http://webmention.org/\n"
                "Accept header is %s" % accept_header)
        start_response("406", [
            ("Content-Type", "text/plain"),
            ("Content-Length", str(len(data)))
        ])
        return iter([data])

def html_response(start_response, post_data):
  data = """<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">

      <title>ChessWeb-AI</title>
      <meta name="description" content="ChessWeb-AI">
      <meta name="author" content="theamazingfedex">

      <link rel="stylesheet" href="css/chessboard-0.3.0.css?v=1.0">
    </head>

    <body>
      <div id="board" style="width: 400px"></div>
      <p>Status: <span id="status"></span></p>
      <p>FEN: <span id="fen"></span></p>
      <p>PGN: <span id="pgn"></span></p>
      <script
      src="https://code.jquery.com/jquery-3.2.1.min.js"
      integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
      crossorigin="anonymous"></script>
      <script src="js/chessboard-0.3.0.js"></script>
      <!--<script src="js/domready.js"></script>-->
      <script src="js/chess.js"></script>
      <script src="js/MyBoard.js"></script>
      <h3>footer</h3>
    </body>
    </html>"""
  start_response("202", [
      ("Content-Type", "text/html"),
      ("Content-Length", str(len(data)))
  ])
  return iter([data])
