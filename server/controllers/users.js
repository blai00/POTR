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
	this.index = function(req,res){
		users_array = []
		User.find({}).exec(function(err,users)
		{
			if(err){
				console.log(err)
			}
			else{
				for(let i = 0; i < users.length; i ++){
					users_array.push({'id':users[i]._id , 'name': users[i].userName, 'admin_status': users[i].admin })
				}
			res.json(users_array)
			}
			
		})
		console.log('UsersController index');
	};
	// could use this to get the login/registration screen or for the admin to change between bidders
	this.new = function(req,res){
		console.log('UsersController new');
	};
	// post the new user registration form and create a new user
	// TESTING, NOT ENCRYPTING PASSWORD YET ///////////////////////////////////
	this.create = function(req,res){
		console.log('UsersController create');

		User.findOne({userName: req.body.userName}, function(err, duplicate) {
			if(err){
				console.log(err)
			}
			else if(duplicate){
				res.json({validated: false, message: "That username has already been used. Please pick a unique username."})
			}
			else{
				bcrypt.hash(req.body.password, null, null, function(err, hash) {
						if(err){
							console.log(err)
						}
						else{
							//The below function checks every parameter of req.body against the value in the first index of each array, using the zero index of each array as a specifier.  If the length is less than that, it uses the second index to help generate an error message and pushes it to output.
							function registrationValidation() {
								const validationArray = [
									["firstName", 2, "first name"],
                  ["lastName", 2, "last name"],
                  ["streetAddress", 2, "street address"],
                  ["city", 2, "city"],
                  ["states", 2, "state"],
                  ["zip", 5, "zip code"],
                  ["phoneNumber", 10, "phone number"],
                  ["email", 5, "email address"],
                  ["userName", 5, "user name"],
                  ["password", 6, "password"]
								];
								let output = "";
								for(let i = 0; i < validationArray.length; i++) {
									if (req.body[validationArray[i][0]].length < validationArray[i][1]) {
										output += "Please insert a " + validationArray[i][2] + " that is at least " + validationArray[i][1] + " characters in length.\n";
									}
								}
								return output
							}
							var validation = registrationValidation()

							console.log("before new regex, validation is", validation)
							var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
							var unValidatedEmail = req.body.email;
							var result = unValidatedEmail.match(reg);
							if (!result){
								validation += "Invalid email.\n"
							}
							console.log("after new regex, validation is", validation)

							if(validation.length > 0){
								res.json({validated: false, message: validation})
								return;
							}

							//Else, validation is ok, so hash the password and add to the database
							hashedPassword = hash;
							var adminStatus = (req.body.userName == "admin");
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
										res.json({validated: true, user: user, message: "Welcome, " + user.userName + "!"});
										res.json();
										return;
									}
							});
						}
				});
			}
		})
	};

	// TESTING, NOT ENCRYPTING PASSWORD YET ///////////////////////////////////
	this.login = function(req,res){

		console.log('UsersController login');
		User.findOne({userName: req.body.userName}, function(err, user){
			if(err){
				console.log(err);
			}
			else if(user){
				//Comparing inputted password to hashed password in db
				bcrypt.compare(req.body.password, user.password, function(err, match) {
					if(err){
						console.log(err)
					}
					else if(match){
						req.session.userName = user.userName
						req.session.admin = user.admin
						res.json({search: true, user: user, message: "Welcome, " + user.userName + "!"})
					}
					else{
						res.json({search: false, message: "Password does not match our database. Please ensure the information is correct, or click 'Sign Up' to register for a new account."})
					}
				})
			}
			else{
				res.json({search: false, message: "Username is not in our database. Please ensure the information is correct, or click 'Sign Up' to register for a new account."})
			}
		})
	}
	// get the screen for one user with all his/her bidded packages, noting which packages he/she is currently winning
	this.show = function(req,res){
		console.log('UsersController show');
        // User.findById(req.params.id, function(err, result){
        //     if(err){
        //         console.log('user show-err');
        //     }else{
        //         req.json(result);
        //     }
        // });
		User.findOne({userName: req.params.userName}, function(err, user){
			if(err){
				console.log(err)
			}
			else{
				res.json(user)
			}
		})
	};
	//are we allowing users to be able to edit / update their information
    this.update = function(req,res){
		console.log('UsersController update');
	}

	this.loggedin = function(req,res){
		console.log('reached loggedin function in server')
		var login_check = false;
		var admin;

		if (req.session.userName != undefined){
			login_check = true;
		}
		console.log(login_check);
		if(req.session.admin == true){
			admin = true;
		}else{
			admin = false;
		}
		res.json({login_check: login_check, admin: admin})
	}

	this.logout = function(req,res){
		req.session.destroy();
        return res.json(true)

	}

	this.who_is_logged_in = function(req, res){
		if(req.session.admin == true){
			res.json({admin: true})
		}else{
			res.json({admin: false})
		}
	}
}
module.exports = new UsersController();
