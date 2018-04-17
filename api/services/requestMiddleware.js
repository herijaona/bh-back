var mongoose = require("mongoose");
var User = mongoose.model("User");

module.exports.validUser = function(req, res, next) {
	// body...
	if (req.payload) {
		User.findOne({ email: req.payload.email }, function(err, doc) {
			if (!err) {
				if (req.payload._id == doc._id) {
					next();
				} else {
					notFoundRes();
				}
			} else {
				notFoundRes();
			}
		});
	} else {
		notFoundRes();
	}
};

function notFoundRes() {
	return res.status(401).json({ user: "not found" });
}
