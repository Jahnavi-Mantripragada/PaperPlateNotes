import { jest } from '@jest/globals';

// Mock Firebase modules used in app.js
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

describe('Live preview functionality', () => {
  let updatePreview, resetForm;

  beforeEach(async () => {
    document.body.innerHTML = `
      <input id="recipientSearch" />
      <textarea id="message"></textarea>
      <select id="fontPicker">
        <option value="Arial, sans-serif">Arial</option>
        <option value="Courier">Courier</option>
      </select>
      <select id="fontSizePicker">
        <option value="16px">16</option>
        <option value="24px">24</option>
      </select>
      <input id="notesColorPicker" type="color" value="#ffffff" />
      <input id="textColorPicker" type="color" value="#000000" />
      <input id="music" />
      <div id="notePreview" style="display:block;">
        <p id="previewRecipient"></p>
        <p id="previewMessage"></p>
      </div>`;
    jest.resetModules();
    const mod = await import('../src/app.js');
    updatePreview = mod.updatePreview;
    resetForm = mod.resetForm;
  });

  test('updatePreview reflects user inputs', () => {
    document.getElementById('recipientSearch').value = 'Alice';
    document.getElementById('message').value = 'Hello world';
    document.getElementById('fontPicker').value = 'Courier';
    document.getElementById('fontSizePicker').value = '24px';
    document.getElementById('notesColorPicker').value = '#ff0000';
    document.getElementById('textColorPicker').value = '#00ff00';

    updatePreview();

    const preview = document.getElementById('notePreview');
    expect(preview.style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(preview.style.color).toBe('rgb(0, 255, 0)');
    expect(preview.style.fontFamily).toBe('Courier');
    expect(preview.style.fontSize).toBe('24px');
    expect(document.getElementById('previewRecipient').textContent).toBe('Alice');
    expect(document.getElementById('previewMessage').textContent).toBe('Hello world');
  });

  test('resetForm restores defaults', () => {
    document.getElementById('recipientSearch').value = 'Bob';
    document.getElementById('message').value = 'Hi';
    document.getElementById('fontPicker').value = 'Courier';
    document.getElementById('fontSizePicker').value = '24px';
    document.getElementById('notesColorPicker').value = '#123456';
    document.getElementById('textColorPicker').value = '#654321';
    updatePreview();

    resetForm();

    const preview = document.getElementById('notePreview');
    expect(preview.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(preview.style.color).toBe('rgb(0, 0, 0)');
    expect(preview.style.fontFamily).toBe('Arial');
    expect(preview.style.fontSize).toBe('16px');
    expect(document.getElementById('previewRecipient').textContent).toBe("Recipient's Name");
    expect(document.getElementById('previewMessage').textContent).toBe('Your message will appear here.');
    expect(document.getElementById('fontPicker').value).toBe('Arial, sans-serif');
    expect(document.getElementById('fontSizePicker').value).toBe('16px');
    expect(document.getElementById('notesColorPicker').value).toBe('#ffffff');
    expect(document.getElementById('textColorPicker').value).toBe('#000000');
  });
});
