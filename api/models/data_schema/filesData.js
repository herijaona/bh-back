var mongoose = require("mongoose");

var FilesDataSchema = new mongoose.Schema({
    name: String,
    url: String,
    userADD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    mimetype: String,
    creationDate: Date,
    changeDate: Date,
    size: Number
});

mongoose.model("FilesData", FilesDataSchema);