import { auth, database, ref, set, push, onValue, signInAnonymously } from "./firebase.js";

// DOM Elements
const plate = document.getElementById("plate");
const addNoteBtn = document.getElementById("addNoteBtn");
const messageInput = document.getElementById("message");
const notesColorPicker = document.getElementById("notesColorPicker");
const notesColorPickerLabel = document.querySelector(
  'label[for="notesColorPicker"]'
);
const musicInput = document.getElementById("music");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const formContainer = document.getElementById("form-container");
const previewNote = document.getElementById("previewNote");
const recipientSearch = document.getElementById("recipientSearch");
const recipientSuggestions = document.getElementById("recipientSuggestions");
const recipientsRef = ref(database, "recipients");
const fontPicker = document.getElementById("fontPicker");
const textColorPicker = document.getElementById("textColorPicker");
const textColorPickerLabel = document.querySelector(
  'label[for="textColorPicker"]'
);

onValue(recipientsRef, (snapshot) => {
  const recipients = snapshot.val();
  const matches = recipients
    ? Object.values(recipients).filter((name) =>
        name.toLowerCase().includes(query)
      )
    : [];
  console.log("Matching recipients:", matches);
});

onValue(recipientsRef, (snapshot) => {
  const recipients = snapshot.val();
  console.log("All recipients:", recipients);
});

recipientSearch.addEventListener("input", async (event) => {
  const query = event.target.value.trim().toLowerCase();

  if (!query) {
    recipientSuggestions.style.display = "none"; // Hide suggestions if query is empty
    return;
  }

  // Query Firebase for recipient names
  const recipientsRef = ref(database, "recipients"); // Assuming recipients are stored here
  onValue(recipientsRef, (snapshot) => {
    const recipients = snapshot.val();

    // Filter recipients based on the query
    const matches = recipients
      ? Object.values(recipients).filter((name) =>
          name.toLowerCase().includes(query)
        )
      : [];

    // Populate suggestions
    recipientSuggestions.innerHTML = ""; // Clear previous suggestions
    if (matches.length > 0) {
      matches.forEach((name) => {
        const li = document.createElement("li");
        li.textContent = name;
        li.addEventListener("click", () => {
          recipientSearch.value = name; // Set the selected name
          recipientSuggestions.style.display = "none"; // Hide suggestions
        });
        recipientSuggestions.appendChild(li);
      });
      recipientSuggestions.style.display = "block"; // Show suggestions
    } else {
      // No matches found
      recipientSuggestions.innerHTML = `<li>No matches found. Would you like to add "${query}"?</li>`;
      recipientSuggestions.style.display = "block";
    }
  });
});

recipientSuggestions.addEventListener("click", (event) => {
  const selectedText = event.target.textContent;

  if (selectedText.startsWith("No matches found")) {
    const newRecipient = recipientSearch.value.trim();
    if (newRecipient) {
      // Add the new recipient to Firebase
      const recipientsRef = ref(database, "recipients");
      push(recipientsRef, newRecipient);

      alert(`"${newRecipient}" has been added to the recipient list.`);
      recipientSuggestions.style.display = "none"; // Hide suggestions
    }
  }
});

recipientSearch.addEventListener("input", (e) => {
  const recipientName = e.target.value.trim();
  previewRecipient.textContent = recipientName || "Recipient's Name";
});

messageInput.addEventListener("input", (e) => {
  const message = e.target.value.trim();
  previewMessage.textContent = message || "Your message will appear here.";
});

fontPicker.addEventListener("change", (e) => {
  const selectedFont = e.target.value;
  previewNote.style.fontFamily = selectedFont;
});

// Update the circle color dynamically
notesColorPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  notesColorPickerLabel.style.backgroundColor = selectedColor;
  previewNote.style.backgroundColor = selectedColor;
});

// Update text color dynamically
textColorPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  textColorPickerLabel.style.backgroundColor = selectedColor;
  previewNote.style.color = selectedColor;
});

