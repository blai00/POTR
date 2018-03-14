var mongoose = require('mongoose'),
	Item = require('../models/item.js'),
	Category = require('../models/category.js');
	Package = require('../models/package.js');


 // All callbacks in Mongoose use the pattern: callback(error, result). If an error occurs executing the query,
 // the error parameter will contain an error document, and result will be null.
 // If the query is successful, the error parameter will be null, and the result will be populated with the results of the query.

function ItemsController(){


	this.index = function(req,res){
		console.log('ItemsController index');
		var packages;
		var categories;
		Package.find({}, function (err, result) {
			if (err) {
				console.log(err);
			}else {
				packages = result;
			}
		})
		Category.find({}, function (err, result) {
			if (err) {
				console.log(err);
			}else{
				categories = result
			}
		})
		Item.find({}).populate("_package").sort({_category:'ascending'}).exec(function(err, items){
    		// This is the method that finds all of the items from the database
	    	if(err) {
	      		console.log(err);
	      		//res.status(500).send('Failed to Load Items');
	    	}
	    	else {

	        	//res.json({admin: req.session.admin, listOfItems: items});
				res.render('items', {items: items, admin: req.session.admin, userName: req.session.userName, packages: packages, categories: categories})

	        }
        })  // ends Item.find

	}; // ends this.index



	this.new = function(req,res){
		Category.find({}, function(err, categories) {
    		// This is the method that finds all of the items from the database
	    	if(err) {
	      		console.log(err);
	      		//res.status(500).send('Failed to Load Items');
	    	}
	    	else {
					if(req.session.admin){
						res.render('createItem', {categories: categories, userName: req.session.userName, admin: req.session.admin})
					}else{
						res.redirect('/api/packages')
					}
				}
		console.log('ItemsController new');
	});
}
	this.create = function(req,res){
		console.log('ItemsController create');
	    Item.create({name: req.body.itemName, description: req.body.itemDescription,
	      _category: req.body.category, donor: req.body.donor, restrictions: req.body.itemRestriction,
	      value: req.body.fairMarketValue, packaged: false, priority: req.body.priority},  function(err, result){
	    	// from front end ///////////
	    	//	   itemName: '',
      //           donor: '',
      //           category: '',
      //           fairMarketValue: '',
      //           itemDescription: '',
      //           itemRestriction:
	      if(err){
	        console.log(err);
	        //res.status(500).send('Failed to Create Item');
	      }
	      else{
	        res.redirect('/api/items')
	      }
	    });
	};


	this.edit = function(req,res){
		console.log('ItemsController show');
		// this gets the single item screen (if we want it)
		Item.findById(req.params.id, function(err, result){
			if(err){
	        console.log(err);
	      }
	      else{
			Category.find({}, function(err, categories) {
				// This is the method that finds all of the items from the database
				if(err) {
					  console.log(err);
					  //res.status(500).send('Failed to Load Items');
				}
				else{
					//res.json(result)
					if(req.session.admin){
						res.render('item_edit', {item:result, categories:categories, userName: req.session.userName, admin: req.session.admin});
					}else{
						res.redirect('/api/packages')
					}
				}

	      })
		}
	})
	};

	this.update = function(req,res){
		console.log('ItemsController update');
		Item.findById(req.params.id, function (err, item) {

		    if (err) {
                console.log(err);
		        //res.status(500).send('Failed to Update Item');
		    }
		    else {
		        // Update each attribute with any possible attribute that may have been submitted in the body of the request
		        // If that attribute isn't in the request body, default back to whatever it was before.
		        item.name = req.body.itemName || item.name;
		        item.description = req.body.itemDescription || item.description;
		        item.donor = req.body.donor || item.donor;
		        item.restrictions = req.body.itemRestriction || item.restrictions;
		        item.value = req.body.fairMarketValue || item.value;
		        item._category = req.body.category || item._category;



		        item.save(function (err, item) {
		            if (err) {
                        console.log(err)
		                //res.status(500).send('Failed to Save Item update')
		            }
                    else{
		              res.redirect('/api/items')
                    }
		        });
		    }
		});
	},  // end of this.update();


	//removing an item
	this.remove_item = function(req, res){
		Item.findOne({_id: req.params.id}, function(err, result){
			if(err){
				console.log(err)
			}else{
				Item.remove(result, function(err, result){
					if(err){
						console.log(err)
					}else{
						res.redirect('/api/items')
					}
				}
				)}
		});
	}
}
module.exports = new ItemsController();
