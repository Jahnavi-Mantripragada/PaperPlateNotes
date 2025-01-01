import { auth, database, ref, set, push, onValue, signInAnonymously } from "./firebase.js";

// DOM Elements
const plate = document.getElementById("plate");
const addNoteBtn = document.getElementById("addNoteBtn");
const recipientInput = document.getElementById("recipient");
const messageInput = document.getElementById("message");
const colorPicker = document.getElementById("colorPicker");
const colorPickerLabel = document.querySelector(".color-picker-label");
const musicInput = document.getElementById("music");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const formContainer = document.getElementById("form-container");
const recipientSearch = document.getElementById("recipientSearch");
const recipientSuggestions = document.getElementById("recipientSuggestions");

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


// Update the circle color dynamically
colorPicker.addEventListener("input", (e) => {
  const selectedColor = e.target.value;
  colorPickerLabel.style.backgroundColor = selectedColor;
});

// Toggle Form Visibility
toggleFormBtn.addEventListener("click", () => {
  if (formContainer.style.display === "none" || !formContainer.style.display) {
    formContainer.style.display = "block";
    toggleFormBtn.innerText = "Hide Form";
  } else {
    formContainer.style.display = "none";
    toggleFormBtn.innerText = "Add a Note";
  }
});

// Initialize form to be visible
formContainer.style.display = "none"; // Hide form on page load


// Add a Note
addNoteBtn.addEventListener("click", () => {
  const recipient = recipientInput.value.trim();
  const message = messageInput.value.trim();
  const color = colorPicker.value;
  const music = musicInput.value.trim();
  
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
      music: music || null,
      timestamp: Date.now(),
    });

    // Reset Form
    recipientInput.value = "";
    messageInput.value = "";
    colorPicker.value = "#000000";
    musicInput.value = "";
    alert("Note added successfully!");
  } else {
    alert("Please fill out the recipient's name and note message.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Current DOM:", document.body.innerHTML); // Log DOM structure
  const spinner = document.getElementById("loadingSpinner");

    // Verify spinner existence
    if (!spinner) {
        console.error("Loading spinner not found in the DOM.");
        return;
    }

    console.log("Loading spinner found in the DOM.");

    // Show spinner when starting a process
    function showSpinner() {
        console.log("Showing spinner");
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