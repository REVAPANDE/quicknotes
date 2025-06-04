
const form = document.getElementById("note-form");
const input = document.getElementById("note-input");
const notesContainer = document.getElementById("notes-container");
const toggleBtn = document.getElementById("toggle-mode");

const stickyColors = [
  "#FFFACD", "#FFD3B6", "#A8E6CF", "#FFAAA5",
  "#D5AAFF", "#B2EBF2", "#E2F0CB", "#F0E68C"
];

let notes = JSON.parse(localStorage.getItem("quicknotes")) || [];

// Migrate old notes (add createdAt if missing)
notes = notes.map(note => ({
  ...note,
  createdAt: note.createdAt || new Date().toISOString()
}));

saveNotes();
renderNotes();

// Theme Load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleBtn.textContent = "☀️ Light Mode";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Add Clear All Notes button dynamically below form
const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear All Notes";
clearBtn.style.marginLeft = "10px";
clearBtn.style.background = "#ff4d4d";
clearBtn.style.color = "white";
clearBtn.style.border = "none";
clearBtn.style.padding = "12px 20px";
clearBtn.style.borderRadius = "12px";
clearBtn.style.cursor = "pointer";
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all notes?")) {
    notes = [];
    saveNotes();
    renderNotes();
  }
});
form.appendChild(clearBtn);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const bgColor = getRandomColor();
  const textColor = getContrastColor(bgColor);
  const createdAt = new Date().toISOString(); // Store timestamp

  notes.push({ text, bgColor, textColor, important: false, createdAt });
  input.value = "";
  saveNotes();
  renderNotes();
});

function renderNotes() {
  notesContainer.innerHTML = "";
  notes.forEach((note, index) => {
    const noteEl = document.createElement("div");
    noteEl.className = "note-card";
    if (note.important) noteEl.classList.add("important");
    noteEl.style.backgroundColor = note.bgColor;
    noteEl.style.color = note.textColor;

    let formattedDate = "";
    if (note.createdAt) {
      const date = new Date(note.createdAt);
      if (!isNaN(date)) {
        formattedDate = date.toLocaleString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
    }

    noteEl.innerHTML = `
      <button class="important-btn" onclick="toggleImportant(${index})">
        ${note.important ? "⭐" : "☆"}
      </button>
      <p class="note-text" data-index="${index}">${escapeHtml(note.text)}</p>
      <small class="timestamp">${formattedDate}</small>
      <button class="delete-btn" onclick="deleteNote(${index})">×</button>
    `;

    notesContainer.appendChild(noteEl);

    // Add subtle fade-in animation
    noteEl.style.animation = "fadeInNote 0.5s ease forwards";

    // Make note text editable on click
    const noteTextEl = noteEl.querySelector(".note-text");
    noteTextEl.addEventListener("click", () => {
      makeNoteEditable(noteTextEl, index);
    });
  });
}

function makeNoteEditable(el, index) {
  el.contentEditable = "true";
  el.focus();
  el.style.borderBottom = "1px solid #444";

  function saveEdit() {
    el.contentEditable = "false";
    el.style.borderBottom = "none";
    notes[index].text = el.textContent.trim();
    saveNotes();
    renderNotes();
  }

  el.addEventListener("blur", saveEdit, { once: true });

  // Also save on pressing Enter key (prevent newline)
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      el.blur();
    }
  }, { once: true });
}

function deleteNote(index) {
  notes.splice(index, 1);
  saveNotes();
  renderNotes();
}

function toggleImportant(index) {
  notes[index].important = !notes[index].important;
  saveNotes();
  renderNotes();
}

function saveNotes() {
  localStorage.setItem("quicknotes", JSON.stringify(notes));
}

function getRandomColor() {
  return stickyColors[Math.floor(Math.random() * stickyColors.length)];
}

function getContrastColor(hex) {
  const rgb = hex.replace("#", "").match(/.{2}/g).map(x => parseInt(x, 16));
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? "#222" : "#fff";
}

// Escape HTML to avoid injection when editing
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


