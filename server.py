from flask import Flask
from flask import request

app = Flask("mhacks")

@app.route("/")
def root():
    return "get at root"

@app.route("/post",methods=['POST'])
def postNew():
    print(" - postNew : " + str(request.get_json()))

app.run()
