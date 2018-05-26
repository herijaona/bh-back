var mongoose = require("mongoose");
var Question = mongoose.model("Question");
var Account = mongoose.model("Account");
var tools_service = require("../services/app-general");
var TeamCommunity = mongoose.model("TeamCommunity");
/* Response sender*/
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};
/* Post Questions*/
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
            this.addToComminity(d_["account"], d_["userAsk"], "question");
            return sendJSONresponse(res, 200, {
                status: "OK",
                message: " Saved",
                data: d_
            });
        }
    } catch (e) {
        // statements
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK"
        });
    }
};
/* Add inCommunity */
module.exports.addToComminity = async (aCCID, uA, inst) => {
    try {
        let tComm = await TeamCommunity.findOne({
            account: aCCID,
            "users.us": uA
        });

        if (tComm) {
            let sf = tComm.users.filter(
                el => el.us.toString() == uA.toString()
            );
            if (!tools_service.inArray(inst, sf[0].act)) {
                let tCommUpdate = await TeamCommunity.findOneAndUpdate(
                    {
                        account: aCCID,
                        users: { $elemMatch: { us: uA } }
                    },
                    {
                        $push: {
                            "users.$.act": inst
                        }
                    },
                    {
                        new: true
                    }
                );
                if (tCommUpdate) {
                    return;
                }
                return;
            }
            return;
        }
        tComm = await TeamCommunity.findOne({
            account: aCCID
        });
        if (tComm) {
            let tCommUpdate = await TeamCommunity.findOneAndUpdate(
                {
                    account: aCCID
                },
                {
                    $push: {
                        users: {
                            us: uA,
                            act: inst
                        }
                    }
                },
                {
                    new: true
                }
            );
            if (tCommUpdate) {
                return;
            }
        } else {
            let tc = new TeamCommunity({
                account: aCCID,
                users: [
                    {
                        us: uA,
                        act: "question"
                    }
                ]
            });
            let s = await tc.save();
            if (s) {
                console.log("added");
                return;
            }
        }
        return;
    } catch (e) {
        // statements
        console.log(e);
    }
};

module.exports.getallquestionsCompany = async (req, res) => {
    let accID = req.ACC._id;

    try {
        let allQuest = await Question.find({ account: accID }).populate([
            { path: "userAsk" }
        ]);
        if (allQuest) {
            let resp = [];
            for (qq of allQuest) {
                let da = new Date(qq.addDate);
                let about = "";
                if (qq.objectRef == "TMV") {
                    about = "Team";
                } else if (qq.objectRef == "PRT") {
                    about = "Project";
                } else about = "Others";
                let usr = {
                    name: qq.userAsk.lastname + " " + qq.userAsk.firstname,
                    email: qq.userAsk.email
                };
                let ensc = "";
                let enseigneCommercialeOrg = await Account.findOne(
                    { users: qq.userAsk._id },
                    "enseigneCommerciale"
                );
                if (enseigneCommercialeOrg) {
                    ensc = enseigneCommercialeOrg["enseigneCommerciale"];
                }
                console.log(enseigneCommercialeOrg);
                let mat = {
                    hour: da.toTimeString().split(" ")[0],
                    date: da.toDateString(),
                    about: about,
                    userAsk: usr,
                    org: ensc
                };

                resp.push(mat);
            }
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: resp
            });
        }
    } catch (e) {
        // statements
        console.log(e);
    }
};
