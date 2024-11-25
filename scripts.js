let noteId=1;

//start
function createNotePad(){
    const addNoteButton = document.getElementById('add-note-button');

    const notePad = document.getElementById('div');
    notePad.className='note-pad';
    notePad.id='note'+noteId;

    const clearallButton = document.getElementById('span');
    clearAllButton.className = 'clear-all-button';
    clearAllButton.innerHTML = '&times;';
    clearAllButton.onclick = function(){
        noteContainer.removechild(notePad);
        saveNotes();
    }
    
    const noteContent = document.createElement('div');
    noteContent.contentEditable = true;
    noteContent.className = 'note-content';
    noteContent.innerHTML = 'Click to Edit';

    noteContent.addEventListener
}