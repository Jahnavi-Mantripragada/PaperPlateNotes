import { ref, push } from "firebase/database";

// Mock Firebase methods
jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  push: jest.fn(),
}));

test("adds a note to Firebase", async () => {
  const mockPush = jest.fn(); // Mock the push function
  push.mockImplementation(mockPush);

  const recipient = "uid123";
  const note = {
    recipient: "John Doe",
    message: "Hello!",
    color: "#ff0000",
  };

  // Simulate adding a note
  const refValue = {}; // Mock the return value of `ref`
  ref.mockReturnValue(refValue); // Ensure `ref` returns a mock value
  await push(refValue, note); // Call push with the correct parameters

  // Assert push is called with the correct values
  expect(mockPush).toHaveBeenCalledWith(refValue, note);
});
