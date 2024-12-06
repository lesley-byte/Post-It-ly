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
let currentlyEditingNote = null; // Reference to the note being edited

// Ensure only one event listener is attached to the "Add Note" button
document.addEventListener("DOMContentLoaded", () => {
  try {
    initializeButtons();
    loadNotes();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

window.addEventListener("resize", () => {
  const board = document.getElementById("notes-board");
  const boardRect = board.getBoundingClientRect();
  const notes = document.querySelectorAll("#notes-board .note");

  notes.forEach((note) => {
    const left = parseInt(note.style.left, 10) || 0;
    const top = parseInt(note.style.top, 10) || 0;

    // Constrain the note within the new board dimensions
    const maxLeft = boardRect.width - note.offsetWidth;
    const maxTop = boardRect.height - note.offsetHeight;

    note.style.left = `${Math.min(Math.max(0, left), maxLeft)}px`;
    note.style.top = `${Math.min(Math.max(0, top), maxTop)}px`;
  });
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
// Ensure notes have valid `left` and `top` styles when created
function createNoteElement(noteData) {
  const board = document.getElementById("notes-board");
  const boardRect = board.getBoundingClientRect();

  // Create the note container
  const note = document.createElement("div");
  note.classList.add("note", "card");
  note.id = noteData.id;
  note.style.position = "absolute";
  note.style.backgroundColor = noteData.color;
  note.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  note.style.width = "200px"; // Example fixed width for notes

  // Ensure the note starts within the bounds of the board
  const initialLeft = Math.min(
    parseInt(noteData.left, 10) || 0,
    boardRect.width - 200
  );
  const initialTop = Math.min(
    parseInt(noteData.top, 10) || 0,
    boardRect.height - 100
  );

  note.style.left = `${Math.max(0, initialLeft)}px`;
  note.style.top = `${Math.max(0, initialTop)}px`;

  // Create top bar for dragging
  const topBar = document.createElement("div");
  topBar.classList.add(
    "note-top-bar",
    "card-header",
    "d-flex",
    "justify-content-between"
  );
  topBar.style.cursor = "move";
  topBar.style.backgroundColor = noteData.color.replace("1)", "0.8)");
  topBar.style.padding = "5px";
  topBar.style.borderBottom = "1px solid rgba(0, 0, 0, 0.125)";

  // Create Edit Button
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("btn", "btn-sm", "btn-primary", "me-2");
  editButton.addEventListener("click", () => openEditModal(note));

  // Create Delete Button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";
  deleteButton.classList.add("btn", "btn-sm", "btn-danger");
  deleteButton.addEventListener("click", () => {
    note.remove();
    saveNotes();
    updateEmptyStateMessage();
  });

  // Function to open the edit modal
  function openEditModal(note) {
    currentlyEditingNote = note; // Track the note being edited

    // Get the content and color of the note
    document.getElementById("edit-note-content").value =
      note.querySelector(".note-content").textContent;

    // Convert RGB to Hex for the color input
    const rgbColor = note.style.backgroundColor;
    const hexColor = rgbToHex(rgbColor);
    document.getElementById("edit-note-color").value = hexColor;

    // Show the modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editNoteModal")
    );
    editModal.show();
  }

  // Helper function to convert RGB to Hex
  function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return "#000000"; // Fallback to black if the input is invalid
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  // Logic for updating the note
  document.getElementById("update-note-btn").addEventListener("click", () => {
    if (currentlyEditingNote) {
      const updatedContent = document.getElementById("edit-note-content").value;
      const updatedColor = document.getElementById("edit-note-color").value;

      // Apply updates to the note and the top bar
      currentlyEditingNote.querySelector(".note-content").textContent =
        updatedContent;
      currentlyEditingNote.style.backgroundColor = updatedColor;
      currentlyEditingNote.querySelector(
        ".note-top-bar"
      ).style.backgroundColor = updatedColor.replace("1)", "0.8)");

      // Save changes to localStorage
      saveNotes();

      // Close the modal
      const editModal = bootstrap.Modal.getInstance(
        document.getElementById("editNoteModal")
      );
      editModal.hide();

      console.log("Note updated successfully.");
    }
  });

  // Create Content Area
  const contentArea = document.createElement("div");
  contentArea.classList.add("note-content", "card-body", "p-3");
  contentArea.contentEditable = "true";
  contentArea.textContent = noteData.content;

  // Assemble the note
  topBar.appendChild(editButton);
  topBar.appendChild(deleteButton);
  note.appendChild(topBar);
  note.appendChild(contentArea);

  // Enable dragging
  topBar.addEventListener("mousedown", mouseDown);

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

  const board = document.getElementById("notes-board");
  const boardRect = board.getBoundingClientRect();
  const noteRect = currentNote.getBoundingClientRect();

  // Calculate the new position
  let newLeft = event.clientX - startX;
  let newTop = event.clientY - startY;

  // Constrain within the board's boundaries
  if (newLeft < 0) newLeft = 0; // Left boundary
  if (newTop < 0) newTop = 0; // Top boundary
  if (newLeft + noteRect.width > boardRect.width) {
    newLeft = boardRect.width - noteRect.width; // Right boundary
  }
  if (newTop + noteRect.height > boardRect.height) {
    newTop = boardRect.height - noteRect.height; // Bottom boundary
  }

  // Apply the constrained position
  currentNote.style.left = `${newLeft}px`;
  currentNote.style.top = `${newTop}px`;

  console.log(`MouseMove - Calculated: left=${newLeft}px, top=${newTop}px`);
}

function mouseUp() {
  if (currentNote) {
    console.log(
      `MouseUp - Note moved to: left=${currentNote.style.left}, top=${currentNote.style.top}`
    );
    currentNote = null;

    // Save notes after dragging
    saveNotes();

    // Remove event listeners
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }
}
