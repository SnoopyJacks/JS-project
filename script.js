//-----------------------------------------
// STEP 1: Load tasks from localStorage
//-----------------------------------------

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

//-----------------------------------------
// STEP 2: Save tasks back to localStorage
//-----------------------------------------

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//-----------------------------------------
// STEP 3: Display all Tasks
//-----------------------------------------

function renderTasks() {
  //Clear task list before re-adding tasks.
  document.querySelectorAll(".taskList").forEach((list) => {
    list.innerHTML = "";
  });

  //Loop through all saved tasks
  tasks.forEach((task) => {
    //create new div for the task card
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    //Give each task ID attribute
    taskElement.setAttribute("data-id", task.id);

    // Add HTML to card
    taskElement.innerHTML = `
    <h4>${task.title}</h4>
    <p>${task.description}</p>
    <button class="editBtn>Edit</button>
    <button class="deleteBtn>Delete</button>
    `;

    document.getElementById(task.status).appendChild(taskElement);
  });

  enableDragAndDrop();
  enableDeleteButtons();
  enableEditButtons();
}

//-----------------------------------------
// STEP 4: Add Task Button Clicks
//-----------------------------------------

//Select all "Add Task" buttons
const addButtons = document.querySelectorAll(".addTaskBtn");

//Add click listener for each button
addButtons.forEach((button) => {
  button.addEventListener("click", function () {
    //Ask user for task title
    const title = prompt("Enter task title:");
    if (!title) return; // if user cancels, stop

    //Ask user for description
    const description = prompt("Enter task description") || "";

    // Determine the column the button belongs to
    const status = button.getAttribute("data-status");

    // Create a new task object
    const newTask = {
      id: Date.now(),
      title: title,
      description: description,
      status: status,
    };

    //Add new task to list
    tasks.push(newTask);

    //Save updated task list
    saveTasks();

    //Reload so new task appears
    renderTasks();
  });
});

//-----------------------------------------
// STEP 5: Initial render when page loads
//-----------------------------------------
renderTasks();

//-----------------------------------------
// Drag and Drop
//-----------------------------------------

//Add drag events to every task
function enableDragAndDrop() {
  const taskElements = document.querySelectorAll(".task");

  taskElements.forEach((task) => {
    task.setAttribute("draggable", "true");

    //Dragging Starts
    task.addEventListener("dragstart", function () {
      task.classList.add("dragging");
    });

    //Dragging Ends
    task.addEventListener("dragstart", function () {
      task.classList.remove("dragging");
    });
  });

  //Add drop support to tasklist columns
  const taskLists = document.querySelectorAll(".taskList");

  //when item goes over column
  taskLists.forEach((list) => {
    list.addEventListener("dragover", function (event) {
      event.preventDefault(); //allows dropping
      list.classList.add("drag-over");
    });

    //Item leaves column
    list.addEventListener("dragleave", function () {
      list.classList.remove("drag-over");
    });

    // Task Dropped
    list.addEventListener("drop", function () {
      const draggedTask = document.querySelector("dragging");
      const taskId = draggedTask.getAttribute("data-id");
      const newStatus = list.getAttribute("id");

      // Update task array
      tasks = tasks.map((task) =>
        task.id == taskId ? { ...task, status: newStatus } : task,
      );

      saveTasks();
      renderTasks();
    });
  });
}

//-----------------------------------------
// DELETE TASK
//-----------------------------------------
function enableDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".deleteBtn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const taskElement = btn.parentElement;
      const taskId = taskElement.getAttribute("data-id");

      //Remove from array
      tasks = tasks.filter((task) => task.id != taskId);

      saveTasks();
      renderTasks();
    });
  });
}

//-----------------------------------------
// EDIT TASK
//-----------------------------------------
function enableEditButtons() {
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const taskElement = btn.closest(".task");
      if (!taskElement) return;

      const taskId = taskElement.getAttribute("data-id");

      //Find task to update
      const taskIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
      if (taskIndex === -1) return;

      const currentTask = tasks[taskIndex];

      //Prompts prefill for editing
      const newTitle = prompt("Edit task title:", currentTask.title);
      if (newTitle === null) return; //cancel is pressed

      const newDescription = prompt(
        "Edit task description:",
        currentTask.description || "",
      );
      if (newDescription === null) return;

      //Update task
      tasks[taskIndex] = {
        ...currentTask,
        title: newTitle.trim() || currentTask.title,
        description: newDescription.trim(),
      };

      saveTasks();
      renderTasks();
    });
  });
}

//-----------------------------------------
// Helper: stops user text from breaking your HTML
//-----------------------------------------
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
