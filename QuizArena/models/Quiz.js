const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true
    },

    options: {
        type: [String],
        required: true
    },

    answer: {
        type: Number,
        required: true
    }

});


const quizSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: String,

    duration: {
        type: Number,
        required: true
    },

    questions: [
        questionSchema
    ]

}, {
    timestamps: true
});


module.exports = mongoose.model(
    "Quiz",
    quizSchema
);