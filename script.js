//-----------------------------------------
// Load tasks from localStorage
//-----------------------------------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

//-----------------------------------------
// Save tasks to localStorage
//-----------------------------------------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//-----------------------------------------
// Toast helper
//-----------------------------------------
const toastEl = document.getElementById("toast");
let toastTimer = null;

function toast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1400);
}

//-----------------------------------------
// Update counts
//-----------------------------------------
function updateCounts() {
  const counts = { todo: 0, "in-progress": 0, done: 0 };
  for (const t of tasks) {
    if (counts[t.status] !== undefined) counts[t.status]++;
  }

  const todo = document.getElementById("count-todo");
  const prog = document.getElementById("count-in-progress");
  const done = document.getElementById("count-done");

  if (todo) todo.textContent = String(counts.todo);
  if (prog) prog.textContent = String(counts["in-progress"]);
  if (done) done.textContent = String(counts.done);
}

//-----------------------------------------
// Render tasks into columns
//-----------------------------------------
function renderTasks({ animateNewId = null } = {}) {
  document.querySelectorAll(".taskList").forEach((list) => {
    list.innerHTML = "";
  });

  tasks.forEach((task) => {
    const taskEl = document.createElement("div");
    taskEl.classList.add("task");
    taskEl.setAttribute("data-id", String(task.id));

    taskEl.innerHTML = `
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.description)}</p>
      <button class="editBtn" type="button">Edit</button>
      <button class="deleteBtn" type="button">Delete</button>
    `;

    const column = document.getElementById(task.status);
    if (column) column.appendChild(taskEl);

    // "Pop" animation when adding a new task
    if (animateNewId && String(task.id) === String(animateNewId)) {
      taskEl.animate(
        [
          { transform: "translateY(8px) scale(0.98)", opacity: 0.2 },
          { transform: "translateY(0) scale(1)", opacity: 1 },
        ],
        { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    }
  });

  updateCounts();

  // events need to be re-attached because we rebuilt the DOM
  enableDragAndDrop();
  enableDeleteButtons();
  enableEditButtons();
  enableRipples();
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

    const newTask = {
      id: Date.now(),
      title,
      description,
      status,
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks({ animateNewId: newTask.id });
    toast("Task added ✨");
  });
});

//-----------------------------------------
// Drag and Drop
//-----------------------------------------
function enableDragAndDrop() {
  document.querySelectorAll(".task").forEach((taskEl) => {
    taskEl.setAttribute("draggable", "true");

    taskEl.addEventListener("dragstart", () => {
      taskEl.classList.add("dragging");
    });

    taskEl.addEventListener("dragend", () => {
      taskEl.classList.remove("dragging");
    });
  });

  document.querySelectorAll(".taskList").forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      list.classList.add("drag-over");
    });

    list.addEventListener("dragleave", () => {
      list.classList.remove("drag-over");
    });

    list.addEventListener("drop", () => {
      list.classList.remove("drag-over");

      const dragged = document.querySelector(".dragging");
      if (!dragged) return;

      const taskId = dragged.getAttribute("data-id");
      const newStatus = list.getAttribute("id");

      const before = tasks.find((t) => String(t.id) === String(taskId))?.status;

      tasks = tasks.map((t) =>
        String(t.id) === String(taskId) ? { ...t, status: newStatus } : t,
      );

      saveTasks();
      renderTasks();

      if (before !== newStatus) toast("Moved ✅");
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

      // little exit animation
      card.animate(
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: "translateY(10px)", opacity: 0 },
        ],
        { duration: 180, easing: "ease-out" },
      ).onfinish = () => {
        tasks = tasks.filter((t) => String(t.id) !== String(taskId));
        saveTasks();
        renderTasks();
        toast("Deleted 🗑️");
      };
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
      toast("Updated ✍️");
    });
  });
}

//-----------------------------------------
// Button ripple effect (icons/animations)
//-----------------------------------------
function enableRipples() {
  // Add ripples to most buttons
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // avoid double ripples if listener attached multiple times
      if (btn.__rippleBound) return;
    });
  });

  document.querySelectorAll("button").forEach((btn) => {
    if (btn.__rippleBound) return;

    btn.__rippleBound = true;

    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
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

// ---------------------------
// Theme Toggle
// ---------------------------
const themeToggleBtn = document.getElementById("themeToggle");

if (themeToggleBtn) {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    toast(next === "dark" ? "Dark mode 🌙" : "Light mode ☀️");
  });
} else {
  console.error('Theme toggle button not found. Check id="themeToggle".');
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// First paint
renderTasks();
enableRipples();
