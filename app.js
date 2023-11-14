const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log(`Server Is Starting @3000`));
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//GET TODO API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  if (status !== undefined) {
    const getTodoQuery = `
    SELECT 
         * 
    FROM 
        todo
    WHERE 
        status LIKE "${status}"; `;
    const todoList = await db.all(getTodoQuery);
    response.send(todoList);
  } else if (priority !== undefined) {
    const getTodoQuery = `
    SELECT 
         * 
    FROM 
        todo
    WHERE 
        priority LIKE "${priority}"; `;
    const todoList = await db.all(getTodoQuery);
    response.send(todoList);
  } else if (status !== undefined && priority !== undefined) {
    const getTodoQuery = `
    SELECT 
         * 
    FROM 
        todo
    WHERE 
        status LIKE "${status}"
        AND priority LIKE "${priority}"; `;
    const todoList = await db.all(getTodoQuery);
    response.send(todoList);
  } else {
    const getTodoQuery = `
    SELECT 
         * 
    FROM 
        todo
    WHERE 
        todo LIKE "%${search_q}%"; `;
    const todoList = await db.all(getTodoQuery);
    response.send(todoList);
  }
});
//Get Specific Todo API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT 
         * 
    FROM 
        todo
    WHERE 
        id=${todoId}; `;
  const todoList = await db.get(getTodoQuery);
  response.send(todoList);
});
//Create Todo API 3
app.post("/todos/", async (request, response) => {
  const todoItem = request.body;
  const { id, todo, priority, status } = todoItem;
  const addTodoQuery = `
      INSERT INTO todo (id,todo,priority,status)
      VALUES(
          ${id},
          "${todo}",
          "${priority}",
          "${status}"
      );`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});
//Update Todo API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT 
         * 
    FROM 
        todo
    WHERE 
        id=${todoId}; `;
  const todoList = await db.get(getTodoQuery);
  const { status, priority, todo } = request.body;
  if (status !== undefined) {
    const updateQuery = `
          UPDATE 
              todo
          SET
            status="${status}"
          WHERE 
             id=${todoId};`;
    await db.run(updateQuery);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const updateQuery = `
          UPDATE 
              todo
          SET
            priority="${priority}"
          WHERE 
             id=${todoId};`;
    await db.run(updateQuery);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const updateQuery = `
          UPDATE 
              todo
          SET
            todo="${todo}"
          WHERE 
             id=${todoId};`;
    await db.run(updateQuery);
    response.send("Todo Updated");
  }
});
//Delete Todo API 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
      DELETE FROM 
         todo
      WHERE 
         id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
