import re, logging

def decode_fen(fen):
  # return fen.replace("%1", "/")
  newfen = re.sub(r"(Þ)", '/', fen)

  # newfen = re.sub(r"\%20", " ", newfen)
  return newfen


def get_log_level(log_level):
  return {
    10: logging.DEBUG,
    20: logging.INFO,
    30: logging.WARN,
    40: logging.ERROR,
    50: logging.CRITICAL
  }.get(log_level, logging.INFO)

