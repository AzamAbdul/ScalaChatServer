var express = require('express');
var mc = require('mongodb').MongoClient;
var app = express();
var assert = require('assert');

//var url = 'mongodb://localhost:12345/mhacks';
var url = 'mongodb://45.79.181.211:27017/test';
mc.connect(url, function(err,db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  //db.close();
});

app.post('/registerClient', function(req,res) {

});

app.get('/fetchBoards', function(req,res) {
  console.log(req.param('id'));

});

app.post('/addBoard', function(req,res) {
  console.log(req.body);

});

app.get('/fetchBoard', function(req,res) {

});

app.post('/postToBoard', function(req, res) {

});

app.listen(5000)
