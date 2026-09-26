const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const Quiz = require("./models/Quiz");
const Result = require("./models/Result");

const app = express();

const PORT = 3000;
const MONGO_URI = "mongodb://127.0.0.1:27017/quizarena";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


// Get all quizzes
app.get("/api/quizzes", async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ createdAt: -1 });

        res.json(
            quizzes.map(q => ({
                id: q._id,
                title: q.title,
                category: q.category,
                description: q.description,
                duration: q.duration,
                questionCount: q.questions.length
            }))
        );

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get one quiz
app.get("/api/quizzes/:id", async (req, res) => {

    try {

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        res.json({
            id: quiz._id,
            title: quiz.title,
            category: quiz.category,
            duration: quiz.duration,

            questions: quiz.questions.map((q, index) => ({
                id: index,
                question: q.question,
                options: q.options
            }))
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// Create quiz
app.post("/api/quizzes", async (req, res) => {

    try {

        const quiz = await Quiz.create(req.body);

        res.status(201).json({
            message: "Quiz created successfully",
            id: quiz._id
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

});


// Submit quiz
app.post("/api/results", async (req, res) => {

    try {

        const {
            quizId,
            playerName,
            answers
        } = req.body;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        let score = 0;

        quiz.questions.forEach((question, index) => {

            if (Number(answers[index]) === question.answer) {
                score++;
            }

        });

        const percentage = Math.round(
            (score / quiz.questions.length) * 100
        );

        const result = await Result.create({

            quizId,
            playerName,
            score,
            total: quiz.questions.length,
            percentage

        });

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// Leaderboard
app.get("/api/results/leaderboard/:quizId", async (req, res) => {

    try {

        const results = await Result.find({
            quizId: req.params.quizId
        })
            .sort({
                score: -1,
                createdAt: 1
            })
            .limit(20);

        res.json(

            results.map((result, index) => ({

                rank: index + 1,
                playerName: result.playerName,
                score: result.score,
                total: result.total,
                percentage: result.percentage

            }))

        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// Open website
app.get("*", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


// MongoDB connection
mongoose
    .connect(MONGO_URI)
    .then(() => {

        console.log("MongoDB Connected");

        app.listen(PORT, () => {

            console.log(
                `QuizArena running at http://localhost:${PORT}`
            );

        });

    })
    .catch(error => {

        console.log(
            "MongoDB connection failed:",
            error.message
        );

    });