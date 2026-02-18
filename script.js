//-----------------------------------------
// Load tasks from localStorage
//-----------------------------------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

//-----------------------------------------
// Save tasks to localStorage
//-----------------------------------------
function saveTasks() {
  // Why: localStorage only stores strings, so we JSON.stringify
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//-----------------------------------------
// Render tasks into columns
//-----------------------------------------
function renderTasks() {
  // Why: prevent duplicates when re-rendering
  document.querySelectorAll(".taskList").forEach((list) => {
    list.innerHTML = "";
  });

  tasks.forEach((task) => {
    const taskEl = document.createElement("div");
    taskEl.classList.add("task");
    taskEl.setAttribute("data-id", String(task.id));

    // Why: your original code had broken quotes; this fixes it
    taskEl.innerHTML = `
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.description)}</p>
      <button class="editBtn" type="button">Edit</button>
      <button class="deleteBtn" type="button">Delete</button>
    `;

    const column = document.getElementById(task.status);
    if (column) column.appendChild(taskEl);
  });

  // Why: events need to be re-attached because we rebuilt the DOM
  enableDragAndDrop();
  enableDeleteButtons();
  enableEditButtons();
}

//-----------------------------------------
// Add Task buttons
//-----------------------------------------
document.querySelectorAll(".addTaskBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = prompt("Enter task title:");
    if (!title) return;

    const description = prompt("Enter task description:") || "";
    const status = btn.getAttribute("data-status");

    tasks.push({
      id: Date.now(),
      title,
      description,
      status,
    });

    saveTasks();
    renderTasks();
  });
});

//-----------------------------------------
// Drag and Drop
//-----------------------------------------
function enableDragAndDrop() {
  document.querySelectorAll(".task").forEach((taskEl) => {
    taskEl.setAttribute("draggable", "true");

    taskEl.addEventListener("dragstart", () => {
      // Why: we mark it so drop() can find it
      taskEl.classList.add("dragging");
    });

    taskEl.addEventListener("dragend", () => {
      // Why: cleanup after drop
      taskEl.classList.remove("dragging");
    });
  });

  document.querySelectorAll(".taskList").forEach((list) => {
    list.addEventListener("dragover", (e) => {
      // Why: required for drop to work
      e.preventDefault();
      list.classList.add("drag-over");
    });

    list.addEventListener("dragleave", () => {
      list.classList.remove("drag-over");
    });

    list.addEventListener("drop", () => {
      list.classList.remove("drag-over");

      // Why: dot = class selector
      const dragged = document.querySelector(".dragging");
      if (!dragged) return;

      const taskId = dragged.getAttribute("data-id");
      const newStatus = list.getAttribute("id");

      tasks = tasks.map((t) =>
        String(t.id) === String(taskId) ? { ...t, status: newStatus } : t,
      );

      saveTasks();
      renderTasks();
    });
  });
}

//-----------------------------------------
// Delete
//-----------------------------------------
function enableDeleteButtons() {
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".task");
      if (!card) return;

      const taskId = card.getAttribute("data-id");
      tasks = tasks.filter((t) => String(t.id) !== String(taskId));

      saveTasks();
      renderTasks();
    });
  });
}

//-----------------------------------------
// Edit
//-----------------------------------------
function enableEditButtons() {
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".task");
      if (!card) return;

      const taskId = card.getAttribute("data-id");
      const idx = tasks.findIndex((t) => String(t.id) === String(taskId));
      if (idx === -1) return;

      const current = tasks[idx];

      const newTitle = prompt("Edit title:", current.title);
      if (newTitle === null) return;

      const newDesc = prompt("Edit description:", current.description || "");
      if (newDesc === null) return;

      tasks[idx] = {
        ...current,
        title: newTitle.trim() || current.title,
        description: newDesc.trim(),
      };

      saveTasks();
      renderTasks();
    });
  });
}

//-----------------------------------------
// Small safety helper for innerHTML
//-----------------------------------------
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// First paint
renderTasks();

// ---------------------------
// Theme Toggle
// ---------------------------
const themeToggleBtn = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";

  applyTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
});

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);

  themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
}
