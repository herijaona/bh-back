var mongoose = require("mongoose");
var multer = require("multer");
var DIR = "./uploads/";
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");

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

/*
*
*/

module.exports.saveVideos = async (req, res) => {
	let vidd = req.body;
	let v_ = new Video();
	Object.keys(vidd).forEach(elt => {
		v_[elt] = vidd[elt];
	});

	try {
		let rsp = await v_.save();
		if (rsp) {
			res.status(200).json({ status: "ok", data: rsp });
		}
	} catch (e) {
		res
			.status(500)
			.json({
				status: "NOK",
				message: "erreur lors save videos no hosted"
			});
		console.log(e);
	}
};

/* Helpers Uploads */

function uploadfile(typesFiles, postName) {
	return multer({ dest: DIR + typesFiles }).single(postName);
}

function uploadfile_(typesFiles) {
	return multer({ dest: DIR + typesFiles }).array("biblio[]", 15);
}
