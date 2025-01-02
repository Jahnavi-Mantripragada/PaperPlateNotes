import { auth, database, ref, set, push, onValue, signInAnonymously } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

const googleSignInBtn = document.getElementById("googleSignInBtn");
const provider = new GoogleAuthProvider();

googleSignInBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in with Google:", user.displayName);

      // Save the user profile if logging in for the first time
      const userId = user.uid;
      const recipientRef = ref(database, `recipients/${userId}`);
      set(recipientRef, {
        name: user.displayName,
        email: user.email,
        avatarUrl: user.photoURL,
      });

      // Redirect to dashboard or refresh notes view
      alert(`Welcome, ${user.displayName}!`);
      location.reload(); // Refresh to show "My Notes"
    })
    .catch((error) => {
      console.error("Google Sign-In Error:", error.message);
    });
});

const urlParams = new URLSearchParams(window.location.search);
const recipientUid = urlParams.get("uid");

if (recipientUid) {
  console.log("Leaving a note for recipient UID:", recipientUid);
  // Show the note submission form
  document.getElementById("noteSubmissionForm").style.display = "block";

  // Save the note under the recipient's UID
  const submitNoteBtn = document.getElementById("submitNoteBtn");
  submitNoteBtn.addEventListener("click", () => {
    const message = document.getElementById("noteMessage").value.trim();
    const color = document.getElementById("noteColor").value;
    const textColor = document.getElementById("textColor").value;

    if (!message) {
      alert("Please write a message before submitting.");
      return;
    }

    const notesRef = ref(database, `notes/${recipientUid}`);
    push(notesRef, {
      message: message,
      color: color,
      textColor: textColor,
      timestamp: Date.now(),
    });

    alert("Note submitted successfully!");
    document.getElementById("noteSubmissionForm").reset();
  });
}

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

    auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.isAnonymous) {
          console.log("Anonymous user detected.");
          document.getElementById("loginPrompt").style.display = "block"; // Show login prompt
          document.getElementById("plate").style.display = "none"; // Hide notes view
        } else {
          console.log("Logged-in user detected:", user.displayName);

           // Generate the unique link
          const shareLink = `https://your-app.com/notes?uid=${user.uid}`;
          const shareLinkInput = document.getElementById("shareLink");

          // Show the link container and set the link value
          document.getElementById("shareLinkContainer").style.display = "block";
          shareLinkInput.value = shareLink;

          // Copy link functionality
          document.getElementById("copyLinkBtn").addEventListener("click", () => {
            shareLinkInput.select();
            document.execCommand("copy");
            alert("Link copied to clipboard!");
          });

          document.getElementById("loginPrompt").style.display = "none"; // Hide login prompt
          showNotesUI(user.uid); // Fetch and display user's notes
        }
      } else {
        console.log("No user detected.");
      }
    });
    function showNotesUI(userId) {
      showSpinner(); // Show loading spinner
      const userNotesRef = ref(database, `notes/${userId}`);
    
      onValue(userNotesRef, (snapshot) => {
        const notes = snapshot.val();
        if (notes) {
          const fragment = document.createDocumentFragment();
          Object.keys(notes).forEach((noteId) => {
            const note = notes[noteId];
    
            // Render note
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
            fragment.appendChild(noteElement);
          });
          plate.innerHTML = ""; // Clear and append new notes
          plate.appendChild(fragment);
          hideSpinner(); // Hide loading spinner
        } else {
          hideSpinner(); // Hide loading spinner
          plate.innerHTML = "<p>No notes found. Share your link to get notes!</p>";
        }
      });
    } 
});