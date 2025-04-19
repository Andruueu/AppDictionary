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
