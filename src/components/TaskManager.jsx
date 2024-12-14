import React, { useState, useEffect } from 'react';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // On initial render, load tasks from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage every time they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddTask = (title, description, dueDate, priority) => {
    const newTask = {
      id: Date.now(),
      title,
      description,
      dueDate,
      priority,
      completed: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setShowAddTask(false);
  };

  const toggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (id, updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? updatedTask : task))
    );
    setEditingTask(null);
  };

  // Filter tasks based on completion and priority
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Completed' && !task.completed) return false;
    if (filter === 'Pending' && task.completed) return false;
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div>
      <header className="task-manager-header">
        <h1>Task Manager</h1>
        <div className="header-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <button onClick={() => setShowAddTask(true)} className="add-task-btn">
            Add Task
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : 'pending'}`}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Due: {task.dueDate || 'No due date'}</p>
              <p>Priority: {task.priority || 'No priority'}</p>
              <button 
                onClick={() => toggleComplete(task.id)} 
                className="btn completed-btn"
              >
                {task.completed ? 'Mark as Pending' : 'Mark as Complete'}
              </button>
              <button 
                onClick={() => setEditingTask(task)} 
                className="btn edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => deleteTask(task.id)} 
                className="btn delete-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>

      {showAddTask && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Add Task</h2>
            <AddTaskForm onAddTask={handleAddTask} onClose={() => setShowAddTask(false)} />
          </div>
        </div>
      )}

      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Edit Task</h2>
            <EditTaskForm
              task={editingTask}
              onEditTask={handleEditTask}
              onClose={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}
    </div>
  );

  function handleLogout() {
    localStorage.removeItem('tasks');
    setTasks([]);
  }
};

const AddTaskForm = ({ onAddTask, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(title, description, dueDate, priority);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Due Date:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label>Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Select Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <button type="submit">Add Task</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
};

const EditTaskForm = ({ task, onEditTask, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [priority, setPriority] = useState(task.priority);

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditTask(task.id, {
      ...task,
      title,
      description,
      dueDate,
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-task-form">
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Due Date:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label>Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <button type="submit">Save Changes</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
};

export default TaskManager;
