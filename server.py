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
