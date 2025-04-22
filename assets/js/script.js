const API_SOURCE_BASE_URL = `https://api.dictionaryapi.dev/api/v2`;

function drawMarkUp(word, groupedDefinitions) {
  const wrapper = document.createElement("div");
  wrapper.className =
    "bg-white shadow-md p-4 rounded-lg mb-4 relative word-card";
  wrapper.setAttribute("data-word", word);

  const favorites = JSON.parse(localStorage.getItem("favoriteList")) || [];

  const favoriteBtn = document.createElement("button");
  updateFavoriteButtonState(word, favoriteBtn);
  favoriteBtn.className =
    "absolute top-2 right-2 text-xl hover:scale-110 transition-transform";

  favoriteBtn.addEventListener("click", () => {
    let currentFavorites =
      JSON.parse(localStorage.getItem("favoriteList")) || [];

    if (!currentFavorites.includes(word)) {
      currentFavorites.push(word);
      localStorage.setItem("favoriteList", JSON.stringify(currentFavorites));
      showFeedback("✅ Added to Favorites!", "success");
    } else {
      currentFavorites = currentFavorites.filter((w) => w !== word);
      localStorage.setItem("favoriteList", JSON.stringify(currentFavorites));
      showFeedback("❌ Removed from Favorites!", "error");
    }

    const updatedFavorites =
      JSON.parse(localStorage.getItem("favoriteList")) || [];
    updateFavoriteButtonState(word, favoriteBtn);

    drawMyListOfWords();
  });

  wrapper.appendChild(favoriteBtn);

  const title = document.createElement("h3");
  title.textContent = word;
  title.className = "text-2xl font-bold text-blue-700 mb-4";
  wrapper.appendChild(title);

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

function handleResponse(data) {
  if (!Array.isArray(data) || !data.length) {
    showFeedback("The word was not found. 😢", "error");
    return;
  }

  const wordList = document.getElementById("wordList");
  wordList.innerHTML = "";

  const word = data[0].word;
  const meanings = data[0].meanings;

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
    showFeedback("Please enter a word!", "warning");
    return;
  }

  doFetchData(input.toLowerCase());
  document.getElementById("wordInput").value = "";
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
  msg.className = `fixed top-6 right-4 p-3 rounded text-white 
    ${
      type === "error"
        ? "bg-red-500"
        : type === "success"
        ? "bg-green-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500"
    } 
    shadow-lg transition-transform transform scale-100`;

  msg.textContent = message;

  const container = document.body;
  container.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  drawMyListOfWords();
});

function addToFavoriteWords(word) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteList")) || [];

  favoriteList.push(word);
  localStorage.setItem("favoriteList", JSON.stringify(favoriteList));
  showFeedback("✅ Added to Favorites!", "success");

  drawMyListOfWords();
}

function updateFavoriteButtonState(word, favoriteBtn) {
  const favorites = JSON.parse(localStorage.getItem("favoriteList")) || [];
  const isFavorite = favorites.includes(word);

  favoriteBtn.textContent = isFavorite ? "📖" : "📘";
  favoriteBtn.title = isFavorite ? "In Favorites" : "Add to Favorites";
}

function drawMyListOfWords() {
  const favoriteListEl = document.getElementById("favoriteListContainer");
  const favorites = JSON.parse(localStorage.getItem("favoriteList")) || [];

  if (favorites.length === 0) {
    favoriteListEl.innerHTML = `
      <div class="text-gray-500 italic text-center">
        No favorite words yet...
      </div>`;
    return;
  }

  favoriteListEl.innerHTML = "";

  favorites.forEach((word) => {
    const card = document.createElement("div");
    card.className =
      "bg-white shadow-md rounded-lg p-3 flex justify-between items-center space-x-3 transition-transform hover:scale-105 hover:shadow-lg cursor-pointer w-55 max-w-xs h-20";

    const icon = document.createElement("span");
    icon.textContent = "📚";
    icon.className = "text-xl";

    const wordText = document.createElement("span");
    wordText.textContent = word;
    wordText.className = "text-sm font-semibold text-blue-700 flex-1 truncate";

    const btnRemove = document.createElement("button");
    btnRemove.className = "text-gray-500 hover:text-red-600 transition";
    btnRemove.innerHTML = "🗑️";
    btnRemove.title = "Remove from Favorites";

    btnRemove.addEventListener("click", (event) => {
      event.stopPropagation();

      const updatedFavorites = favorites.filter((item) => item !== word);
      localStorage.setItem("favoriteList", JSON.stringify(updatedFavorites));
      showFeedback("❌ Removed from Favorites!", "error");

      drawMyListOfWords();

      const mainCard = document.querySelector(
        `.word-card[data-word="${word}"]`
      );
      if (mainCard) {
        const mainCardBtn = mainCard.querySelector("button");
        updateFavoriteButtonState(word, mainCardBtn);
      }
    });

    card.addEventListener("click", () => {
      doFetchData(word);
      document.getElementById("wordInput").value = "";
    });

    card.appendChild(icon);
    card.appendChild(wordText);
    card.appendChild(btnRemove);

    favoriteListEl.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearBtn");
  const confirmModal = document.getElementById("confirmModal");
  const confirmYesBtn = document.getElementById("confirmYesBtn");
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");

  clearBtn.addEventListener("click", () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteList")) || [];

    if (favorites.length === 0) {
      showFeedback(
        "Please add at least one word to favorites before deleting.",
        "warning"
      );
    } else {
      confirmModal.classList.remove("hidden");
    }
  });

  confirmCancelBtn.addEventListener("click", () => {
    confirmModal.classList.add("hidden");
  });

  confirmYesBtn.addEventListener("click", () => {
    localStorage.removeItem("favoriteList");
    showFeedback("⚠️ All words deleted from favorites!", "warning");

    drawMyListOfWords();

    const allCards = document.querySelectorAll(".word-card");
    allCards.forEach((card) => {
      const word = card.getAttribute("data-word");
      const favoriteBtn = card.querySelector("button");
      updateFavoriteButtonState(word, favoriteBtn);
    });

    confirmModal.classList.add("hidden");
  });
});
