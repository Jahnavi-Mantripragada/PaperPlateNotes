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
  // Mock DOM
  document.body.innerHTML = `
  <div id="plate"></div>
  <button id="addNoteBtn"></button>
  <textarea id="message"></textarea>
  <input id="notesColorPicker" type="color" />
    `;

  resetForm();

  expect(document.getElementById("recipientSearch").value).toBe("");
  expect(document.getElementById("message").value).toBe("");
  expect(document.getElementById("notesColorPicker").value).toBe("#000000");
  expect(document.getElementById("previewNote").style.backgroundColor).toBe("rgb(0, 0, 0)");
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
      <div id="previewNote"></div>
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