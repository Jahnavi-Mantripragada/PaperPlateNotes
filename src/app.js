/**
 * app.js
 * Core functionality for the Paper Plates app, including user authentication,
 * note creation, recipient search, and UI updates.
 */

import { auth, database, ref, set, push, onValue, signInAnonymously } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// DOM Elements
const plate = document.getElementById("plate");
const messageInput = document.getElementById("message");
const musicInput = document.getElementById("music");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const formContainer = document.getElementById("form-container");
const previewNote = document.getElementById("previewNote");
const recipientsRef = ref(database, "recipients");
const fontPicker = document.getElementById("fontPicker");
const fontSizePicker = document.getElementById("fontSizePicker");
const loadingSpinner = document.getElementById("loadingSpinner");

const notesColorPicker = document.getElementById("notesColorPicker");
const textColorPicker = document.getElementById("textColorPicker");
const recipientSearch = document.getElementById("recipientSearch");
const themeCards = document.querySelectorAll(".theme-card");
const customizeBtn = document.getElementById("customizeBtn");
const customizeSection = document.getElementById("customizeSection");
const bgCustomPicker = document.getElementById("bgCustomPicker");
const textCustomPicker = document.getElementById("textCustomPicker");

// Firebase Google Sign-In Provider
const provider = new GoogleAuthProvider();

/**
 * Google Sign-In Functionality
 * - Authenticates the user via Google.
 * - Saves user profile details in Firebase.
 */
document.addEventListener("DOMContentLoaded", () => {
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          console.log("User signed in with Google:", user.displayName);

          // Save user profile in Firebase
          const userId = user.uid;
          const recipientRef = ref(database, `recipients/${userId}`);
          set(recipientRef, {
            name: user.displayName,
            email: user.email,
          });

          alert(`Welcome, ${user.displayName}!`);
          updateUIAfterLogin(user);
        })
        .catch((error) => {
          console.error("Google Sign-In Error:", error.message);
          alert("Failed to sign in with Google. Please try again.");
        });
    });
  } else {
    console.warn("googleSignInBtn not found in DOM.");
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    const urlParams = new URLSearchParams(window.location.search);
    const recipientUid = urlParams.get("uid");
    console.log("Extracted UID from URL:", recipientUid);
    if (recipientUid) {
      // Pre-fill recipient name
      // Fetch recipient details from Firebase
      const recipientRef = ref(database, `recipients/${recipientUid}`);
      onValue(recipientRef, (snapshot) => {
        const recipient = snapshot.val();
        if (recipient) {
          console.log("Fetched recipient data:", recipient);

          // Populate recipient name
          recipientSearch.value = recipient.name;
          recipientSearch.dataset.selectedUid = recipientUid;
          previewRecipient.textContent = recipient.name;
        } else {
          console.warn("Recipient not found in Firebase for UID:", recipientUid);
        }
      });
    }

    if (user.isAnonymous) {
      updateUIForAnonymousUser();
    } else {
      updateUIAfterLogin(user);
      showNotesUI(user.uid);
    }
  } else {
    enableAnonymousLogin();
  }
});


/**
 * Anonymous Login Functionality
 * - Allows users to use the app without signing in.
 */
function enableAnonymousLogin() {
  signInAnonymously(auth)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Anonymous user signed in:", user.uid);
      updateUIForAnonymousUser(); // Update UI for anonymous users
    })
    .catch((error) => {
      console.error("Anonymous sign-in error:", error.message);
    });
}

/**
 * Updates the UI for logged-in users after Google Sign-In.
 * @param {object} user - The authenticated user object.
 */
function updateUIAfterLogin(user) {
  console.log("User signed in:", user.displayName);
  const shareLink = `${window.location.origin}?uid=${user.uid}`;
  const shareLinkInput = document.getElementById("shareLink");
  document.getElementById("shareLinkContainer").style.display = "block";
  shareLinkInput.value = shareLink;
  document.getElementById("loginPrompt").style.display = "none";
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.style.display = "block"; // Show the logout button
  const copyLinkBtn = document.getElementById("copyLinkBtn");

  copyLinkBtn.addEventListener("click", () => {
    if (shareLinkInput) {
      // Select the text in the input field
      shareLinkInput.select();
      shareLinkInput.setSelectionRange(0, 99999); // For mobile compatibility

      // Copy the text to the clipboard
      navigator.clipboard
        .writeText(shareLinkInput.value)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy link. Please try again.");
        });
    } else {
      console.error("Share link input field not found.");
    }
  });
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("User logged out successfully.");
      updateUIForAnonymousUser();
    })
    .catch((error) => {
      console.error("Logout error:", error.message);
    });
});

