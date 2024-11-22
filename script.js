const noteBoard = document.querySelector('#note-board');
const addTextBtn = document.querySelector('#add-note-btn');
const addListBtn = document.querySelector('#add-list-btn');
const clearBtn = document.querySelector('#clear-all-btn');

let tempStorageNote = {
  text: [],
  lists: [],
};

//Clears local storage & reloads page when clear button is clicked
clearBtn.addEventListener('click', function () {
  localStorage.clear();
  location.reload();
});