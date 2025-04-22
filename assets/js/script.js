console.log("JS works!");
function drawMarkUp(word, groupedDefinitions) {
  const wrapper = document.createElement("div");
  wrapper.className = "bg-white shadow-md p-4 rounded-lg mb-4";

  const title = document.createElement("h3");
  title.textContent = word;
  title.className = "text-2xl font-bold text-blue-700 mb-4";

  for (const part in groupedDefinitions) {
    const section = document.createElement("div");
    section.className = "mb-3";

    const partTitle = document.createElement("h4");
    partTitle.textContent = `${getEmojiForPart(part)} (${part})`;
    partTitle.className = "text-lg font-semibold text-indigo-600 mb-2";
    section.appendChild(partTitle);

    const ul = document.createElement("ul");
    ul.className = "list-disc list-inside text-gray-800";

    groupedDefinitions[part].forEach((def) => {
      const li = document.createElement("li");
      li.textContent = def;
      ul.appendChild(li);
    });

    section.appendChild(ul);
    wrapper.appendChild(section);
  }

  return wrapper;
}

const API_SOURCE_BASE_URL = `https://api.dictionaryapi.dev/api/v2`;

function handleResponse(data) {
  if (!Array.isArray(data) || !data.length) {
    showFeedback("The word was not found. 😢", "error");
    return;
  }

  const wordList = document.getElementById("wordList");
  wordList.innerHTML = ""; // Clear old results

  const word = data[0].word;
  const meanings = data[0].meanings;

  // Group definitions by part of speech
  const grouped = {};

  meanings.forEach((meaning) => {
    const part = meaning.partOfSpeech;
    if (!grouped[part]) {
      grouped[part] = [];
    }

    meaning.definitions.forEach((defObj) => {
      grouped[part].push(defObj.definition);
    });
  });

  const card = drawMarkUp(word, grouped);
  wordList.appendChild(card);

  // showFeedback(`Cuvântul "${word}" a fost adăugat cu succes! 🎉`, "success");
}

const doFetchData = (searchItem = "hello", language = "en") => {
  if (!searchItem) {
    showError();
  } else {
    const API_SOURCE_ENDPOINT = `${API_SOURCE_BASE_URL}/entries/${language}/${searchItem}`;

    fetch(API_SOURCE_ENDPOINT)
      .then((response) => response.json())
      .then((responseJSON) => handleResponse(responseJSON))
      .catch((error) => showError("Server error", error));
  }
};

document.getElementById("addWordBtn").addEventListener("click", () => {
  const input = document.getElementById("wordInput").value.trim();
  if (!input) {
    showFeedback("Please enter a word!", "error");
    return;
  }

  doFetchData(input.toLowerCase());
});

function getEmojiForPart(part) {
  switch (part) {
    case "noun":
      return "📘";
    case "verb":
      return "⚙️";
    case "adjective":
      return "🌟";
    default:
      return "📝";
  }
}

function showFeedback(message, type = "info") {
  const existing = document.getElementById("feedbackMsg");
  if (existing) existing.remove();

  const msg = document.createElement("div");
  msg.id = "feedbackMsg";
  msg.className = `mb-4 p-3 rounded text-white ${
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-blue-500"
  }`;

  msg.textContent = message;

  const container = document.querySelector("#wordList");
  container.parentNode.insertBefore(msg, container);
  setTimeout(() => {
    msg.remove();
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  drawMyListOfWords();
});

function addToFavoriteWords(word) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteList")) || [];

  if (!favoriteList.includes(word)) {
    favoriteList.push(word);
    localStorage.setItem("favoriteList", JSON.stringify(favoriteList));
    showFeedback("✅ Added to Favorites!");

    drawMyListOfWords();
  } else {
    showFeedback("⚠️ Already in Favorites!");
  }
}

function drawMyListOfWords() {
  const favorites = JSON.parse(localStorage.getItem("favoriteList")) || [];
  let html = "";

  favorites.forEach((word) => {
    html += `<button>✅ ${word}</button>`;
  });

  document.getElementById("favoriteList").innerHTML = html;
}

document.getElementById("addFavoriteBtn").addEventListener("click", () => {
  const word = document.getElementById("wordInput").value.trim();

  if (word !== "") {
    addToFavoriteWords(word);
    document.getElementById("wordInput").value = "";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearBtn");

  function showEmptyMessage() {
    favoriteList.innerHTML = "";
    const emptyMsg = document.createElement("li");
    emptyMsg.textContent = "No favorite words yet...";
    emptyMsg.className = "text-gray-500 italic";
    favoriteList.appendChild(emptyMsg);
  }

  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all words?")) {
      localStorage.removeItem("favoriteList", JSON.stringify([]));
      showFeedback("⚠️ Words deleted!");
      showEmptyMessage();
    }
  });
});