// Toggle Form Visibility
toggleFormBtn.addEventListener("click", () => {
  if (formContainer.style.display === "none" || !formContainer.style.display) {
    formContainer.style.display = "block";
    previewNote.style.display = "block";
    toggleFormBtn.innerText = "Hide Form";
  } else {
    formContainer.style.display = "none";
    previewNote.style.display = "none";
    toggleFormBtn.innerText = "Add a Note";
  }
});

// Initialize form to be visible
formContainer.style.display = "none"; // Hide form on page load
previewNote.style.display = "none"; // Hide preview on page load


// Add a Note
addNoteBtn.addEventListener("click", () => {
  const recipient = recipientSearch.value.trim();
  const message = messageInput.value.trim();
  const color = notesColorPicker.value;
  const music = musicInput.value.trim();
  const font = fontPicker.value; // Get selected font
  const textColor = textColorPicker.value; // Get selected text color
  
  if (!recipient || !message) {
    alert("Please fill out the recipient's name and write a note.");
    return;
  }

  if (recipient && message) {
    if (!music) {
      const confirmNoMusic = confirm("Are you sure you don't want to add a song?");
      if (!confirmNoMusic) return;
    }

    const userId = auth.currentUser.uid;
    const notesRef = ref(database, `notes/${userId}`);
    push(notesRef, {
      recipient,
      message,
      color,
      font,
      textColor,
      music: music || null,
      timestamp: Date.now(),
    });

    // Reset Form
    recipientSearch.value = "";
    messageInput.value = "";
    notesColorPicker.value = "#000000";
    textColorPicker.value = "#ffffff";
    fontPicker.value = "'Arial', sans-serif";
    musicInput.value = "";

     // Reset preview
    previewNote.style.backgroundColor = "#000000";
    previewNote.style.color = "#ffffff";
    previewNote.style.fontFamily = "Arial";
    previewRecipient.textContent = "Recipient's Name";
    previewMessage.textContent = "Your message will appear here.";


    alert("Note added successfully!");
  } else {
    alert("Please fill out the recipient's name and note message.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  //console.log("Current DOM:", document.body.innerHTML); // Log DOM structure
  const spinner = document.getElementById("loadingSpinner");

    // Verify spinner existence
    if (!spinner) {
        console.error("Loading spinner not found in the DOM.");
        return;
    }

    //console.log("Loading spinner found in the DOM.");

    // Show spinner when starting a process
    function showSpinner() {
        //console.log("Showing spinner");
        spinner.style.display = "block";
    }
    // Hide spinner when the process completes
    function hideSpinner() {
        spinner.style.display = "none";
    }
// Display Notes
  signInAnonymously(auth)
    .then((userCredential) => {
    const userId = userCredential.user.uid;
    console.log("User signed in:", userId);
    showSpinner();
    const userNotesRef = ref(database, `notes/${userId}`);
    onValue(userNotesRef, (snapshot) => {
      const notes = snapshot.val();
      plate.innerHTML = "";  
      if (notes) {
        const fragment = document.createDocumentFragment();
        Object.keys(notes).forEach((noteId) => {
          const note = notes[noteId];
          // Skip invalid notes
          if (!note) return;
        
          const noteElement = document.createElement("div");
          noteElement.className = "note";
          noteElement.style.backgroundColor = note.color;
        
          const recipientElement = document.createElement("p");
          recipientElement.textContent = `To: ${note.recipient}`;
          const messageElement = document.createElement("p");
          messageElement.textContent = note.message;
          messageElement.style.fontFamily = note.font || "'Arial', sans-serif";
          messageElement.style.color = note.textColor || "#000000";
        
          noteElement.appendChild(recipientElement);
          noteElement.appendChild(messageElement);
        
          if (note.music) {
            const playButton = document.createElement("button");
            playButton.textContent = "▶ Play Song";
            playButton.onclick = () => window.open(note.music, "_blank");
            noteElement.appendChild(playButton);
          }
        
          fragment.appendChild(noteElement);
        });
        
        plate.innerHTML = ""; // Clear existing notes
        plate.appendChild(fragment); // Add all at once       
      } else {
          plate.innerHTML = "<p>No notes found. Ask your friends to add some notes!</p>";
      }
      hideSpinner();
  });  
  })
  .catch((error) => console.error("Error signing in:", error));
});