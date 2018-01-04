console.log('models/user.js');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


var userSchema = new Schema({
	userName: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	phone: {type: String, required: true},
	email: {type: String, required: true},
	streetAddress: {type: String, required: true},
	city: {type: String, required: true},
	states: {type: String, required: true},
	zip: {type: String, required: true},
	password: {type: String, required: true},
	// leave mailing address out as this would be entered through the payment API?  Foundation wants users to enter info only once
	_packages: [{type: Number, ref: 'Package'}],
	admin: {type: Boolean}
})



module.exports = 	mongoose.model('User', userSchema);
