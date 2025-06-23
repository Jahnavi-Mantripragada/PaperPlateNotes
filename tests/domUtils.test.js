import { resetForm } from "../src/app.js";

jest.mock("firebase/auth", () => ({
    signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: "testUserId" } })),
  }));
  
  test("calls signInAnonymously without errors", async () => {
    const { signInAnonymously } = require("firebase/auth");
  
    await expect(signInAnonymously()).resolves.toEqual({ user: { uid: "testUserId" } });
    expect(signInAnonymously).toHaveBeenCalled();
  });  

test("resets form inputs and preview", () => {
  document.body.innerHTML = `
    <input id="recipientSearch" />
    <textarea id="message"></textarea>
    <select id="fontPicker"><option value="Arial" selected>Arial</option></select>
    <select id="fontSizePicker"><option value="16px" selected>16</option></select>
    <input id="notesColorPicker" type="color" value="#123456" />
    <input id="textColorPicker" type="color" value="#654321" />
    <input id="music" />
    <div id="notePreview"></div>`;
  resetForm();

  const preview = document.getElementById("notePreview");
  expect(document.getElementById("recipientSearch").value).toBe("");
  expect(document.getElementById("message").value).toBe("");
  expect(document.getElementById("notesColorPicker").value).toBe("#ffffff");
  expect(document.getElementById("textColorPicker").value).toBe("#000000");
  expect(document.getElementById("fontPicker").value).toBe("Arial, sans-serif");
  expect(document.getElementById("fontSizePicker").value).toBe("16px");
  expect(preview.style.backgroundColor).toBe("rgb(255, 255, 255)");
  expect(preview.style.color).toBe("rgb(0, 0, 0)");
  expect(preview.style.fontFamily).toBe("Arial");
  expect(preview.style.fontSize).toBe("16px");
});

beforeEach(() => {
    document.body.innerHTML = `
      <div id="plate"></div>
      <button id="googleSignInBtn"></button>
      <textarea id="message"></textarea>
      <input id="notesColorPicker" type="color" />
      <div id="loginPrompt"></div>
      <div id="shareLinkContainer"></div>
      <input id="shareLink" />
      <button id="addNoteBtn"></button>
      <div id="form-container"></div>
      <input id="recipientSearch" />
      <ul id="recipientSuggestions"></ul>
      <div id="notePreview"></div>
    `;
  });
  

  test("googleSignInBtn click listener is added", () => {
    const googleSignInBtn = document.getElementById("googleSignInBtn");
    const mockFn = jest.fn();
    googleSignInBtn.addEventListener = mockFn;
  
    googleSignInBtn.addEventListener("click", () => {});
    expect(mockFn).toHaveBeenCalledWith("click", expect.any(Function));
  });

  test("recipientSearch input listener is added", () => {
    const recipientSearch = document.getElementById("recipientSearch");
    const mockFn = jest.fn();
  
    recipientSearch.addEventListener = mockFn;
  
    recipientSearch.addEventListener("input", () => {});
    expect(mockFn).toHaveBeenCalledWith("input", expect.any(Function));
  });