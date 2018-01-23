var mongoose = require('mongoose'),
	Item = require('../models/item.js'),
	Package = require('../models/package.js'),
	Category = require('../models/category.js'),
	User = require('../models/user.js');
var ObjectId = require('mongodb').ObjectId;



function PackagesController(){

	this.index = function(req,res){
		console.log('PackagesController index');

		//Joey & Brandon: Currently halting "_bids" populate call, as this will be embedded when db is refactored

		Package.find({}).populate("_items").exec(function(err, packages) {

				// This is the method that finds all of the packages from the database
				if(err) {
						console.log('Package Index Error');
						res.status(500).send('Failed to Load Packages');
				}
				else {
						res.json({packages: packages, admin:req.session.admin});
					}
				})  // ends Package.find

	};


	this.new = function(req,res){
		// this would be the method that gets the new package form but this is probably handled independently by React
		console.log('PackagesController new');
	};


	this.create = function(req,res){
		// this handles the form post that creates a new package
		console.log('PackagesController create');

		console.log("req body selectedItems", req.body.selectedItems);
	    //////// HOW ARE WE RECEIVING THE INCLUDED ITEMS?  Should be an array of item id's  //////
        /////// When creating Package, do we need to save the bids, seems to be missing in this create statement ////
	    if (req.body.selectedItems.length == 0){
          console.log()
          console.log('reached empty item list')
          return res.json(false)
        }


        Package.create({name: req.body.packageName, _items: req.body.selectedItems, description: req.body.packageDescription,
	    	value: req.body.totalValue, bid_increment: req.body.increments, _category: req.body.category,
			bid: [], amount: req.body.openingBid
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
							return res.json(true)
						}
					};
			    }
			  }
		); // end of Package.create



	};  // end of this.create




	this.show = function(req,res){
		console.log('PackagesController show');
		// sending ID by url or in req.body????????????????
		Package.findById(req.params.id).populate("_items").exec(function(err,result){
			if(err){
				console.log(err);
			}
			else{
				res.json({packages: result});
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
		        // Update each attribute with any possible attribute that may have been submitted in the body of the request
		        // If that attribute isn't in the request body, default back to whatever it was before.
		        package.name = req.body.packageName || package.name;

		        package.description = req.body.packageDescription || package.description;
		        package.bids[0] = req.body.openingBid || package.bids[0];
		        package.value = req.body.fairMarketValue || package.value;
		        package.bid_increment = req.body.increments || package.bid_increment;
		        package._category = req.body.category || package._category;

						//-------------------------------------------------------------------
						// ATTENTION!!! making our oldItems & newItems  to the same format
						//-------------------------------------------------------------------

							// array of numbers [1000, 1002]
							var oldItems = package._items;

							// req.body.selectedItems is array of objects [{_id, ..},{}]
							var newItems = [];
							// making it the same data format as package._items [1000, 1002, ...]
							for(let i=0; i< req.body.selectedItems.length; i++){
								newItems.push(req.body.selectedItems[i]._id);
							}

						// (1) FIRST: we setting all old items "packaged" to false, and deleting (unsetting) reference _package to our package
								if(oldItems.length > 0) {
									for(var i=0; i<oldItems.length; i++){
										console.log("Packaged ");
										// setting packaged to false, and UNSETTING _package reference (it is better practice than setting it to null)
										Item.update({_id: oldItems[i]}, { $set: {packaged: false}, $unset: { _package: "" }}, function(err,result){
											if(err){
												console.log("???--> $unset old _items error: ", err);
											}
										})
									}
								}

		        // updating package._items with new array of IDs coming from "edit page"
		        package._items = newItems ;

						// (1) SECOND: now we are setting all (new) items's "packaged" to true, and making (setting) reference _package to our package ID
								for(var i=0; i<package._items.length; i++){
								console.log("Packaged ");
					    		Item.update({_id: package._items[i]}, { $set: { _package: package._id, packaged: true}}, function(err,result){
											if(err){
												console.log("?&?? --> $set new _items error: ", err);
											}
									})
								};


		        // Save the updated document back to the database
						console.log("before package save");
		        package.save(function (err, package) {
							console.log("Package save")
		            if (err) {
                        console.log("*** ---> saving updated package error: ", err)
		            }
		            else{
									return res.json(true)
		            }
		        });
		    }
		});
	}  // end of this.update();

	this.get_selected = function(req, res){
		Package.find({_category:req.body.category}, function(err, result){
			if(err){
				console.log(err)
			}else{
				res.json(result)
			}
		})
	},

	//removing a package from the DB
	this.remove_package = function(req, res){
		Package.findOne({_id: req.body.package_id}, function(err, result){
			if(err){
				console.log(err)
			}else{
				for(var i = 0; i < result._items.length; i++){
					Item.update({_id: result._items[i]}, {$set: {packaged: false, _package: null}}, function(err, result){
						if(err){
							console.log(err)
						}
					});
				}
				Package.remove({_id: req.body.package_id}, function(err, result){
					if(err){
						console.log(err)
					}else{
						res.json(result);
					}
				})
			}

		})

	}

	// Item.update({_id: package._items[i]}, { $set: { _package: package._id, packaged: true}}

}


module.exports = new PackagesController();
