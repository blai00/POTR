
var express = require("express");
var app = express();
var session = require('express-session')
require('jsdom-global')()


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
app.use(bodyParser.urlencoded({ extended: true }));


var path = require("path");
app.use(express.static("../public"));

// static content
// static content
if (process.env.NODE_ENV === "production") {
		app.use(express.static(path.join(__dirname, "../wireframe/css")));
		//app.use('*', express.static('../client/build'));
//		app.use('/api/', function(){
//			break outer;
//		});
//		app.use('*', express.static(path.join(__dirname, "../client/build")));
//		app.use('*/api/', express.static(path.join(__dirname, "./config/routes.js")));
} else {
		// app.use(express.static(path.join(__dirname, "../client/public")));
		app.use(express.static(path.join(__dirname, "../wireframe/css")));
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
var User = require('./models/user.js');

var io = require('socket.io').listen(server);

// allBidsObject to store all bids in controller to reduce DB requests
	var allBidsBigObj = {
	  // package1: [
	  //     {bid: 150, name: "Yarik"},
	  //     {bid: 200 name: "Brendan"}
	  //   ]
	}
// oblect to store the state of "place bid" button enabled/disabled
	var packagesButtonStates = {};

// ------------------------------------ 000 -----------------------------------
// SELF INVOCING FUNCTION WHICH SHOULD BE CALLED ONCE JUST AFTER SERVER STARTED
// IT WILL FILL UP OUR SERVER OBJECTS "allBidsBigObj" and "packagesButtonStates" WITH
// INFO AND ALL BUTTON ENABLED FLAGS
		(function(){
			Package.find({}).exec(function(err,pkgs){
				if(err) { console.log("init Server object error", err)}
				else {
					for(let i=0; i<pkgs.length; i++){
						// all buttons are enabled to push
						packagesButtonStates[pkgs[i]._id] = {};
						packagesButtonStates[pkgs[i]._id].buttonstate = true;
						// all latest bid info will be in serverAllBidsObject now
						allBidsBigObj[pkgs[i]._id] = [];

							if(pkgs[i].bids.length != 0){

									allBidsBigObj[pkgs[i]._id].push({
										bid: pkgs[i].bids[pkgs[i].bids.length-1].bidAmount,
										name: pkgs[i].bids[pkgs[i].bids.length-1].name
									});

							} else {
								allBidsBigObj[pkgs[i]._id].push({
									bid: "none",
									name: "nobody"
								});
							}

					}
				}
			})
			console.log("self invocing initialization of SERVER objects was done")
		})()
// ---------------------------------- 000 --------------------------------------


io.sockets.on('connection', function(socket){

// DEBUGGING INFO JUST TO MONITOR allBidsObject is healty
console.log("/".repeat(20) + " allBidsBigObj before socket logic " + "/".repeat(20));
console.dir(allBidsBigObj); console.log("/".repeat(20));

  	// ALL BID LOGIC
		// THE CHANNEL "msg_sent" TO LISTEN ALL BIDS FROM FRONTEND, AND RETURN THEM BACK
		// USING UNIQUE CHANNELS WITH PACKAGE IDs
    socket.on("msg_sent", function(data) {

			// THE UNIQUE CHANNEL FOR PARTICULAR PACKAGE WITH IT'S ID IN THE END
			var uniqChatUpdateId = 'update_chat' + data.packId;
			console.log("message was received in server")
			console.log("in server, bid is ", data.bid)

			// WE WANT TO DISABLE ALL BUTTONS UNTIL WE UPDATE THE DATABASE AND SERVER OBJECT
					var buttonStateChannel = 'button_state' + data.packId;
		      io.emit(buttonStateChannel, {
						button: false
					} );
					io.emit("serverTalksBack", {packId: data.packId, bid: data.bid})

// ------------------------------ 001 -------------------------------
// IF statement of "package button state" on the SERVER to prevent overload of mongoDB
// with multiple update-request for one package if occasionaly SOCKET's will delay with
// button disabling, and multiple bids (with the same amount) will be received.
if(packagesButtonStates[data.packId].buttonstate){
	// NOW NOBODY WILL BE ALLOWED TO MAKE A BID IN THIS PACKAGE UNTILL
	// WE FINISHED TO UPDATE DATABASE SERVER OBJECT ETC.
	packagesButtonStates[data.packId].buttonstate = false;
// -------------------------------------------------------------------

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
console.log('data', data);
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
			User.findOne({userName: data.userName}).exec(
        function(err, user){
          if(err){
            console.log("error occured " + err);
          } else {
						console.log(user);
						if(user != null){
							var duplicatePackage = false;
							for(var i = 0; i < user._packages.length; i++){
								console.log("user", user._packages[i]);
								console.log("data", data.packId);
								if (user._packages[i] == data.packId){
									duplicatePackage = true;

									break;
								}
							}
							if (duplicatePackage === false){
								console.log(data);
								console.log(duplicatePackage);
								user._packages.push(parseInt(data.packId))
								user.save(function(err){
									if(err){
										console.log("error when saving: " + err);
									} else{
										console.log("successfully ");
									}
								})
							}
						}


          }
        }
      )

			// EMITTING MESSAGE WITH LATEST BID AMOUNT AND BIDDER NAME
			io.emit(uniqChatUpdateId, {
				lastBid: data.bid,
				userBidLast: data.userName
			} );

			// NOW WE ENABLING ALL BUTTONS ON THIS PACKAGE TO ALLOW MAKE BIDS FOR OTHERS
			setTimeout(function(){
				io.emit(buttonStateChannel, {
					button: true
				} );
				console.log("button was enabled ")
			},500);
			// NOW SOMEBODY ELSE CAN PLACE A BID ON THIS PACKAGE AGAIN
			packagesButtonStates[data.packId].buttonstate = true;


// ------------------------------- 001 -------------------------------
// IF statement of package button state to prevent overload of mongoDB
}
// -------------------------------------------------------------------


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

		// FOR ALL PACKAGES SEND OBJECT WITH ALL BIDS
		socket.on("package_page_refresh", function(data) {
			console.dir(allBidsBigObj);
			io.emit("allPackagesChannel", allBidsBigObj );
		})

    socket.on("disconnect", () => console.log("Client disconnected"));
  // ALL BID LOGIC


})
