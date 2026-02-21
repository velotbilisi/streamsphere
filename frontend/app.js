const API_URL = "https://streamsphere-worker.velotbilisi.workers.dev";


function showMessage(elementId, message) {
  document.getElementById(elementId).textContent = message;
}

function clearInput(elementId) {
  document.getElementById(elementId).value = "";
}


async function loadComments() {
  const commentsDiv = document.getElementById("comments");
  commentsDiv.innerHTML = "Loading comments...";

  try {
    const res = await fetch(`${API_URL}/comments`);
    if (!res.ok) throw new Error("Failed to fetch comments");

    const data = await res.json();
    commentsDiv.innerHTML = "";

    if (data.length === 0) {
      commentsDiv.textContent = "No comments yet. Be the first!";
      return;
    }

    data.forEach(comment => {
      const div = document.createElement("div");
      div.textContent = comment.text;
      commentsDiv.appendChild(div);
    });

  } catch (error) {
    commentsDiv.textContent = "⚠️ Error loading comments.";
    console.error(error);
  }
}


async function postComment() {
  const input = document.getElementById("commentInput");
  const text = input.value.trim();

  if (!text) {
    alert("Comment cannot be empty.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error("Failed to post comment");

    clearInput("commentInput");
    loadComments();

  } catch (error) {
    alert("⚠️ Failed to post comment.");
    console.error(error);
  }
}


async function askAI() {
  const input = document.getElementById("aiPrompt");
  const prompt = input.value.trim();
  const responseDiv = document.getElementById("aiResponse");

  if (!prompt) {
    alert("Please enter a question.");
    return;
  }

  responseDiv.textContent = "Thinking... 🤖";

  try {
    const res = await fetch(`${API_URL}/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) throw new Error("AI request failed");

    const data = await res.json();
    responseDiv.textContent = data.response || "No response received.";

    clearInput("aiPrompt");

  } catch (error) {
    responseDiv.textContent = "⚠️ AI service unavailable.";
    console.error(error);
  }
}

document.getElementById("aiPrompt").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    askAI();
  }
});

document.addEventListener("DOMContentLoaded", loadComments);