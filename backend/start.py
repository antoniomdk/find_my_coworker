from subprocess import Popen

server = Popen(["uvicorn", "main:app"])
ngrok = Popen(["./ngrok", "http", "8000"])
ngrok.wait()
server.terminate()