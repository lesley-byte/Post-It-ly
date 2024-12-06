const noteBoard = document.querySelector("#notes-board");
if (!noteBoard) {
  throw new Error("Failed to initialize: #notes-board element not found.");
}

let noteId = 1;
let currentNote = null;
let startX = 0,
  startY = 0,
  newX = 0,
  newY = 0;

// Ensure only one event listener is attached to the "Add Note" button
document.addEventListener("DOMContentLoaded", () => {
  try {
    initializeButtons();
    loadNotes();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

function initializeButtons() {
  // Add Note Button (opens the modal, logic is in HTML attributes)
  const addNoteButton = document.getElementById("add-note-btn");
  if (!addNoteButton) {
    console.error("Failed to initialize: #add-note-btn element not found.");
  }

  // Clear All Modal Confirm Button
  const confirmClearButton = document.getElementById("confirm-clear-btn");
  if (confirmClearButton) {
    confirmClearButton.addEventListener("click", () => {
      try {
        // Clear notes from localStorage and DOM
        localStorage.removeItem("notes");
        noteBoard.innerHTML = ""; // Clear dynamically
        console.log("All notes cleared successfully.");

        // Update empty state message
        updateEmptyStateMessage();

        // Optionally hide the modal programmatically
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("confirmClearModal")
        );
        if (modal) modal.hide();
      } catch (error) {
        console.error("Error clearing notes:", error);
      }
    });
  } else {
    console.error(
      "Failed to initialize: #confirm-clear-btn element not found."
    );
  }

  // Save Note Modal Button
  const saveNoteButton = document.getElementById("save-note-btn");
  if (saveNoteButton) {
    saveNoteButton.addEventListener("click", () => {
      try {
        const noteContentInput = document.getElementById("note-content");
        const noteColorInput = document.getElementById("note-color");

        // Get content and color from modal inputs
        const noteContent = noteContentInput.value.trim() || "New Note";
        const noteColor = noteColorInput.value || "#FFCC00";

        // Create and add note
        const note = createNoteElement({
          id: `note${noteId++}`,
          content: noteContent,
          color: noteColor,
          top: "0px",
          left: "0px",
        });

        noteBoard.appendChild(note);
        saveNotes();

        console.log(`Note created from modal: ${noteContent}`);

        // Clear modal inputs
        noteContentInput.value = "";
        noteColorInput.value = "#FFCC00";

        // Optionally hide the modal programmatically
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addNoteModal")
        );
        if (modal) modal.hide();

        // Update empty state
        updateEmptyStateMessage();
      } catch (error) {
        console.error("Error saving note from modal:", error);
      }
    });
  } else {
    console.error("Failed to initialize: #save-note-btn element not found.");
  }

  // Existing Clear All Button (Only Opens Modal)
  const clearAllButton = document.getElementById("clear-all-btn");
  if (clearAllButton) {
    clearAllButton.addEventListener("click", () => {
      console.log("Clear All button clicked, modal triggered.");
      // No logic here as the modal handles the actual confirmation
    });
  } else {
    console.error("Failed to initialize: #clear-all-btn element not found.");
  }
}

// Create a new note
function createNote() {
  if (!noteBoard) {
    console.error("Note board container not found.");
    return;
  }

  try {
    const note = createNoteElement({
      id: `note${noteId++}`,
      content: "Click to Edit",
      color: "#FFCC00",
      top: "0px",
      left: "0px",
    });

    noteBoard.appendChild(note);
    saveNotes();
    console.log(`Note created: ID=${note.id}`);
  } catch (error) {
    console.error("Error in createNote function:", error);
  }
}

// Create and return a note element
function createNoteElement({ id, content, color, top, left }) {
  if (!id || !content) {
    throw new Error("Invalid note data. Both 'id' and 'content' are required.");
  }

  // Create the note container
  const note = document.createElement("div");
  note.classList.add("note");
  note.id = id;
  note.style.position = "absolute";
  note.style.backgroundColor = color || "#FFCC00";
  note.style.top = top || "0px";
  note.style.left = left || "0px";

  // Create the header
  const noteHeader = document.createElement("div");
  noteHeader.classList.add("note-header");

  // Title or ID (top-left)
  const noteTitle = document.createElement("span");
  noteTitle.textContent = `Note ${id}`;
  noteTitle.classList.add("note-title");

  // Clear button (top-right)
  const clearButton = document.createElement("span");
  clearButton.classList.add("clear-button");
  clearButton.innerHTML = "&times;";
  clearButton.addEventListener("click", () => {
    try {
      note.remove();
      saveNotes();
      console.log(`Note removed: ID=${id}`);
    } catch (error) {
      console.error(`Error removing note ID=${id}:`, error);
    }
  });

  noteHeader.append(noteTitle, clearButton);

  // Content area
  const noteContent = document.createElement("div");
  noteContent.classList.add("note-content");
  noteContent.contentEditable = true;
  noteContent.textContent = content;
  noteContent.addEventListener("focus", () => {
    if (noteContent.textContent === "Click to Edit") {
      noteContent.textContent = "";
    }
  });

  note.append(noteHeader, noteContent);

  // Drag functionality
  note.addEventListener("mousedown", (event) => {
    currentNote = note;
    startX = event.clientX;
    startY = event.clientY;
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  });

  return note;
}

// Save notes to localStorage
function saveNotes() {
  try {
    const notes = [...noteBoard.querySelectorAll(".note")].map((note) => ({
      id: note.id,
      content: note.querySelector(".note-content").textContent,
      color: note.style.backgroundColor,
      // Save only numeric values for `top` and `left` to avoid "px" inconsistencies
      top: parseInt(note.style.top, 10) || 0,
      left: parseInt(note.style.left, 10) || 0,
    }));

    localStorage.setItem("notes", JSON.stringify(notes));
    // console.log("Notes saved successfully:", notes);
  } catch (error) {
    console.error("Error saving notes:", error);
  }
}

// Load notes from localStorage
function loadNotes() {
  try {
    const savedNotes = JSON.parse(localStorage.getItem("notes"));

    if (!savedNotes || !Array.isArray(savedNotes)) {
      console.warn(
        "No notes found in localStorage or invalid data format. Initializing as an empty array."
      );
      updateEmptyStateMessage();
      return;
    }

    console.log("Notes loaded from localStorage:", savedNotes);

    // Create and append notes to the board
    savedNotes.forEach((noteData) => {
      try {
        const note = createNoteElement({
          id: noteData.id,
          content: noteData.content,
          color: noteData.color,
          top: `${noteData.top}px`, // Convert numeric top to pixel value
          left: `${noteData.left}px`, // Convert numeric left to pixel value
        });
        noteBoard.appendChild(note);
      } catch (noteError) {
        console.error("Error creating note from localStorage data:", noteError);
      }
    });

    updateEmptyStateMessage(); // Update the empty state message
  } catch (error) {
    console.error("Error loading notes:", error);
    updateEmptyStateMessage();
  }
}

function updateEmptyStateMessage() {
  const emptyStateMessage = document.getElementById("empty-state-message");

  if (!emptyStateMessage) {
    console.warn("Empty state message element not found.");
    return;
  }

  // Show or hide the empty state message based on the number of notes
  const hasNotes = noteBoard.querySelectorAll(".note").length > 0;

  if (hasNotes) {
    emptyStateMessage.style.display = "none";
    console.log("Notes exist. Hiding empty state message.");
  } else {
    emptyStateMessage.style.display = "block";
    console.log("No notes found. Displaying empty state message.");
  }
}

function mouseDown(event) {
  if (event.target.classList.contains("note-top-bar")) {
    currentNote = event.target.parentElement;

    // Ensure the note has valid `left` and `top` styles
    if (!currentNote.style.left) {
      currentNote.style.left = `${currentNote.offsetLeft}px`;
    }
    if (!currentNote.style.top) {
      currentNote.style.top = `${currentNote.offsetTop}px`;
    }

    // Get numeric values for the current position
    const currentLeft = parseInt(currentNote.style.left, 10);
    const currentTop = parseInt(currentNote.style.top, 10);

    // Calculate offsets based on the current position
    startX = event.clientX - currentLeft;
    startY = event.clientY - currentTop;

    console.log(
      `MouseDown - Note Position: left=${currentLeft}px, top=${currentTop}px`
    );
    console.log(`MouseDown - Offset: startX=${startX}, startY=${startY}`);

    // Attach mousemove and mouseup listeners
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  }
}

function mouseMove(event) {
  if (!currentNote) return;

  try {
    // Calculate the new position relative to the current offsets
    const newLeft = event.clientX - startX;
    const newTop = event.clientY - startY;

    console.log(`MouseMove - Calculated: left=${newLeft}px, top=${newTop}px`);

    // Update the note's position
    currentNote.style.left = `${newLeft}px`;
    currentNote.style.top = `${newTop}px`;
  } catch (error) {
    console.error("Error during mouseMove event:", error);
  }
}

function mouseUp() {
  if (currentNote) {
    console.log(
      `MouseUp - Note moved to: left=${currentNote.style.left}, top=${currentNote.style.top}`
    );
    currentNote = null;

    // Remove event listeners
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }
}

// Ensure notes have valid `left` and `top` styles when created
function createNoteElement(noteData) {
  const note = document.createElement("div");
  note.classList.add("note", "card");
  note.id = noteData.id;
  note.style.position = "absolute";
  note.style.left = noteData.left || "0px";
  note.style.top = noteData.top || "0px";
  note.style.backgroundColor = noteData.color;
  note.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

  // Create top bar for dragging
  const topBar = document.createElement("div");
  topBar.classList.add(
    "note-top-bar",
    "card-header",
    "d-flex",
    "justify-content-between"
  );
  topBar.style.cursor = "move";
  // Set the background color of the top bar to match the note but be a little lighter
  topBar.style.backgroundColor = noteData.color.replace("1)", "0.8)");
  topBar.style.padding = "5px";
  topBar.style.display = "flex";
  topBar.style.justifyContent = "space-between";
  topBar.style.alignItems = "center";
  topBar.style.borderBottom = "1px solid rgba(0, 0, 0, 0.125)";

  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";
  deleteButton.classList.add("btn", "btn-sm", "btn-danger");
  deleteButton.style.backgroundColor = "red";
  deleteButton.style.color = "white";
  deleteButton.style.border = "none";
  deleteButton.style.cursor = "pointer";
  deleteButton.style.marginLeft = "auto";
  deleteButton.addEventListener("click", () => {
    note.remove();
    saveNotes();
    updateEmptyStateMessage();
  });

  // Create content area for the note
  const contentArea = document.createElement("div");
  contentArea.classList.add("note-content", "card-body");
  contentArea.contentEditable = "true";
  contentArea.style.padding = "10px";
  contentArea.textContent = noteData.content;

  // Append delete button and content area to the note
  topBar.appendChild(deleteButton);
  note.appendChild(topBar);
  note.appendChild(contentArea);

  // Add event listeners for dragging
  topBar.addEventListener("mousedown", mouseDown);

  return note;
}
