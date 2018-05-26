var mongoose = require("mongoose");
var Question = mongoose.model("Question");
var Account = mongoose.model("Account");
var tools_service = require("../services/app-general");
var TeamCommunity = mongoose.model("TeamCommunity");
var TeamFront = mongoose.model("TeamFront");

var Project = mongoose.model("Project");
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
                    _id: qq._id,
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

module.exports.getDetailOnQuestion = async (req, res) => {
    let qID = req.query.qID;
    try {
        let qdata = await Question.findById(qID).populate([
            { path: "userAsk", populate: { path: "imageProfile" } }
        ]);
        if (qdata) {
            let d = new Date(qdata.addDate);
            let ensc = "";
            let enseigneCommercialeOrg = await Account.findOne(
                { users: qdata.userAsk._id },
                "enseigneCommerciale"
            );
            if (enseigneCommercialeOrg) {
                ensc = enseigneCommercialeOrg["enseigneCommerciale"];
            }
            let _types = "";
            let dataObj = {};
            switch (qdata.objectRef) {
                case "PRT":
                    let prj = await Project.findById(qdata.objectRefID).populate([{ path: "account" }]);
                    if (prj) {
                        _types = "project";
                        dataObj = {
                            name: prj.name,
                            _id: prj._id,
                            _accSlug: prj.account._slug

                        };
                    }
                    break;
                case "TMV":
                    let tmv = await TeamFront.findById(
                        qdata.objectRefID
                    ).populate([{ path: "team_users" }]);
                    _types = "team";
                    dataObj = {
                        _id: tmv._id,
                        userOnMail: tmv.team_users.email,
                        userOnName:
                            tmv.team_users.lastname +
                            " " +
                            tmv.team_users.firstname
                    };

                    break;
            }

            let retDetails = {
                _id: qdata._id,
                hour: d.toTimeString().split(" ")[0],
                date: d.toDateString(),
                question_content: qdata.question_content,
                usr: {
                    _id: qdata.userAsk._id,
                    name:
                        qdata.userAsk.lastname + " " + qdata.userAsk.firstname,
                    email: qdata.userAsk.email,
                    org: ensc,
                    function: qdata.userAsk.function,
                    imageProfile: tools_service.media_url(
                        qdata.userAsk.imageProfile.url
                    )
                },
                qObject: {
                    types: _types,
                    dataObj: dataObj
                }
            };

            return sendJSONresponse(res, 200, { status: "OK", data: retDetails });
        }
    } catch (e) {
        // statements
        console.log(e);
    }
};
