var express = require('express');
var mc = require('mongodb').MongoClient;
var app = express();
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var qs = require('querystring');

//var url = 'mongodb://localhost:12345/mhacks';

app.post('/registerClient', function(req,res) {

});

app.get('/fetchBoards', function(req,res) {
	var user_lat = req.query.u_lat;
	var user_long = req.query.u_long;
	var url = 'mongodb://45.79.181.211:27017/test';
	mc.connect(url, function(err,db) {
		assert.equal(null, err);
		console.log("Connected correctly to server.");
		console.log("user_lat: "+user_lat+" user_long: " + user_long);
		findBoards(db,function () {})

	});


});

var findBoards = function(db,callback) {
	var cursor =db.collection('mhacks').find( {"radius": 200});
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			console.dir(doc);
			db.close();
		} else {
			db.close();
			callback();
		}
	});
};

app.post('/addBoard', function(req,res) {
	console.log(req.body);

});

app.get('/fetchBoard', function(req,res) {

});

app.post('/postToBoard', function(req, res) {
	var body = '';
	// Grabs the post data
	req.on('data', function (data) {
		body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                req.connection.destroy();
            }
        });
	req.on('end', function () {

		var POST = qs.parse(body);
		var board_id = POST.board_id;
		var user_id = POST.user_id;
		
		var comment = POST.comment;
		var url = 'mongodb://45.79.181.211:27017/test';

		mc.connect(url, function(err,db) {
			assert.equal(null, err);
			console.log("Attempting to insert comment into board");

			db.collection('mhacks').insert(
				{"type" : "comment" , "txt" : comment, "user_id": user_id , "board_id" : new ObjectID(board_id), "time": (new Date()).getTime()},
				
				function(err, records){
  					var comment_id = records["ops"][0]['_id']
  					db.collection('mhacks').update( { "_id":new ObjectID(board_id)},{ "$push": { "comments": new ObjectID(comment_id) } } )
				});
		});

	});

	
});
app.listen(5000)
