var mongoose = require("mongoose");
var User = mongoose.model("User");
var Account = mongoose.model("Account");

module.exports.validUser = function(req, res, next) {
	if (req.payload) {
		User.findOne({ email: req.payload.email }, function(err, doc) {
			if (!err && doc) {
				if (req.payload._id == doc._id) {
					req.userDATA = doc;
					next();
				} else {
					notFoundRes(res, "User not Found");
				}
			} else {
				notFoundRes(res, "User not Found");
			}
		});
	} else {
		notFoundRes(res, "User not Found");
	}
};

module.exports.checkRole = function(req, res, next) {
	if (req.payload) {
		Account.find({ userAdmin: req.userDATA._id }, function(err, doc) {
			var currAcc;
			if (!err && doc) {
				var l = doc.length,
					li = 1;
				var pr = new Promise((resolve, reject) => {
					doc.forEach( d => {						
						if (req.body.acc_id == d._id) {
							currAcc = d;
						}
						if (l == li) {
							resolve();
						}
						li++;
					});
				});

				pr.then(() => {
					req.ACC = currAcc;
					next();
				});
			} else {
				notFoundRes(res, "Action not Permitted");
			}
		});
	}
};

/*Helpers*/
function notFoundRes(res, t) {
	return res.status(401).json({ text: t });
}
