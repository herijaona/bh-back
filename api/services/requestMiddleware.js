var mongoose = require("mongoose");
var User = mongoose.model("User");
var Account = mongoose.model("Account");

/*
* Verify if the user in the token is a valid user 
*/
module.exports.validUser = async function(req, res, next) {
	if (req.payload) {
		try {
			let userOne = await User.findOne({ email: req.payload.email });
			if (userOne) {
				if (req.payload._id == userOne._id) {
					req.userDATA = userOne;
					next();
				} else {
					notFoundRes(res, "User not Found");
				}
			} else {
				notFoundRes(res, "User not Found");
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ err: "Erreur serveur" });
		}
	} else {
		res.status(401).json({ err: "UnAuthorized" });
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
* Get the Account company by it's slug and put it in the req.ACC
*
*/
module.exports.accReqSlug = async (req, res, next) => {
	let acc_slug = "";
	if (req.query.company_slug) {
		acc_slug = req.query.company_slug;
	} else if (req.body.company_slug) {
		acc_slug = req.body.company_slug;
	}
	
	if (acc_slug) {
		try {
			let acc_comp = await Account.findOne({ _slug: acc_slug });
			if (acc_comp) {
				req.ACC = acc_comp;
				next();
			} else {
				res
					.status(404)
					.json({ err: true, message: "Account not Found" });
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Serveur Error" });
		}
	}
};

/*
* Helpers
*/
function notFoundRes(res, t) {
	return res.status(401).json({ text: t });
}
