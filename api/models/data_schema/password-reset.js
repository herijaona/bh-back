var mongoose = require("mongoose");
var crypto = require("crypto");

var passResetSchema = new mongoose.Schema({
	iduser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	resetCode: {
		type: String,
		required: true
	},
	timeAdd: {
		type: Date,
		required: true
	},
	status: Boolean
});

passResetSchema.methods.setResetCode = function(email) {
	var _salt = crypto.randomBytes(24).toString("hex");
	// this.resetCode = crypto.pbkdf2Sync( email, _salt, 1000, 64, "sha512").toString("hex");
	this.resetCode = crypto.pbkdf2Sync(email, _salt, 1000, 64, 'sha512').toString('hex');
	this.timeAdd = Date.now();
	this.status = true;
};

passResetSchema.methods.setStatus = function(state) {
	this.status = state;
};

passResetSchema.methods.checkValidate = function(state) {
	var e = new Date(this.timeAdd);
	var x = Date.now();
	var b = x-e < 86400000;
	if (!this.status || !b ) {
		return false
	}
	return true;
};

mongoose.model('ResetPassword', passResetSchema);

