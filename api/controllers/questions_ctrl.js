var mongoose = require("mongoose");
var Question = mongoose.model("Question");
var Account = mongoose.model("Account");

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.postQuestions = async (req, res) => {
	let dAbout = req.body.dataAbout;
	let dq = {
		objectRef: req.body.objectRef,
		userAsk: req.userDATA._id,
		addDate: Date.now(),
		question_content: req.body.question_content,
		objectRefID: req.body.objectRefID
	};

	if ("account" in dAbout) {
		dq["account"] = dAbout.account;
	}

	let qst = new Question(dq);
	try {
		let d_ = await qst.save();
		if (d_) {
			addToComminity(d_['account']);
			return sendJSONresponse(res, 200, {
				status: "OK",
				message: " Saved",
				data: d_
			});
		}
	} catch (e) {
		// statements
		console.log(e);
		return sendJSONresponse(res, 500, { status: "NOK" });
	}
};

var addToComminity = async  (_i)=>{
	try {
		let e = await Account.findById(_i);
		if (e) {
			console.info(e)
		}
	} catch(e) {
		// statements
		console.log(e);
	}
}