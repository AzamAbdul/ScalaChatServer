var express = require('express');
var mc = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;

var app = express();
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var qs = require('querystring');

//var url = 'mongodb://localhost:12345/mhacks';
function post_wrapper(req,respond, f){
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
		f(body)
	});
}

var url = 'mongodb://45.79.181.211:27017/test';


app.post('/registerClient', function(req,res) {

});

var findWithQuery = function(db, q_obj, callback, close_db) {
  //var cursor =db.collection('mhacks').find( {"raclose_db) 200});
  var cursor =db.collection('mhacks').find(q_obj);
  var arr = []
    var closed = false;
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    console.log(" - " + doc + "  "  + typeof(doc));
    if (doc != null) {
      //console.dir(doc);
      arr.push(doc);
    } else {
      if (close_db)
        db.close();
      closed = true;
      callback(arr);
    }
  });
  return;
};

app.get('/fetchBoards', function(req,res) {
  var user_lat = parseFloat(req.query.u_lat);
  var user_long = parseFloat(req.query.u_long);
  mc.connect(url, function(err,db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    console.log("user_lat: "+user_lat+" user_long: " + user_long);
    findWithQuery(db , 
        { "Geo"  : {$geoWithin: {$centerSphere: [[user_lat,user_long],  999991.0/3963.2  ]}}},
        function (array) {
          res.json(array);
          db.close();
        })
  });
});


app.post('/addBoard', function(req,res) {
	post_wrapper(req,res,function (body){
		var POST = qs.parse(body)
		var board_lat = POST.board_lat;
		var board_long = POST.board_long;
		var geo = {
			"type": "Point",
			"coordinates": [board_lat,board_long]
		}
		
		var board_radius = POST.board_radius;
		var board_title = POST.board_title;
		var board_desc = POST.board_desc;
		var url = 'mongodb://45.79.181.211:27017/test';

		mc.connect(url, function(err,db) {
			db.collection('mhacks').insert({"Geo":{ "type": "Point", "coordinates": [board_lat, board_long]},"comments":[],"radius":board_radius, 
				"title": board_title, "desc": board_desc , "users": []}, 
				function(err,records){
					
					
					res.json(records["ops"][0]);
				})
	
		});
	});


});


app.get('/fetchBoard', function(req,res) {
  var board_id = req.query.board_id
    mc.connect(url, function(err,db) {
      assert.equal(null, err);
      console.log("Connected correctly to server.");
      findWithQuery(db, {"_id": ObjectID.createFromHexString(board_id)} , function (array) {
        array = array.map(function (obj) {return obj.comments;});

        console.log("array " + array + " " + JSON.stringify(array));
        findWithQuery(db, {"_id": { $in : array[0] } }, function(arr) {
          res.json(arr);
          db.close();
        });
      },  false)
    });
});

app.post('/postToBoard', function(req, res) {
	
	post_wrapper(req,res, function(body){
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
