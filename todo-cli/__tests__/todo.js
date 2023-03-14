const todoList = require("../todo");

const {
  all,
  markAsComplete,
  add,
  overdue,
  dueToday,
  dueLater,
  today,
  tomorrow,
  yesterday,
} = todoList();

describe("ToDo test Suite", () => {
  beforeAll(() => {
    add({
      title: "Submit assignment",
      dueDate: yesterday,
      completed: false,
    });
    add({
      title: "Pay rent",
      dueDate: today,
      completed: true,
    });
  });
  test("Should add new todo", () => {
    let count = all.length;
    add({
      title: "new todo",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-IN"),
    });
    expect(all.length).toBe(count + 1);
  });
  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
  test("Should Retrieves overdue items", () => {
    let count = overdue().length;
    add({
      title: "Pay electric bill",
      dueDate: yesterday,
      completed: false,
    });
    expect(overdue().length).toBe(count + 1);
  });
  test("Should Retrieves due today items", () => {
    let count = dueToday().length;
    add({
      title: "Pay electric bill",
      dueDate: today,
      completed: false,
    });
    expect(dueToday().length).toBe(count + 1);
  });
  test("Should Retrieves due later items", () => {
    let count = dueLater().length;
    add({
      title: "Pay electric bill",
      dueDate: tomorrow,
      completed: false,
    });
    expect(dueLater().length).toBe(count + 1);
  });
});
