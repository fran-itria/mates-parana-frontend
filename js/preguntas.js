const buttons = document.querySelectorAll(".faq-question");
const chatScreen = document.getElementById("chatScreen");

/*===================================*/

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const answerId = button.dataset.answer;
    const answerContent = document.getElementById(answerId);

    // limpiar pantalla
    chatScreen.innerHTML = "";

    // globo de la pregunta
    const questionBubble = document.createElement("div");
    questionBubble.className = "chat-bubble";
    questionBubble.textContent = button.textContent;

    chatScreen.appendChild(questionBubble);

    chatScreen.scrollTop = chatScreen.scrollHeight;

    // esperar 1 segundo antes de mostrar la respuesta
    setTimeout(() => {
      answerContent.querySelectorAll("p").forEach((p) => {
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";
        bubble.innerHTML = p.innerHTML;
        chatScreen.appendChild(bubble);

        chatScreen.scrollTop = chatScreen.scrollHeight;
      });
    }, 1000);
  });
});
