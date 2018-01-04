
var express = require("express");
var app = express();
var session = require('express-session')

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;




app.use(session({
  secret: 'Sd9JKlui26nbM52UQwer0pM15oPzXL',
  resave: false,
  saveUninitialized: true,
  rolling: true //resets session timeout everytime the user interacts with the site
}));

var React = require('../client/node_modules/react');
// var jsx = require('node-jsx');
// jsx.intall();

var bodyParser = require('body-parser');
app.use(bodyParser.json());


var path = require("path");


// static content
// static content
if (process.env.NODE_ENV === "production") {
		app.use(express.static(path.join(__dirname, "../client/build")));
		//app.use('*', express.static('../client/build'));
//		app.use('/api/', function(){
//			break outer;
//		});
//		app.use('*', express.static(path.join(__dirname, "../client/build")));
//		app.use('*/api/', express.static(path.join(__dirname, "./config/routes.js")));
} else {
		app.use(express.static(path.join(__dirname, "../client/public")));
}
// app.set('views', path.join(__dirname, '../client/frontend/public'));
// app.set('views', path.join(__dirname, './views'));


///////////////////////////////////////////////////////////////////////////////////
//////// THIS PORTION IS TEMPORARY - IT IS JUST HERE TO RUN THE HTML MOCKUPS OF THE
//////// UNINTEGRATED BIDDER SCREENS FOR OUR PRESENTATION TO THE CLIENT ON 7/28/17
app.set('views', path.join(__dirname, '../wireframe'));
app.set('view engine', 'ejs');
//////////////////////////////////////////////////////////////////////////////////

// require the mongoose configuration file which does the rest for us
//////  REMEMBER TO GO TO "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" /////////
require('./config/mongoose.js');

var routes_setter = require('./config/routes.js');
routes_setter(app);


// tell the express app to listen on port 8000
var port = process.env.PORT || 8000;
var server = app.listen(port, function() {
 console.log("listening on port "+port);
})




/////////////// SOCKETS /////////////////
var Package = require('./models/package.js')

var io = require('socket.io').listen(server);

// allBidsObject to store all bids in controller
var allBidsBigObj = {
  // package1: [
  //     {bid: 150, name: "Yarik"},
  //     {bid: 200 name: "Brendan"}
  //   ]
}

io.sockets.on('connection', function(socket){


console.log("/".repeat(20) + " allBidsBigObj before socket logic " + "/".repeat(20))
console.dir(allBidsBigObj)
console.log("/".repeat(20))

  // ALL BID LOGIC
    socket.on("msg_sent", function(data) {

      var userBid = data.bid;
      var userName = data.userName;

      if(allBidsBigObj[data.packId] == undefined){
        allBidsBigObj[data.packId] = [];
      }

      allBidsBigObj[data.packId].push({
        bid: data.bid,
        name: data.userName
      })

console.log("/".repeat(20) + " after upd allBidsBigObj " + "/".repeat(20) )
console.dir(allBidsBigObj)

      Package.findById(data.packId).exec(
        function(err, data){
          if(err){
            console.log("error occured " + err);
          } else {
						if(data != null){
							if(data.bids.length == 0 ){
								data.bids.push({
									bidAmount: userBid,
									name: userName
								});
							} else {
								// if our bids array already NOT EMPTY
										if(data.bids[data.bids.length - 1].bidAmount < userBid ) {
			                data.bids.push({
			                  bidAmount: userBid,
			                  name: userName
			              });
			            }
								// END of if our bids array already NOT EMPTY
							}
								// SAVE ALL STUFF
								data.save(function(err){
									if(err){
										console.log("error when saving: " + err);
									} else{
										console.log("successfully ");
									}
								})
						}


          }
        }
      )


      var uniqChatUpdateId = 'update_chat' + data.packId;

      // PREVIOUS VERSION FROM CHAT LOGIC
      io.emit(uniqChatUpdateId, {
        lastBid: data.bid,
        userBidLast: data.userName
      } )

    })

    socket.on("page_refresh", function(data) {
      var uniqChatUpdateId = 'update_chat' + data.pId;
      var packId = data.pId;



      if(allBidsBigObj[packId] ==  undefined){
          io.emit(uniqChatUpdateId, {
            lastBid:"none",
            userBidLast:"nobody"
          })
      } else {
          io.emit(uniqChatUpdateId, {
            lastBid: allBidsBigObj[packId][allBidsBigObj[packId].length-1].bid,
            userBidLast: allBidsBigObj[packId][allBidsBigObj[packId].length-1].name,
            socket_current_bid: this.lastBid
          })
      }

    })

    socket.on("disconnect", () => console.log("Client disconnected"));
  // ALL BID LOGIC


})