/**
 * This block is to remove logins
 */

// document.getElementById("logoutBtn").addEventListener("click", () => {
//   const user = auth.currentUser;
//   if (user) {
//     const userRef = ref(database, `recipients/${user.uid}`);
//     set(userRef, null) // Clear user data
//       .then(() => {
//         console.log("User data removed from Firebase.");
//         return auth.signOut();
//       })
//       .then(() => {
//         console.log("User logged out successfully.");
//         updateUIForLoggedOutUser();
//       })
//       .catch((error) => {
//         console.error("Logout or cleanup error:", error.message);
//       });
//   } else {
//     console.warn("No user currently logged in.");
//   }
// });


/**
 * Updates the UI for anonymous users.
 */
function updateUIForAnonymousUser() {
  document.getElementById("loginPrompt").style.display = "block";
  document.getElementById("shareLinkContainer").style.display = "none";
}

/**
 * Allows users to add a new recipient if no match is found.
 * Updates Firebase dynamically and notifies the user.
 */
document.addEventListener("DOMContentLoaded", () => {
  recipientSuggestions.addEventListener("click", (event) => {
  const selectedText = event.target.textContent;

  if (selectedText.startsWith("No matches found")) {
    const newRecipient = recipientSearch.value.trim();
    if (newRecipient) {
      push(recipientsRef, { name: newRecipient })
        .then(() => {
          alert(`"${newRecipient}" has been added to the recipient list.`);
          recipientSuggestions.style.display = "none"; // Hide suggestions
          updatePreview();
        })
        .catch((error) => {
          console.error("Error adding recipient:", error);
        });
    }
  }
  });
});
/**
 * Debounce Function
 * - Ensures Firebase queries are not triggered excessively.
 * @param {function} func - The function to debounce.
 * @param {number} wait - The debounce delay in milliseconds.
 * @returns {function} - The debounced function.
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Handles note submission.
 * - Validates input fields.
 * - Saves the note to Firebase under the selected recipient's UID.
 * - Resets the form and preview on success.
 */
document.addEventListener("DOMContentLoaded", () => {
const addNoteBtn = document.getElementById("addNoteBtn");
addNoteBtn.addEventListener("click", () => {
  const recipient = recipientSearch.dataset.selectedUid; // Get selected recipient UID
  const message = messageInput.value.trim();
  const color = notesColorPicker.value;
  const music = musicInput.value.trim();
  const font = fontPicker.value;
  const textColor = textColorPicker.value;
  const fontSize = fontSizePicker.value;

  // Validate required fields
  if (!recipient || !message) {
    alert("Please select a recipient and write a note.");
    return;
  }

  // Additional validation for music input (optional)
  if (music && !isValidURL(music)) {
    alert("Please enter a valid music URL.");
    return;
  }

  const notesRef = ref(database, `notes/${recipient}`);
  
  console.log("Recipient UID:", recipient); // Should match the UID of the logged-in user
  console.log("Authenticated User UID:", auth.currentUser?.uid); // Ensure this matches the path being accessed
  console.log("Firebase Path:", `notes/${recipient}`);

  push(notesRef, {
    recipient,
    message,
    color,
    font,
    fontSize,
    textColor,
    music: music || null,
    timestamp: Date.now(),
  })
    .then(() => {
      resetForm();
      alert("Note added successfully!");
    })
    .catch((error) => {
      console.error("Error adding note:", error);
    });
});
});

/**
 * Validates whether a given string is a valid URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid, otherwise false.
 */
function isValidURL(url) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // Protocol
      "((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|localhost)" + // Domain name or localhost
      "(\\:\\d+)?(\\/.*)?$", // Port and path
    "i"
  );
  return !!pattern.test(url);
}

/**
 * Resets the form inputs and preview elements.
 */
function resetForm() {
  recipientSearch.value = "";
  delete recipientSearch.dataset.selectedUid; // Clear stored UID
  messageInput.value = "";
  notesColorPicker.value = "#ffffff";
  textColorPicker.value = "#000000";
  fontPicker.value = "Arial, sans-serif";
  fontSizePicker.value = "16px";
  musicInput.value = "";

  previewNote.style.backgroundColor = "#ffffff";
  previewNote.style.color = "#000000";
  previewNote.style.fontFamily = "Arial";
  previewNote.style.fontSize = "16px";
  previewRecipient.textContent = "Recipient's Name";
  previewMessage.textContent = "Your message will appear here.";

  document.querySelectorAll(".bg-color-option").forEach((btn) =>
    btn.classList.remove("selected")
  );
  document.querySelectorAll(".text-color-option").forEach((btn) =>
    btn.classList.remove("selected")
  );
}

