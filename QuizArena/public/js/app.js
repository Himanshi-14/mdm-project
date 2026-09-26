let quizzes = [];

let quiz = null;

let questionIndex = 0;

let answers = [];

let time = 0;

let timer;

let playerName = "";


const $ = id =>
    document.getElementById(id);



function showView(id) {

    document
        .querySelectorAll(".view")
        .forEach(section => {

            section.classList.add("hidden");

        });

    $(id).classList.remove("hidden");

    window.scrollTo(0, 0);

}



function home() {

    showView("home");

    loadQuizzes();

}



function competitions() {

    showView("competitions");

    loadQuizzes();

}



function about() {

    showView("about");

}



function admin() {

    showView("admin");

    if (!$("builder").children.length) {

        addQuestion();

    }

}



function toggleMenu() {

    $("nav")
        .classList
        .toggle("open");

}



async function loadQuizzes() {

    try {

        quizzes =
            await (
                await fetch("/api/quizzes")
            ).json();


        $("count").textContent =
            quizzes.length;


        const html =
            quizzes
                .map(createCard)
                .join("");


        $("homeGrid").innerHTML =
            html;


        $("grid").innerHTML =
            html;


    } catch (error) {

        console.log(error);

    }

}



function createCard(q) {

    return `

        <article class="quiz-card">

            <small>
                ${escapeHTML(q.category)}
            </small>

            <h3>
                ${escapeHTML(q.title)}
            </h3>

            <p>
                ${escapeHTML(
        q.description ||
        "Join this quiz competition."
    )}
            </p>

            <span>
                ⏱ ${q.duration} min
                &nbsp; • &nbsp;
                ❓ ${q.questionCount} questions
            </span>

            <br>

            <button
                class="primary"
                onclick="openQuiz('${q.id}')"
            >
                Join Competition →
            </button>

        </article>

    `;

}



async function openQuiz(id) {

    quiz =
        await (
            await fetch(
                "/api/quizzes/" + id
            )
        ).json();


    $("modal")
        .classList
        .remove("hidden");


    $("name").focus();

}



function closeModal() {

    $("modal")
        .classList
        .add("hidden");

}



function start() {

    playerName =
        $("name")
            .value
            .trim();


    if (!playerName) {

        alert("Please enter your name.");

        return;

    }


    closeModal();


    questionIndex = 0;


    answers =
        new Array(
            quiz.questions.length
        ).fill(null);


    time =
        quiz.duration * 60;


    showView("quiz");


    renderQuestion();


    clearInterval(timer);


    startTimer();

}



function startTimer() {

    updateTimer();


    timer =
        setInterval(() => {

            time--;

            updateTimer();


            if (time <= 0) {

                clearInterval(timer);

                submitQuiz();

            }

        }, 1000);

}



function updateTimer() {

    const minutes =
        Math.floor(time / 60)
            .toString()
            .padStart(2, "0");


    const seconds =
        (time % 60)
            .toString()
            .padStart(2, "0");


    $("timer").textContent =
        minutes + ":" + seconds;

}



function renderQuestion() {

    const q =
        quiz.questions[
        questionIndex
        ];


    $("cat").textContent =
        quiz.category;


    $("title").textContent =
        quiz.title;


    $("qno").textContent =
        `QUESTION ${questionIndex + 1
        } / ${quiz.questions.length
        }`;


    $("progress").textContent =
        `${questionIndex + 1} of ${quiz.questions.length
        }`;


    $("question").textContent =
        q.question;


    $("bar").style.width =
        (
            (questionIndex + 1) /
            quiz.questions.length *
            100
        ) + "%";


    $("options").innerHTML =
        q.options
            .map((option, index) => `

                <button
                    class="option
                    ${answers[questionIndex] === index
                    ? "selected"
                    : ""
                }"

                    onclick="chooseAnswer(${index})"
                >

                    ${String.fromCharCode(
                    65 + index
                )}.

                    ${escapeHTML(option)}

                </button>

            `)
            .join("");


    $("next").textContent =
        questionIndex ===
            quiz.questions.length - 1

            ? "Submit"

            : "Next →";

}



function chooseAnswer(index) {

    answers[
        questionIndex
    ] = index;


    renderQuestion();

}



