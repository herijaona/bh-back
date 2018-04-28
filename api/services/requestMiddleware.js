var mongoose = require("mongoose");
var User = mongoose.model("User");
var Account = mongoose.model("Account");


/*
* Verify if the user in the token is a valid user 
*/
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

/*
* Check if the current user is really the admin of the Account sent in headers
* Add the account object in the req as ACC
*/
module.exports.checkRole = function(req, res, next) {
	var id_comp = req.headers["x-ccompany-id"];
	if (req.payload) {
		Account.find({ userAdmin: req.userDATA._id }, function(err, doc) {
			var currAcc;
			if (!err && doc) {
				var l = doc.length,
					li = 1;
				var pr = new Promise((resolve, reject) => {
					doc.forEach(d => {
						if (id_comp == d._id) {
							currAcc = d;
						}
						if (l == li) {
							resolve();
						}
						li++;
					});
				});

				pr.then(() => {
					if (!currAcc) {
						notFoundRes(res, "action not Permitted 1");
					}
					req.ACC = currAcc;
					next();
				});
			} else {
				notFoundRes(res, "Action not Permitted 2");
			}
		});
	}
};

/*
* Helpers
*/
function notFoundRes(res, t) {
	return res.status(401).json({ text: t });
}
