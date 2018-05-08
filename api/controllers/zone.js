/*
* add new zone 
*/
module.exports.saveZoneDATA = function(req, res) {
	var dt = req.body;
	var zn = new Zone();
	if (dt.media_type == 1) {
		zn.image = dt.media_id;
	} else if (dt.media_type == 2) {
		zn.video = dt.media_id;
	}
	zn.dtype = dt.media_type;
	delete dt.media_id;
	delete dt.media_type;

	zn.canDeleted = true;

	Object.keys(dt).forEach(elt => {
		zn[elt] = dt[elt];
	});
	zn.account = new mongoose.mongo.ObjectId(req.ACC._id);
	zn.save((e, zi) => {
		if (!e) {
			res.status(200).json({ status: "OK", message: "reussi" });
		}
	});
};
