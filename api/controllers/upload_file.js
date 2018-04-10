var mongoose = require("mongoose");
var multer = require("multer");
var DIR = "./uploads/";
var Image = mongoose.model("Image");
// const IncomingForm = require('formidable').IncomingForm;

/*Uploading Image*/
module.exports.uploadImage = function(req, res) {
	var upload = uploadfile("images/", "im_up");
	upload(req, res, function(err) {
		var path = "";
		if (err) {
			// An error occurred when uploading
			console.log("Error:------------------------");
			console.log(err);
			console.log("Error:------------------------");
			return res.status(422).send("an Error occured");
		}

		var image = new Image();
		image.name = "imageLogo";
		image.url = req.file.path;
		console.log("Path: " + path);
		image.save(function(err, im) {
			res.status(200);
			return res.json({
				status: "OK",
				imID: im.id
			});
		});
	});
};

/* Helpers Uploads */

function uploadfile(typesFiles, postName) {
	return multer({ dest: DIR + typesFiles }).single(postName);
}
