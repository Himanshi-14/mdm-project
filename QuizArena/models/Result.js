const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"
    },

    playerName: {
        type: String,
        required: true
    },

    score: Number,

    total: Number,

    percentage: Number

}, {
    timestamps: true
});


module.exports = mongoose.model(
    "Result",
    resultSchema
);