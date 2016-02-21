var express = require('express');
var mc = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;

var app = express();
var assert = require('assert');
var qs = require('querystring');

//var url = 'mongodb://localhost:12345/mhacks';
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
  console.log(req.body);

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
  console.log(req.body)
    var body = '';
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
    var user_name = POST.user_name;
    var comment = POST.comment;
    console.log("board_id: " + board_id +" user_id: " +user_id + " user_name: " + user_name) 
      var url = 'mongodb://45.79.181.211:27017/test';

    mc.connect(url, function(err,db) {
      assert.equal(null, err);
      console.log("Connected correctly to server.");

      var comment_id = db.collection('mhacks').insert({"type" : "comment" , "txt" : comment, "user_id": user_id , "board_id" : board_id , "time": (new Date()).getTime()})
        db.collection('mhacks').update( { "_id": "ObjectId("+board_id +")"},{ "$push": { "comments": "ObjectId("+comment_id+")" } } )
    });

  });


});

app.listen(5000)