function next() {

    if (
        answers[questionIndex] ===
        null
    ) {

        alert(
            "Please select an answer."
        );

        return;

    }


    if (
        questionIndex <
        quiz.questions.length - 1
    ) {

        questionIndex++;

        renderQuestion();

    } else {

        submitQuiz();

    }

}



function prev() {

    if (questionIndex > 0) {

        questionIndex--;

        renderQuestion();

    }

}



async function submitQuiz() {

    clearInterval(timer);


    const response =
        await fetch(
            "/api/results",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        quizId: quiz.id,

                        playerName,

                        answers

                    })

            }
        );


    const result =
        await response.json();


    $("resultTitle").textContent =
        `Well done, ${playerName}!`;


    $("score").textContent =
        `${result.score}/${result.total}`;


    $("percent").textContent =
        result.percentage + "%";


    if (result.percentage >= 80) {

        $("message").textContent =
            "Excellent performance!";

    }

    else if (
        result.percentage >= 50
    ) {

        $("message").textContent =
            "Good effort! Keep practicing.";

    }

    else {

        $("message").textContent =
            "Keep practicing and try again!";

    }


    showView("result");

}



async function leaderboard() {

    showView("leaderboard");


    await loadQuizzes();


    $("leaderQuiz").innerHTML =
        quizzes
            .map(q => `

                <option value="${q.id}">
                    ${escapeHTML(q.title)}
                </option>

            `)
            .join("");


    loadLeaderboard();

}



async function loadLeaderboard() {

    const id =
        $("leaderQuiz").value;


    if (!id) return;


    const data =
        await (
            await fetch(
                "/api/results/leaderboard/" +
                id
            )
        ).json();


    $("body").innerHTML =
        data
            .map(result => `

                <tr>

                    <td>
                        #${result.rank}
                    </td>

                    <td>
                        ${escapeHTML(
                result.playerName
            )}
                    </td>

                    <td>
                        ${result.score}/${result.total}
                    </td>

                    <td>
                        ${result.percentage}%
                    </td>

                </tr>

            `)
            .join("");


    $("empty").textContent =
        data.length
            ? ""
            : "No results yet.";

}



let questionCount = 0;


function addQuestion() {

    questionCount++;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "builder";


    div.innerHTML = `

        <h3>
            Question ${questionCount}
        </h3>


        <label>

            Question

            <input
                class="bq"
                required
            >

        </label>


        <div class="options4">

            <input
                class="bo"
                required
                placeholder="Option A"
            >

            <input
                class="bo"
                required
                placeholder="Option B"
            >

            <input
                class="bo"
                required
                placeholder="Option C"
            >

            <input
                class="bo"
                required
                placeholder="Option D"
            >

        </div>


        <label>

            Correct option

            <select class="ba">

                <option value="0">
                    A
                </option>

                <option value="1">
                    B
                </option>

                <option value="2">
                    C
                </option>

                <option value="3">
                    D
                </option>

            </select>

        </label>

    `;


    $("builder")
        .appendChild(div);

}



$("form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const questions =
                [
                    ...document
                        .querySelectorAll(
                            ".builder"
                        )
                ]
                    .map(div => ({

                        question:
                            div
                                .querySelector(
                                    ".bq"
                                )
                                .value,

                        options:
                            [
                                ...div
                                    .querySelectorAll(
                                        ".bo"
                                    )
                            ]
                                .map(
                                    input =>
                                        input.value
                                ),

                        answer:
                            Number(
                                div
                                    .querySelector(
                                        ".ba"
                                    )
                                    .value
                            )

                    }));


            const quizData = {

                title:
                    $("nt").value,

                category:
                    $("nc").value,

                duration:
                    Number(
                        $("nd").value
                    ),

                description:
                    $("ndesc").value,

                questions

            };


            const response =
                await fetch(
                    "/api/quizzes",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                quizData
                            )
                    }
                );


            if (response.ok) {

                alert(
                    "Competition published successfully!"
                );


                event.target.reset();


                $("builder")
                    .innerHTML = "";


                questionCount = 0;


                competitions();

            } else {

                alert(
                    "Error creating quiz."
                );

            }

        }
    );



function escapeHTML(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character])
        );

}



home();