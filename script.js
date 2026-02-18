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
    `;

    //Find correct column to place task
    const columnList = document.getElementById(task.status);
    columnList.appendChild(taskElement);
  });
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
function enableDragAndDrop () {
  cont taskElements = document.querySelectorAll(".task");

  taskElements.forEach(task => {
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
}
