var mongoose = require("mongoose");
var subjectCommSchema = new mongoose.Schema({
    communitiesID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommunitiesData"
    },
    byUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: String,
    responseAll: [{
        byUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        responseDate: Date,
        responseContent: String,
        dataSuppl: {}
    }]
});
mongoose.model("CommunitySubject", subjectCommSchema);