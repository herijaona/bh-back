var mongoose = require("mongoose");
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");
var User = mongoose.model("User");
var tools_service = require("../services/app-general");
var Account = mongoose.model("Account");
var Presentation = mongoose.model("Presentation");
var Zone = mongoose.model("Zone");
var ResetPassword = mongoose.model("ResetPassword");

/*Specific DATAPATCH*/
module.exports.patchDATA = function(req, res) {
	/* Patch Zone */
	Zone.find().exec((er, el) => {
		/*for (zn in el) {
			var data = el[zn];
			if (data.image) {
				el[zn].dtype = 1;
			} else if (data.video) {
				el[zn].dtype = 2;
			}
			el[zn].save((er1, el1) => {
				console.log(el1)
			});
		}*/
	});

	/* patch all user*/
	Account.find().exec((er, reslt) => {
		/*console.log(reslt);
		for (i in reslt) {
			var elt = reslt[i];
			var newPr = new Presentation();
			newPr.description =
				"Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte";
			newPr.autreDescription = "Information complementaire";
			newPr.account = elt._id;

			newPr.save((ee, eelts) => {
				elt.presentation = eelts._id;
				elt.save((sw, doc) => {
					console.log(doc);
				});
			});
		}*/

		/*var all_slug = [];

		for (i in reslt) {
			var elt = reslt[i];
			var cm_name = elt.enseigneCommerciale.replace(" ", "");
			while (tools_service.inArray(cm_name, all_slug)) {
				cm_name += "_1";
			}

			elt._slug = cm_name;
			all_slug.push(cm_name);
			elt.save((we, erw) => {
				if (!we) {
				}
			});
		}*/

		/*for (i in reslt) {
			var elt = reslt[i];
			if (!elt.pagetoShow) {
				elt.pagetoShow =
					'{"pMindset":false,"pTeam":false,"pSs":false,"pIdeas":false,"pMeeting":false,"pProjects":false}';
				elt.save((we, erw) => {
					if (!we) {
					}
				});
			}
		}*/

		/*for (i in reslt) {
			var elt = reslt[i];
			if (elt.pagetoShow) {
				var rt = JSON.parse(elt.pagetoShow);
				if (!rt.pMeeting) {
					rt.pMeeting = false;
					elt.pagetoShow = JSON.stringify(rt);
					elt.save((we, erw) => {
						if (!we) {
						}
					});
				}
			}
		}*/

		res.status(200).json({ s: reslt });
	});
};

module.exports.DeleteCollections = (req, res) => {
	
	/*User.remove({}, function(err) {
		console.log("collection removed");
	});
	Image.remove({}, function(err) {
		console.log("collection removed");
	});
	Video.remove({}, function(err) {
		console.log("collection removed");
	});
	Account.remove({}, function(err) {
		console.log("collection removed");
	});
	Zone.remove({}, function(err) {
		console.log("collection removed");
	});
	Presentation.remove({}, function(err) {
		console.log("collection removed");
	});
	ResetPassword.remove({}, function(err) {
		console.log("collection removed");
	});*/

	res.status(200).json({ state: 200, messge: "riro" });
};
