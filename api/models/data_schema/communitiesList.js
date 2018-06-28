var mongoose = require("mongoose");
var listCommSchema = new mongoose.Schema({
    accountOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    byUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    users_in: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    name: String,
    descritpion: String,
    creationDate: Date
});
mongoose.model("CommunitiesData", listCommSchema);