function updatePreview() {
  previewRecipient.textContent =
    recipientSearch.value.trim() || "Recipient's Name";
  previewMessage.textContent =
    messageInput.value.trim() || "Your message will appear here.";
  notePreview.style.backgroundColor = notesColorPicker.value;
  notePreview.style.color = textColorPicker.value;
  notePreview.style.fontFamily = fontPicker.value;
  notePreview.style.fontSize = fontSizePicker.value;

  notePreview.classList.remove("fade-anim");
  void notePreview.offsetWidth;
  notePreview.classList.add("fade-anim");
}

/**
 * Updates the preview dynamically based on user inputs.
 * - Text content updates based on message and recipient inputs.
 * - Colors update the note background and text.
 * - Fonts update the note's style and size.
 */

// Recipient name input
document.addEventListener("DOMContentLoaded", () => {

  if (recipientSearch) {
    recipientSearch.addEventListener(
      "input",
      debounce((event) => {
        const query = event.target.value.trim().toLowerCase();
        recipientSuggestions.innerHTML = ""; // Clear previous suggestions

        if (!query) {
          recipientSuggestions.style.display = "none";
          return;
        }

        // Query Firebase for recipients
        showSpinner();
        onValue(
          recipientsRef,
          (snapshot) => {
            const recipients = snapshot.val();
            const matches = recipients
              ? Object.entries(recipients).filter(([uid, recipient]) =>
                  recipient.name.toLowerCase().includes(query)
                )
              : [];

            // Populate suggestions
            if (matches.length > 0) {
              matches.forEach(([uid, recipient]) => {
                const li = document.createElement("li");
                li.textContent = recipient.name;
                li.dataset.uid = uid; // Store UID in the list item
                li.addEventListener("click", () => {
                  recipientSearch.value = recipient.name; // Set name in input
                  recipientSearch.dataset.selectedUid = uid; // Store selected UID
                  recipientSuggestions.style.display = "none"; // Hide dropdown
                  updatePreview();
                });
                recipientSuggestions.appendChild(li);
              });
              recipientSuggestions.style.display = "block";
            } else {
              recipientSuggestions.innerHTML = `<li>No matches found for "${query}". Click to add as new recipient.</li>`;
              recipientSuggestions.style.display = "block";
            }
            hideSpinner();
          },
          (error) => {
            console.error("Error fetching recipients:", error);
            hideSpinner();
          }
        );
      }, 300)
    );
  } else {
    console.warn("recipientSearch element not found in DOM.");
  }
});


// Message content input
document.addEventListener("DOMContentLoaded", () => {
messageInput.addEventListener("input", (e) => {
  const message = e.target.value.trim();
  previewMessage.textContent = message || "Your message will appear here.";
});
});






/**
 * Fetches and displays notes for the current user.
 * - Retrieves notes from Firebase based on the user's UID.
 * - Dynamically updates the plate with the fetched notes.
 * @param {string} userId - The unique ID of the logged-in user.
 */
function showNotesUI(userId) {
  showSpinner(); // Display loading spinner while fetching notes
  console.log("Fetching notes for recipient UID:", userId);
  const userNotesRef = ref(database, `notes/${userId}`);
  
  onValue(
    userNotesRef,
    (snapshot) => {
      const notes = snapshot.val();
      console.log("Fetched notes:", notes);

      if (notes) {
        const fragment = document.createDocumentFragment();
        Object.keys(notes).forEach((noteId) => {
          const note = notes[noteId];

          // Create note element
          const noteElement = document.createElement("div");
          noteElement.className = "note";
          noteElement.style.backgroundColor = note.color;

          // Add recipient
          const recipientElement = document.createElement("p");
          recipientElement.textContent = `To: ${note.recipient}`;
          noteElement.appendChild(recipientElement);

          // Add message
          const messageElement = document.createElement("p");
          messageElement.textContent = note.message;
          messageElement.style.fontFamily = note.font || "'Arial', sans-serif";
          messageElement.style.fontSize = note.fontSize || "16px";
          messageElement.style.color = note.textColor || "#000000";
          noteElement.appendChild(messageElement);

          // Add music link if available
          if (note.music) {
            const musicButton = document.createElement("button");
            musicButton.textContent = "▶ Play Song";
            musicButton.className = "music-button";
            musicButton.onclick = () => window.open(note.music, "_blank");
            noteElement.appendChild(musicButton);
          }

          fragment.appendChild(noteElement);
        });

        plate.innerHTML = ""; // Clear previous notes
        plate.appendChild(fragment); // Append new notes
      } else {
        plate.innerHTML = "<p>No notes found. Share your link to get notes!</p>";
      }

      hideSpinner(); // Hide the spinner after data is loaded
    },
    (error) => {
      console.error("Error fetching notes:", error);
      hideSpinner();
    }
  );
}


