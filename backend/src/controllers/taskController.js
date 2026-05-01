const taskService = require("../services/taskService");

async function getTasks(req, res, next) {
  try {
    const tasks = await taskService.listTasks(req.user.uid);
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
}

async function postTask(req, res, next) {
  try {
    const { title, completed } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required and must be a string" });
    }

    const newTask = await taskService.createTask(req.user.uid, { title, completed });
    return res.status(201).json({ data: newTask });
  } catch (error) {
    return next(error);
  }
}

async function patchTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (title !== undefined && typeof title !== "string") {
      return res.status(400).json({ error: "title must be a string" });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }

    const updatedTask = await taskService.updateTask(req.user.uid, id, { title, completed });

    if (!updatedTask) {
      return res.status(404).json({ error: "task not found" });
    }

    return res.status(200).json({ data: updatedTask });
  } catch (error) {
    return next(error);
  }
}

async function removeTask(req, res, next) {
  try {
    const deleted = await taskService.deleteTask(req.user.uid, req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "task not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTasks,
  postTask,
  patchTask,
  removeTask,
};
