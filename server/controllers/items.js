var mongoose = require('mongoose'),
	Item = require('../models/item.js'),
	Category = require('../models/category.js');


 // All callbacks in Mongoose use the pattern: callback(error, result). If an error occurs executing the query,
 // the error parameter will contain an error document, and result will be null.
 // If the query is successful, the error parameter will be null, and the result will be populated with the results of the query.

function ItemsController(){


	this.index = function(req,res){
		console.log('ItemsController index');
		Item.find({}, function(err, items) {
    		// This is the method that finds all of the items from the database
	    	if(err) {
	      		console.log(err);
	      		//res.status(500).send('Failed to Load Items');
	    	}
	    	else {
	        	res.json({admin: req.session.admin, listOfItems: items});
	        }
        })  // ends Item.find

	}; // ends this.index



	this.new = function(req,res){
		// this would bring up the new item form screen
		console.log('ItemsController new');
	};

	this.create = function(req,res){
		console.log('ItemsController create');


	    Item.create({name: req.body.itemName, description: req.body.itemDescription,
	      _category: req.body.category, donor: req.body.donor, restrictions: req.body.itemRestriction,
	      value: req.body.fairMarketValue, packaged: false},  function(err, result){
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
	        res.json(result);
	      }
	    });
	};


	this.show = function(req,res){
		console.log('ItemsController show');
		// this gets the single item screen (if we want it)
		Item.findById(req.params.id, function(err, result){
			if(err){
	        console.log(err);
	      }
	      else{
	        res.json(result);
	      }
	    });
	}


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
		              res.send(item);
                    }
		        });
		    }
		});
	},  // end of this.update();


	//removing an item
	this.remove_item = function(req, res){
		Item.remove({_id: req.body.item_id}, function(err, result){
			if(err){console.log(err)}
			else{res.json(result)}
		})
	}

}
module.exports = new ItemsController();
