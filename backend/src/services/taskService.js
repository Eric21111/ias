const { db } = require("../config/firebase");

const TASKS_COLLECTION = "tasks";

async function listTasks(ownerUid) {
  const snapshot = await db
    .collection(TASKS_COLLECTION)
    .where("ownerUid", "==", ownerUid)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createTask(ownerUid, payload) {
  const now = new Date().toISOString();
  const docRef = await db.collection(TASKS_COLLECTION).add({
    ownerUid,
    title: payload.title,
    completed: Boolean(payload.completed),
    createdAt: now,
    updatedAt: now,
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateTask(ownerUid, id, payload) {
  const docRef = db.collection(TASKS_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    return null;
  }

  if (existing.data().ownerUid !== ownerUid) {
    return null;
  }

  const updates = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof payload.title === "string") {
    updates.title = payload.title;
  }

  if (typeof payload.completed === "boolean") {
    updates.completed = payload.completed;
  }

  await docRef.update(updates);

  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
}

async function deleteTask(ownerUid, id) {
  const docRef = db.collection(TASKS_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    return false;
  }

  if (existing.data().ownerUid !== ownerUid) {
    return false;
  }

  await docRef.delete();
  return true;
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};
