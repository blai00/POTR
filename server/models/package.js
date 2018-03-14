console.log('models/package.js');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;



var packageSchema = new Schema({
 name: {type: String, required: true, minlength: 4},
 _items: [{type: Number, required: true, ref: 'Item'}],
 description: {type: String},
 //donor: {type: String, default: 'anonymous'}, // can access donor(s) by looping for item in package._items { item.donor }
// <<<<<<< Updated upstream
  _category: String,
// _category: {type: Schema.Types.ObjectId, ref: 'Category'},
// >>>>>>> Stashed changes
 value: Number,  // maybe prepopulate field with for item in package._items { value += item.value }
 amount: Number,
 priority: {type: Number, required: true, default: 0},
 featured: Boolean,

 bid_increment: Number,  // increment is a reserved word, so used bid_increment

 bids: {type: Array},
//Joey & Yarik: our model for object is:
// {bidAmount: 50, name: yarik }

 photo: String // or access item in _items { item.photo }
}, { timestamps: true });



// I want to make a package instance method that takes the bid._id and returns the bid amount
// animalSchema.methods.findSimilarTypes = function(cb) {
//   return this.model('Animal').find({ type: this.type }, cb);
// };
// packageSchema.methods.bidAmount = function(id){
// 	for(var i=0; i<this.model('Package')._bids)
// }
packageSchema.plugin(autoIncrement.plugin, {model: 'Package', startAt: 100});

module.exports = mongoose.model('Package', packageSchema);