/**
 * Displays the loading spinner.
 * Ensures users are informed about ongoing operations.
 */
function showSpinner() {
  if (loadingSpinner) {
    loadingSpinner.style.display = "block";
  } else {
    console.error("Loading spinner element not found in the DOM.");
  }
}

/**
 * Hides the loading spinner.
 * Indicates the completion of operations.
 */
function hideSpinner() {
  if (loadingSpinner) {
    loadingSpinner.style.display = "none";
  } else {
    console.error("Loading spinner element not found in the DOM.");
  }
}

/**
 * Toggles the visibility of the note submission form.
 */
document.addEventListener("DOMContentLoaded", () => {
toggleFormBtn.addEventListener("click", () => {
  if (formContainer.style.display === "none" || !formContainer.style.display) {
    formContainer.style.display = "block";
    toggleFormBtn.innerText = "Hide Form";
  } else {
    formContainer.style.display = "none";
    toggleFormBtn.innerText = "Add a Note";
  }
});
});

// Initialize form visibility
document.addEventListener("DOMContentLoaded", () => {
formContainer.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  const togglePreviewBtn = document.getElementById("togglePreviewBtn");
  const notePreview = document.getElementById("notePreview");

  togglePreviewBtn.addEventListener("click", () => {
    if (notePreview.style.display === "none") {
      notePreview.style.display = "block";
      togglePreviewBtn.innerText = "Hide Preview";
    } else {
      notePreview.style.display = "none";
      togglePreviewBtn.innerText = "Click to Preview Your Note";
    }
  });

  recipientSearch.addEventListener("input", updatePreview);
  messageInput.addEventListener("input", updatePreview);
  notesColorPicker.addEventListener("input", updatePreview);
  textColorPicker.addEventListener("input", updatePreview);
  fontPicker.addEventListener("change", updatePreview);
  fontSizePicker.addEventListener("change", updatePreview);
});

// Setup color circle pickers
document.addEventListener("DOMContentLoaded", () => {
  function setupColorOptions(selector, picker) {
    const options = document.querySelectorAll(selector);
    options.forEach((opt) => {
      const type = opt.tagName.toLowerCase() === "input" ? "input" : "click";
      opt.addEventListener(type, () => {
        options.forEach((o) => o.classList.remove("selected"));
        if (type === "click") opt.classList.add("selected");
        picker.value = opt.dataset.color || opt.value;
        updatePreview();
      });
    });
  }

  setupColorOptions(".bg-color-option", notesColorPicker);
  setupColorOptions(".text-color-option", textColorPicker);
  updatePreview();
});

// Theme selection and customize flow
document.addEventListener("DOMContentLoaded", () => {
  themeCards.forEach((card) => {
    card.addEventListener("click", () => {
      themeCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      notesColorPicker.value = card.dataset.bg;
      textColorPicker.value = card.dataset.text;
      fontPicker.value = card.dataset.font;
      fontSizePicker.value = card.dataset.size;
      updatePreview();
    });
  });

  if (customizeBtn && customizeSection) {
    customizeBtn.addEventListener("click", () => {
      customizeSection.style.display = "block";
      customizeBtn.style.display = "none";
    });
  }

  if (bgCustomPicker) {
    bgCustomPicker.addEventListener("input", () => {
      notesColorPicker.value = bgCustomPicker.value;
      updatePreview();
    });
  }

  if (textCustomPicker) {
    textCustomPicker.addEventListener("input", () => {
      textColorPicker.value = textCustomPicker.value;
      updatePreview();
    });
  }
});

// Setup color circle pickers
document.addEventListener("DOMContentLoaded", () => {
  function setupColorOptions(selector, picker) {
    const options = document.querySelectorAll(selector);
    options.forEach((opt) => {
      opt.addEventListener("click", () => {
        options.forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
        picker.value = opt.dataset.color;
        picker.dispatchEvent(new Event("input"));
      });
    });
  }

  setupColorOptions(".bg-color-option", notesColorPicker);
  setupColorOptions(".text-color-option", textColorPicker);
});
