const noteBoard = document.querySelector('#note-board');
const addTextBtn = document.querySelector('#add-note-btn');
const addListBtn = document.querySelector('#add-list-btn');
const clearBtn = document.querySelector('#clear-all-btn');

//temporary storage to track the notes added to the board
let tempStorageNote = {
  text: [],
  list: [],
};

//Clears local storage & reloads page when clear button is clicked
clearBtn.addEventListener('click', function () {
  localStorage.clear();
  location.reload();
});

//Updates local storage with tempStorageNote
function updateLocalStorage() {
  localStorage.setItem('noteBoardData', JSON.stringify(tempStorageNote));
}

//reload page from local storage
function loadFromLocalStorage () {
  const storedNotes = JSON.parse(localStorage.getItem('noteBoardData'));
  if (storedNotes) {
    tempStorageNote = storedNotes;
    for (let i = 0; i < tempStorageNote.text.length; i++) {
      const text = tempStorageNote.text[i];
      const textDiv = document.createElement("div");
      textDiv.classList.add("text-item", "draggable");
      textDiv.textContent = text.text;
      textDiv.style.left = text.left;
      textDiv.style.top = text.top;
      noteBoard.appendChild(textDiv);
    }
    for (let i = 0; i < tempStorageNote.list.length; i++) {
      const ul = tempStorageNote.list[i];
      const ulDiv = document.createElement("ul");
      ulDiv.classList.add("list-item", "draggable");
      ulDiv.textContent = ul.text;
      ulDiv.style.left = ul.left;
      ulDiv.style.top = ul.top;
      noteBoard.appendChild(ulDiv);
    }
  }
}

if (currentElement.tagName === 'DIV') {
  tempStorageNote.text.push({
    text: currentElement.textContent,
    left: left,
    top: top,
  });
} else {
    tempStorageNote.list.push({
      text: currentElement.textContent,
      left: left,
      top: top,
    });
  }
  
  //updates the local storage with the new tempStorageNote information 
  updateLocalStorage();

//loads data from local storage when page is loaded 
window.onload = loadFromLocalStorage;