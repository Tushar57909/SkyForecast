import base64; s=open("fe.b64").read().strip(); open("src/pages/ForecastExplorer.tsx","wb").write(base64.b64decode(s)); print("OK")
