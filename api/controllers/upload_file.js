var mongoose = require("mongoose");
var multer = require("multer");
var DIR = "./uploads/";
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");

var User = mongoose.model("User");
var Account = mongoose.model("Account");
var Presentation = mongoose.model("Presentation");
var Zone = mongoose.model("Zone");

/*
* Uploading single Image saving them in database
*/
module.exports.uploadImage = function(req, res) {
	var upload = uploadfile("images/", "im_up");
	upload(req, res, function(err) {
		var path = "";
		if (err) {
			return res.status(422).send("an Error occured");
		}

		var image = new Image();
		image.name = "imageLogo";
		image.url = req.file.path;
		image.save(function(err, im) {
			res.status(200);
			return res.json({
				status: "OK",
				imID: im.id
			});
		});
	});
};

/*
* Upload multiple Image or videos and saving them in database
*/
module.exports.multipleFileAdd = function(req, res) {
	var x_type = req.headers["x-type-data"];
	var upload = uploadfile_(x_type + "/");
	upload(req, res, function(e_) {
		if (!e_) {
			var prom = new Promise((resolve, reject) => {
				var fl = req.files;
				var ln = fl.length;

				for (var i = 0; i < ln; i++) {}
				var tabImage = [];
				fl.forEach(function(el, ie_) {
					if (x_type == "images") {
						var im = new Image();
					} else if (x_type == "videos") {
						var im = new Video();
					}
					im.name = "biblio";
					im.url = el.path;
					im.mimetype = el.mimetype;
					im.save((ee, ii) => {
						if (!ee) {
							tabImage.push(ii.id);
							if (ln == ie_ + 1) {
								resolve(tabImage);
							}
						}
					});
				});
			});

			prom.then(de => {
				res.status(200).json({ status: "OK", imUP: de });
			});
		}
	});
};

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
		console.log(reslt);
	});

	res.status(200).json({ s: "calme" });
};

/* IN_Array*/
function inArray(needle, haystack) {
	var length = haystack.length;
	for (var i = 0; i < length; i++) {
		if (haystack[i] == needle) return true;
	}
	return false;
}

/* Helpers Uploads */

function uploadfile(typesFiles, postName) {
	return multer({ dest: DIR + typesFiles }).single(postName);
}

function uploadfile_(typesFiles) {
	return multer({ dest: DIR + typesFiles }).array("biblio[]", 15);
}
