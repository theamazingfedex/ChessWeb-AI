import smtplib, os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

PASSWORD = os.environ.get('GMAIL_TEST_PASS')
source_email = 'brotatotestbot@gmail.com'
target_email = 'theamazingfedex+muxt1pyywtdnqri7ncry@boards.trello.com'

def send_email(message, subject="Bug Report"):
  msg = MIMEMultipart()
  msg['From'] = source_email
  msg['To'] = target_email
  msg['Subject'] = subject
  msg.attach(MIMEText(message))

  mailserver = smtplib.SMTP('smtp.gmail.com',587)
  # identify ourselves to smtp gmail client
  mailserver.ehlo()
  # secure our email with tls encryption
  mailserver.starttls()
  # re-identify ourselves as an encrypted connection
  mailserver.ehlo()
  try:
    mailserver.login(source_email, PASSWORD)

    mailserver.sendmail(source_email, target_email, msg.as_string())

    mailserver.quit()
  except(Exception):
    return '1'
  return '0'
