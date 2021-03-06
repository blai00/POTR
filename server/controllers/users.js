var bcrypt = require('bcrypt-nodejs');

var mongoose = require('mongoose'),
	User = require('../models/user.js'),
	Address = require('../models/address.js'),
	Package = require('../models/package.js');

 // All callbacks in Mongoose use the pattern: callback(error, result). If an error occurs executing the query,
 // the error parameter will contain an error document, and result will be null.
 // If the query is successful, the error parameter will be null, and the result will be populated with the results of the query.

function UsersController(){
	// get all bidders and their packages won, audit page
	function registrationValidation(input) {
		const validationArray = [
			["firstName", 2, "first name"],
			["lastName", 2, "last name"],
			["streetAddress", 2, "street address"],
			["city", 2, "city"],
			["states", 2, "state"],
			["zip", 5, "zip code"],
			["phoneNumber", 10, "phone number"],
			["password", 6, "password"]
		];
		let output = "";
		for(let i = 0; i < validationArray.length; i++) {
			console.log(validationArray[i]);
			if (input[validationArray[i][0]].length < validationArray[i][1]) {
				output += "Please insert a " + validationArray[i][2] + " that is at least " + validationArray[i][1] + " characters in length.\n";
			}
		}
		return output
	}
	this.index = function(req,res){
		console.log('UsersController index');
		User.find({}, function(err, users ){
			if(err){
				console.log(err)
			}else{
				var hash = {}
				if(req.session.admin){
					res.render('admin', {users :users, admin_hash: hash, userName: req.session.userName, admin: req.session.admin})
				}else{
					res.redirect('/api/packages')
				}
			}
		})
	};



	// could use this to get the login/registration screen or for the admin to change between bidders
	this.new = function(req,res){
		console.log('hi');
		res.render('login', {userName: req.session.userName, admin: req.session.admin })
	};
	this.register = function(req,res){
		console.log('this is the validation')
		res.render('user', {userName: req.session.userName, admin: req.session.admin})
	}
	// post the new user registration form and create a new user
	// add redirect when done with refactor
	this.duplicate = function (req, res) {
		console.log('dupe', req.query);
		let user = req.query.userName;
		User.findOne({userName: { $regex : new RegExp(user, "i") }}, function (err, duplicate) {
			console.log(duplicate);
			if(err){
				console.log(err);
			}else if (duplicate) {
				console.log("true");
				res.json('Username is taken')
			}else {
				console.log('false');
				res.json('true')
			}
		})

	}
	this.create = function(req,res){
		console.log('UsersController create');
		//this is here just in case
		let user = req.body.userName;
		User.findOne({userName: { $regex : new RegExp(user, "i") }}, function (err, duplicate) {
			if(err){
				console.log(err)
			}
			else if(duplicate){
				console.log(duplicate);
			}
			else{
				//start actual registration
				bcrypt.hash(req.body.password, null, null, function(err, hash) {
						if(err){
							console.log(err)
						}
						else{

							var validation = registrationValidation(req.body)
							// email regex validation
							console.log("before new regex, validation is", validation)
							var email_reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
							var unValidatedEmail = req.body.email;
							var email_result = unValidatedEmail.match(email_reg);
							if (!email_result){
								validation += "Invalid email.\n"
							}

							// userName regex validation based on no spaces in userName
							var user_reg = /^[a-zA-Z0-9\-_.]{5,25}$/;
							var unValidateduserName = req.body.userName;
							var user_result = unValidateduserName.match(user_reg)
							if(!user_result){
								validation += 'Use letters, numbers, and -(dash) or _(underscore) ONLY; between 5-25 characters for userName.\n'
							}


							console.log("after new regex, validation is", validation)
							if(validation.length > 0){
								res.json({validated: false, message: validation})
								return;
							}

							//Else, validation is ok, so hash the password and add to the database
							hashedPassword = hash;
							var lowerUser = req.body.userName.toLowerCase();
							var adminStatus = (lowerUser === "admin");
							User.create({
								userName: req.body.userName,
								firstName: req.body.firstName,
								lastName: req.body.lastName,
								phone: req.body.phoneNumber,
								email: req.body.email,
								streetAddress: req.body.streetAddress,
								city: req.body.city,
								states: req.body.states,
								zip: req.body.zip,
								password: hash,
								admin: adminStatus
							},
							function(err, user){
									if(err){
										console.log(err)
									}
									else{
										req.session.userName = user.userName
										req.session.admin = user.admin
										// res.json({validated: true, user: user, message: "Welcome, " + user.userName + "!"});
										// res.json();
										// add redirect when done with refactor
										res.redirect('packages')
										return;
									}
							});
						}
				});
			}
		})
	};

	this.checkLogin = function(req, res){
		console.log("in check login");
		console.log('req.body', req.body);
		theName = req.body.userName;
		User.findOne({userName: { $regex : new RegExp(theName, "i") }}, function(err, user){
			if(err){
				console.log(err);
			}
			else if(!user){
				console.log("Did not find a user")
				// res.write("a user was not found")
				res.json({match: false})
			}
			else if(user){
				//Comparing inputted password to hashed password in db
				bcrypt.compare(req.body.password, user.password, function(err, match) {
					if(err){
						console.log(err)
					}
					else if(match){
						console.log("found match")
						req.session.userName = user.userName
						req.session.admin = user.admin
						res.json({match: true})
					}
					else{
						console.log("did not find match")
						res.json({match: false})
					}
				})
			}
		})
	}
	// get the screen for one user with all his/her bidded packages, noting which packages he/she is currently winning
	this.show = function(req,res){

		console.log('UsersController show');
		User.findOne({userName: req.params.userName}).populate("_packages").exec( function(err, user){
			if(err){
				console.log(err)
			}

			//Added new code to use package.find, which return an array of packages, rather than using our old strategy of package.findById with a for-loop, which just seemed hacky and cause asynchronousity issues
			else{
				//console.log(user)
				if (user.userName === req.session.userName | req.session.admin === true){
					res.render('userPage', {userName: req.session.userName, admin: req.session.admin, user: user})
				}else{
					res.redirect('/api/packages')
				}
			}
		})
	};
	//are we allowing users to be able to edit / update their information
    this.update = function(req,res){
		console.log('UsersController update');
		User.findById(req.params.id ,  function(err, user){
			if (err){
				console.log(err)
			}else {
				user.admin = req.body.admin || user.admin

				user.save(function(err, user){
					if(err){
					console.log(err)
					}else{
						res.send(user)
					}
				})
			}
		})
	}
	this.admin_change = function(req,res){
		console.log('UsersController admin_change')
		console.log('req.body:', req.body)

		// //C ould potentially update this using a foreach loop and such, although not sure if it would be asychronously correct
		// User.find({"_id": Object.keys(req.body)}, function(err, users){
		// })

		for(let users in req.body){
			User.findById(users, function(err, user){
				if (err){
					console.log(err)
				}else {

					if (user.userName != 'admin') {
						console.log(user.userName);
						user.admin = req.body[users]
						user.save(function(err, result){
							if (err){
								console.log(err)
							}
						})
					}
				}
			})
		}
		setTimeout(function() {
			res.redirect('/api/users');
		}, 100);

	}

	// old login check function
	// this.loggedin = function(req,res){
	// 	console.log('reached loggedin function in server')
	// 	var login_check = false;
	// 	var admin;

	// 	if (!req.session.userName){
	// 		login_check = false;
	// 	}
	// 	else {
	// 		console.log(req.session.userName);
	// 		console.log(req.session);
	// 		login_check = true;
	// 	}
	// 	console.log('login check v');
	// 	console.log(login_check);
	// 	console.log(req.session);
	// 	if(req.session.admin == true){
	// 		admin = true;
	// 	}else{
	// 		admin = false;
	// 	}
	// 	res.json({login_check: login_check, admin: admin})
	// }

	this.logout = function(req,res){
		req.session.destroy();
		console.log(req.session);
        res.redirect('/api/packages')

	}


	this.who_is_logged_in = function(req, res){
		if(req.session.admin == true){
			res.json({admin: true})
		}else{
			res.json({admin: false})
		}
	}

	this.interested = function(req, res) {
		console.log("Interested");
		User.findOne({userName: req.session.userName}, function(err, user) {
			if (err) {
				console.log(err);
			}else {
				console.log("user in interested", user);
				let flag= false
				for (var i = 0; i < user._packages.length; i++) {
					if (user._packages[i] == req.params.id) {

						flag = true;
						console.log("1",flag);
						break
					}
				}
				console.log("2",flag);
				if (flag === false) {
					console.log("3",flag);
					user._packages.push(req.params.id);
					user.save(function(err, result) {
						if (err) {
							console.log(err);
						}
					});
				} else {
					flag = false;
				}
			}
			res.redirect('/api/packages')
		})
	}
	this.uninterested= function(req,res) {
		User.findOne({userName: req.session.userName}, function(err, user) {
			if (err) {
				console.log(err);
			}else {
				for (var i = 0; i < user._packages.length; i++) {
					if (user._packages[i] == req.params.id) {
						console.log("in uniterested");
						user._packages.splice(i,1)
						user.save(function (err, result) {
							if (err) {
								console.log(err);
							}else{
								console.log(user._packages)
							}
						})
					}
				}

			}
			res.redirect('/api/packages')
	})
	}

	this.updateList= function(req,res){

		User.findById(req.params.user_id,function(err,user){
			if (err){
				console.log(err)
			}else{
				updatedList = req.params.result.split(',')
				for(let i = 0; i < updatedList.length; i++){
					updatedList[i] = parseInt(updatedList[i])
				}
				user._packages = updatedList
				user.save(function(err,result){
					if(err){
						console.log(err)
					}else{
						console.log(result)
					}
				})
			}

		})
	}
}
module.exports = new UsersController();
