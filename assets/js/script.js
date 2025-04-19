console.log("JS works!");
function drawMarkUp(word, definition = "") {
    const wrapper = document.createElement("div");
    wrapper.className = "bg-white shadow-md p-4 rounded-lg mb-4";
  
    const title = document.createElement("h3");
    title.textContent = word;
    title.className = "text-xl font-bold text-blue-700";
  
    const def = document.createElement("p");
    def.textContent = definition;
    def.className = "text-gray-700 mt-2";
  
    const delBtn = document.createElement("button");
    delBtn.textContent = "Șterge";
    delBtn.className = "mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600";
  
    wrapper.appendChild(title);
    wrapper.appendChild(def);
    wrapper.appendChild(delBtn);
  
    return wrapper;
  }