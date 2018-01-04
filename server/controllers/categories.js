
var mongoose = require('mongoose'),

	Category = require('../models/category.js');


 // All callbacks in Mongoose use the pattern: callback(error, result). If an error occurs executing the query,
 // the error parameter will contain an error document, and result will be null.
 // If the query is successful, the error parameter will be null, and the result will be populated with the results of the query.

function CategoriesController(){


	this.index = function(req,res){
		console.log('CategoriesController index');
		Category.find({}, function(err, categories) {
    		// This is the method that finds all of the categories from the database
	    	if(err) {
	      		console.log(err);
	    	}
	    	else {
					  const admin = req.session.admin;
	        	res.json({admin: admin, categories: categories});
	        }
        })  // ends Item.find

	}; // ends this.index





	this.create = function(req,res){
		console.log('CategoriesController create');

	    Category.create({name: req.body.category},  function(err, result){


	      if(err){
	        console.log(err);
	      }
	      else{
	       	Category.find({}, function(err, categories) {
    		// This is the method that finds all of the categories from the database
	    		if(err) {
	      		console.log(err);
	    		}
	    		else {

	        	res.json(categories);
	        }
        })
	      }
	    });
	};




}
module.exports = new CategoriesController();
