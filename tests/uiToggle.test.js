import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

jest.mock('../src/firebase.js', () => ({
  auth: {},
  database: {},
  ref: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  onValue: jest.fn(),
  signInAnonymously: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

describe('UI toggling and responsiveness', () => {
  let toggleFormBtn, formContainer, notePreview, togglePreviewBtn, updatePreview;

  beforeEach(async () => {
    document.body.innerHTML = `
      <button id="toggleFormBtn"></button>
      <div id="form-container" class="hidden"></div>
      <button id="togglePreviewBtn"></button>
      <div id="notePreview" class="hidden"></div>
      <input id="recipientSearch" />
      <textarea id="message"></textarea>
      <input id="notesColorPicker" type="color" value="#ffffff" />
      <input id="textColorPicker" type="color" value="#000000" />
      <select id="fontPicker"><option value="Arial">Arial</option></select>
      <select id="fontSizePicker"><option value="16px">16px</option></select>`;
    jest.resetModules();
    const mod = await import('../src/app.js');
    updatePreview = mod.updatePreview;
    toggleFormBtn = document.getElementById('toggleFormBtn');
    formContainer = document.getElementById('form-container');
    notePreview = document.getElementById('notePreview');
    togglePreviewBtn = document.getElementById('togglePreviewBtn');
  });

  test('toggleFormBtn toggles form visibility', () => {
    toggleFormBtn.click();
    expect(formContainer.classList.contains('hidden')).toBe(false);
    toggleFormBtn.click();
    expect(formContainer.classList.contains('hidden')).toBe(true);
  });

  test('togglePreviewBtn toggles preview visibility', () => {
    togglePreviewBtn.click();
    expect(notePreview.classList.contains('hidden')).toBe(false);
    togglePreviewBtn.click();
    expect(notePreview.classList.contains('hidden')).toBe(true);
  });

  test('updatePreview triggers fade animation', () => {
    updatePreview();
    expect(notePreview.classList.contains('fade-anim')).toBe(true);
    notePreview.classList.remove('fade-anim');
    updatePreview();
    expect(notePreview.classList.contains('fade-anim')).toBe(true);
  });
});

describe('CSS responsiveness rules', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../src/styles/styles.css'), 'utf8');

  test('grid layout defined for plate above 768px', () => {
    expect(css).toMatch(/@media \(min-width: 768px\)[\s\S]*#plate/);
    expect(css).toMatch(/grid-template-columns: repeat\(2, 1fr\)/);
  });

  test('fade animation timing is 0.3s', () => {
    expect(css).toMatch(/\.fade-anim\s*{[^}]*animation: fade 0\.3s/);
    expect(css).toMatch(/@keyframes fade/);
  });
});
