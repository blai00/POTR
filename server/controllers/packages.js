var mongoose = require('mongoose'),
	Item = require('../models/item.js'),
	Package = require('../models/package.js'),
	Category = require('../models/category.js'),
	User = require('../models/user.js');
var ObjectId = require('mongodb').ObjectId;

function PackagesController(){

	this.index = function(req,res){
		// maybe embed both (user and package find) in category to make it synchronous
		console.log('PackagesController index');
		var categoryArray = []
		var user
		//Joey & Brandon: Currently halting "_bids" populate call, as this will be embedded when db is refactored

		Category.find({}, function(err, categories) {
			if(err) {
					console.log(err);
					//res.status(500).send('Failed to Load Items');
			}
			else {
				for(c in categories){
					categoryArray.push(categories[c].name);
				}
				User.findOne({userName:req.session.userName}, function(err, result){
					if(err){
						console.log(err)
					}else{
						user = result
						Package.find({}).populate("_items").sort({priority: 'descending'}).exec(function(err, packages) {
											// This is the method that finds all of the packages from the database
							if(err) {
									console.log('Package Index Error');
									res.status(500).send('Failed to Load Packages');
							}else {
									console.log('this is user again', user)
									var featured = [];
									var nonfeatured = [];
									for (var i = 0; i < packages.length; i++){
										if(packages[i].featured === true){
											featured.push(packages[i]);
										}
										else{
											nonfeatured.push(packages[i]);
										}
									}
									res.render('packages', {packages: packages, admin: req.session.admin, userName: req.session.userName, user:user, categories: categoryArray, featured: featured, nonfeatured: nonfeatured})
							}
						})
					}

				})

			}
		})

		 // ends Package.find

	};


	this.edit = function(req,res){
		var categoryArray = [];
		var itemsArray = [];
		var total = 0;
		Category.find({}, function(err, categories) {
				if(err) {
						console.log(err);
						//res.status(500).send('Failed to Load Items');
				}
				else {
					for(c in categories){
						categoryArray.push(categories[c].name);
					}

		}
		console.log('PackagesController new');
	})
	Item.find({}, function(err, items) {
			// This is the method that finds all of the items from the database
			if(err) {
					console.log(err);
					//res.status(500).send('Failed to Load Items');
			}
			else {
				console.log(total);
				for(let i = 0; i<items.length; i++){
					if(!items[i].packaged){
					itemsArray.push(items[i]);
					console.log(itemsArray);
				}
				}

}
})



		Package.findById(req.params.id).populate("_items").exec(function(err,result){
			if(err){
				console.log(err);
			}
			else{
				let itemValues = result._items;
				 for(let i = 0; i < itemValues.length; i++){
					total += itemValues[i].value;
				 	console.log(result._items[i]);
				 }
				console.log("result is", result)
				res.render('packageEdit', {package: result, categories: categoryArray, items: itemsArray, total: total, userName: req.session.userName, admin: req.session.admin})
			}
		})
	}


this.new = function(req,res){
	var total = 0;
	var itemsArray = [];
	Item.find({}, function(err, items) {
			// This is the method that finds all of the items from the database
			if(err) {
					console.log(err);
					//res.status(500).send('Failed to Load Items');
			}
			else {
				console.log(total);
				for(item in items){
					itemsArray.push(items[item]);
					console.log(itemsArray);
				}

}
})
		Category.find({}, function(err, categories) {
	    	if(err) {
	      		console.log(err);
	      		//res.status(500).send('Failed to Load Items');
	    	}
	    	else {
					console.log(itemsArray);
					res.render('packageCreate', {categories: categories, total:total, items: itemsArray, userName: req.session.userName, admin: req.session.admin})
		}
		console.log('PackagesController new');
	})
}

	this.create = function(req,res){
		// this handles the form post that creates a new package
		console.log('PackagesController create');
		console.log('selected items' ,req.body)
	    //////// HOW ARE WE RECEIVING THE INCLUDED ITEMS?  Should be an array of item id's  //////
        /////// When creating Package, do we need to save the bids, seems to be missing in this create statement ////

		if (req.body.selectedItems.length == 0){
          console.log('reached empty item list')
		  return res.json(false)
		  //frontend validation / response if no items selected
        }


        Package.create({name: req.body.packageName, _items: req.body.selectedItems, description: req.body.packageDescription,
	    	value: req.body.totalValue, bid_increment: req.body.increments, _category: req.body.category,
			bid: [], amount: req.body.openingBid, priority: req.body.priority
			},
	    	function(err, package){


		      if(err){
				console.log(err);
				return;
		      }
		      else{

			    	for(var i=0; i<package._items.length; i++){
						console.log("Packaged ");
			    		Item.update({_id: package._items[i]}, { $set: { _package: package._id, packaged: true}}, function(err,result){
							if(err){
								console.log(err);
								return;
							}

						})
						if (i == package._items.length -1){
							res.redirect('/api/packages')
						}
					};
			    }
			  }
		); // end of Package.create



	};  // end of this.create




	this.show = function(req,res){
		console.log('PackagesController show');
		// sending ID by url or in req.body????????????????
		var user
		User.findOne({userName:req.session.userName}, function(err, result){
			if(err){
				console.log(err)
			}else{
				user = result
				Package.findById(req.params.id).populate("_items").exec(function(err,package){
					if(err){
						console.log(err);
					}
					else{
						// res.json({packages: result});
						console.log(package)
						var our_bids = false
						var lastBid = package.amount
						if(package.bids.length > 0){
							our_bids = true;
							lastBid = package.bids[package.bids.length -1 ].bidAmount
						}
						res.render('package_show',{package:package, userName: req.session.userName, admin: req.session.admin, user:user, ourBids: our_bids, lastBid: lastBid})
					}
				})
			}

		})

	};

	this.update = function(req,res){
		console.log('PackagesController update');
		Package.findById(req.params.id, function (err, package) {
			console.log(package);
		    if (err) {
		        res.status(500).send(err);
		    }

		    else {

				console.log("update pacakge");
						Item.find({_id: package._items}, function(err, items) {
							if (err) {
								console.log(err);
							}else{
								for (var i = 0; i < items.length; i++) {
									items[i].packaged = false;
									items[i]._package = null;
									items[i].save()
								}
							}
						})
		        // Update each attribute with any possible attribute that may have been submitted in the body of the request
		        // If that attribute isn't in the request body, default back to whatever it was before.
		        package.name = req.body.packageName || package.name;

		        package.description = req.body.packageDescription || package.description;
		        package.bids[0] = req.body.openingBid || package.bids[0];
		        package.value = req.body.totalValue || package.value;
		        package.bid_increment = req.body.increments || package.bid_increment;
		        package._category = req.body.category || package._category;

		        // we don't want the items removed from this package to still show this package in their
				// item._package field so we will just set each current item._package to null
				// this shows sets all items in current package to unpackaged (currently)
				// we want all items in this package AND all unpacked items (future design)
				package._items = req.body.selectedItems;
		        // for(var i=0; i<package._items.length; i++){
				// 	console.log("Packaged ");
				// 	Item.update({_id: package._items[i]}, { $set: { _package: package._id, packaged: true}}, function(err,result){
				// 		if(err){
				// 			console.log(err);
				// 			return;
				// 		}

				// 	})
				// 	if (i == package._items.length -1){
				// 		return res.json(true)
				// 	}
				// };
		        // now set package._items to the items in this request, we will reset the appropriate item._package fields below



		        // Save the updated document back to the database
				console.log("before package save");
		        package.save(function (err, package) {
					console.log("Package save")
		            if (err) {
                        console.log(err)
		                //res.status(500).send(err)
		            }
		            else{
		            	// update the items in this package
						console.log("save update pacakge")
		    					for(let i = 0; i < package._items.length; i++ ){
									//Item.update({_id: id}, { $set: { _package: package.id}});

									Item.findOne({_id: package._items[i]} , function(err, item){
											item.packaged = true;
											item._package = package.id;

											item.save(function (err){
												if (err){
													console.log(err)
												}
												else{


												}
											})
									})




		    					}

		            	res.redirect('/api/packages/' + package._id );
		            }
		        });
		    }
		});
	}  // end of this.update();

	// old category filtering
	// this.get_selected = function(req, res){
	// 	Package.find({_category:req.body.category}, function(err, result){
	// 		if(err){
	// 			console.log(err)
	// 		}else{
	// 			res.json(result)
	// 		}
	// 	})
	// },

	//removing a package from the DB
	this.remove_package = function(req, res){
		console.log('in remove_package')
		Package.findOne({_id: req.params.id}, function(err, result){
			if(err){
				console.log(err)
			}else{
				console.log('this is result',result)
				for(var j = 0; j < result.bids.length; j++){
					console.log('this is j', j)
					User.findOne({userName: result.bids[j].name}, function(err, user){
						if(err){
							console.log(err)
						}else{
							console.log("found_user", user)
							for(var k= 0; k< user._packages.length; k++ ){
								console.log("this is result", result)
								if(result._id === user._packages[k]){

									user._packages.splice(k,1)
								}
							}
							user.save(function(err,result){
								if(err){

									console.log(err)
								}else{
									console.log("JOEY")
								}
							})
						}
					})
				}
				for(var i = 0; i < result._items.length; i++){
					console.log('item_update')
					Item.update({_id: result._items[i]}, {$set: {packaged: false, _package: null}}, function(err, result){
						if(err){
							console.log(err)
						}
					});
				}


				Package.remove({_id: req.params.id}, function(err, package){
					if(err){
						console.log(err)
					}else{
						res.redirect('/api/packages');
					}
				})
			}

		})

	}
	this.featured = function(req, res) {
		Package.findById(req.params.id, function(err, package) {
			if(err){
				console.log(err);
			}else if (package.featured === true) {
				package.featured = false;
			}else{
				package.featured = true;
			}
			package.save()
			res.redirect('/api/packages')
		})
	}
	//cancels last bid
	this.cancel_bid = function(req,res){
		Package.findById(req.params.id, function(err,package){
			if(err){
				console.log(err)
			}else{
				var bid	= package.bids[package.bids.length - 1]
				//console.log('before if statement' + package)
				if(bid.name === req.session.userName){
					//console.log('this is the bid' + bid)
					package.bids.pop()
					package.save()
					//console.log('this is the package' + package)

					//in case client want package not to show on user page
					//maybe they want to bid again on the package later
					//User.findOne({userName: req.session.userName}, function(err, user){

					//})
				}
				res.redirect('/api/users/' + req.session.userName)
			}
		})
	}


}

module.exports = new PackagesController();
