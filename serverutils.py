import re

def decode_fen(fen):
  # return fen.replace("%1", "/")
  newfen = re.sub(r"(Þ)", '/', fen)

  # newfen = re.sub(r"\%20", " ", newfen)
  return newfen
