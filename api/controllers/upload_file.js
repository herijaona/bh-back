var mongoose = require("mongoose");
var multer = require("multer");
var DIR = "./uploads/";
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");
// const IncomingForm = require('formidable').IncomingForm;

/*Uploading Image*/
module.exports.uploadImage = function(req, res) {
	var upload = uploadfile("images/", "im_up");
	upload(req, res, function(err) {
		var path = "";
		if (err) {
			// An error occurred when uploading
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

module.exports.multipleFileAdd = function(req, res) {
	var x_type = req.headers["x-type-data"];
	var upload = uploadfile_(x_type + "/");
	upload(req, res, function(e_) {
		if (!e_) {
			var prom = new Promise((resolve, reject) => {
				var fl = req.files;
				var ln = fl.length;

				console.log(fl);
				for (var i = 0; i < ln; i++) {}
				var tabImage = [];
				fl.forEach(function(el, ie_) {
					console.log(ie_);
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

					console.log(el);
				});
			});

			prom.then(de => {
				res.status(200).json({ status: "OK", imUP: de });
			});
		}
	});
};

/* Helpers Uploads */

function uploadfile(typesFiles, postName) {
	return multer({ dest: DIR + typesFiles }).single(postName);
}

function uploadfile_(typesFiles) {
	return multer({ dest: DIR + typesFiles }).array("biblio[]", 15);
}
