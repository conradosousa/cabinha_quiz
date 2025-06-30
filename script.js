const quizData = [
    {
        question: "Quem criou o Cabinha?",
        options: ["Seus avós", "Seus pais", "Ele mesmo"],
        answer: "Seus pais"
    },
    {
        question: "Qual é a missão do Cabinha?",
        options: ["Vingar sua família", "Ficar rico", "Combater o preconceito"],
        answer: "Combater o preconceito"
    },
    {
        question: "Qual poder representa empatia?",
        options: ["Rede de descanso", "Cantil de água", "Chapéu de couro"],
        answer: "Cantil de água"
    },
    {
        question: "Qual destes Cabinha combate?",
        options: ["Respeito", "Racismo", "Alegria"],
        answer: "Racismo"
    },
    {
        question: "O que a rede simboliza para o Cabinha?",
        options: ["Ataque", "Sono profundo", "Equilíbrio e paz"],
        answer: "Equilíbrio e paz"
    }
];

let currentQuestion = 0;
let score = 0;

const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("next-btn");
const resultEl = document.getElementById("result");
const playBtn = document.getElementById("play-btn");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadQuestion() {
    const q = quizData[currentQuestion];
    const shuffledOptions = shuffleArray([...q.options]); // copia e embaralha
    quizEl.innerHTML = `<h3>${q.question}</h3>` +
        shuffledOptions.map(opt =>
            `<button onclick="checkAnswer('${opt}')">${opt}</button>`
        ).join("<br>");
}

function checkAnswer(selected) {
    const correct = quizData[currentQuestion].answer;
    const buttons = document.querySelectorAll("#quiz button");
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add("correct");
        }
        if (btn.textContent === selected && selected !== correct) {
            btn.classList.add("incorrect");
        }
    });

    if (selected === correct) {
        score++;
    }
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }, 1000); // espera 1 segundo para mostrar o resultado visual
}

function showResult() {
    quizEl.innerHTML = "";
    nextBtn.style.display = "none";
    resultEl.innerHTML = `Você acertou ${score} de ${quizData.length}`;
    if (score >= 4) {
        playBtn.style.display = "inline-block";
    } else {
        playBtn.style.display = "none";
        resultEl.innerHTML += "<br><span style='color:red;'>Você precisa acertar pelo menos 4 para acessar o jogo!</span>";
    }
}

loadQuestion();
