# def application(env, start_response):
#     start_response('200 OK', [('Content-Type','text/html')])
#     data = ""
#     with open('./JSChess/index.html', 'r') as myfile:
#         data=myfile.read().replace('\n', '')
#     return [str.encode(data)]

routes = [('/static/*',      static_files.make_static_application('/JSChess/', 'static', not_found)),
          ('/one',          one),
          ('/two',          two),
          ('/',             index),
         ]
def not_found(environ, start_response):
    start_response('404 Not Found', [('content-type','text/html')])
    return ["""<html><h1>Page not Found</h1><p>
               That page is unknown. Return to
               the <a href="/">home page</a></p>
               </html>""",]
def application(environ, start_response):
    for path, app in routes:
        if fnmatch.fnmatch(environ['PATH_INFO'], path):
            return app(environ, start_response)
    return not_found(environ, start_response)
