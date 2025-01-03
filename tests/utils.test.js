import { isValidURL } from "../src/app.js";

test("validates a correct URL", () => {
  expect(isValidURL("https://example.com")).toBe(true);
});

test("rejects an incorrect URL", () => {
  expect(isValidURL("not-a-url")).toBe(false);
});
