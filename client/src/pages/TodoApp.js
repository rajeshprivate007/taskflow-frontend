import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  Flag, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Eye,
  EyeOff,
  LogOut,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Task Item Component
const TaskItem = ({ task, onToggle, onEdit, onDelete, onStatusChange }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`card p-4 mb-3 border-l-4 ${getPriorityColor(task.priority)} shadow-sm transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.status === 'completed' 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-green-500'
          }`}
          >
            {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center flex-wrap gap-2 mt-3">
              <div className="flex items-center space-x-1">
                {getPriorityIcon(task.priority)}
                <span className="text-xs font-medium capitalize">{task.priority}</span>
              </div>
              
              {/* Status Badge */}
              <select
                value={task.status || 'pending'}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 ${getStatusColor(task.status || 'pending')}`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              {task.dueDate && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(task.dueDate).toLocaleDateString()}
                    {task.dueTime && ` at ${task.dueTime}`}
                  </span>
                </div>
              )}
              
              {task.category && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Tag className="w-3 h-3" />
                  <span>{task.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {task.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
          
          <div className="flex items-center space-x-2">
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-secondary-400" />
            )}
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              className={`p-1 hover:bg-gray-100 rounded transition-colors ${showMenu ? 'bg-gray-100' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 animate-fade-in">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(task.id);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Task Form Component
const TaskForm = ({ task, onSave, onCancel }) => {
  const [categories] = useState(['Work', 'Personal', 'Development', 'Health', 'Finance', 'Other']);
  
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    dueDate: formatDateForInput(task?.dueDate) || '',
    dueTime: task?.dueTime || '',
    category: task?.category || '',
    starred: task?.starred || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    onSave({
      ...task,
      ...formData,
      id: task?.id || Date.now(),
      completed: task?.completed || false,
      createdAt: task?.createdAt || new Date().toISOString()
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h2 className="text-xl font-semibold mb-4">
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Enter task description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="starred"
              checked={formData.starred}
              onChange={(e) => setFormData({ ...formData, starred: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="starred" className="ml-2 block text-sm text-gray-700">
              Mark as important
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="btn btn-primary px-6 py-2 rounded-md"
            >
              {task ? 'Update Task' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary px-6 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const TodoApp = () => {
  const { user, logout } = useAuth();
  const { 
    todos, 
    stats, 
    loading, 
    loadTodos, 
    createTodo, 
    updateTodo, 
    toggleTodo, 
    deleteTodo,
    searchTodos,
    filterTodos
  } = useTodos();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Sort todos by due date/time (latest first), then by status (incomplete first, completed last)
  const sortedTodos = useCallback(() => {
    return [...todos].sort((a, b) => {
      // First, sort by completion status (incomplete first)
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // Within each group (incomplete/completed), sort by due date and time
      const getDateTime = (todo) => {
        if (!todo.dueDate) return new Date(8640000000000000); // Max date for items without due date (last)
        
        let dateTime = new Date(todo.dueDate);
        
        // If dueTime exists, combine it with the date
        if (todo.dueTime) {
          const [hours, minutes] = todo.dueTime.split(':');
          dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }
        
        return dateTime;
      };

      const dateA = getDateTime(a);
      const dateB = getDateTime(b);

      // Sort by date/time ascending (earliest due date first)
      return dateA - dateB;
    });
  }, [todos]);

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchTodos(term);
    } else {
      await loadTodos();
    }
  };

  // Handle filter changes
  const handleFilterChange = async (newFilters) => {
    await filterTodos(newFilters);
  };

  const handleToggle = async (taskId) => {
    await toggleTodo(taskId);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    await deleteTodo(taskId);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTodo(taskId, { status: newStatus });
  };

  const handleSave = async (taskData) => {
    if (editingTask) {
      await updateTodo(editingTask.id, taskData);
    } else {
      await createTodo(taskData);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Filter todos based on showCompleted and apply sorting
  const displayedTodos = showCompleted 
    ? sortedTodos() 
    : sortedTodos().filter(todo => todo.status !== 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-900">TaskFlow</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-secondary-600 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/settings" 
                className="text-secondary-600 hover:text-primary-600 transition-colors"
              >
                Settings
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-primary-900">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-secondary-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 text-center"
          >
            <div className="text-2xl font-bold text-primary-600">{stats.total || 0}</div>
            <div className="text-sm text-secondary-600">Total Tasks</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4 text-center"
          >
            <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
            <div className="text-sm text-secondary-600">Completed</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 text-center"
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
            <div className="text-sm text-secondary-600">Pending</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-4 text-center"
          >
            <div className="text-2xl font-bold text-red-600">{stats.overdue || 0}</div>
            <div className="text-sm text-secondary-600">Overdue</div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterPriority}
                onChange={(e) => {
                  setFilterPriority(e.target.value);
                  handleFilterChange({ priority: e.target.value });
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  handleFilterChange({ category: e.target.value });
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Development">Development</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  showCompleted ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Show Completed</span>
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary px-6 py-2 rounded-md flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading tasks...</p>
            </div>
          ) : displayedTodos.length > 0 ? (
            displayedTodos.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No tasks found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterPriority !== 'all' || filterCategory !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding your first task'
                }
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary px-6 py-2 rounded-md"
              >
                Add Your First Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            task={editingTask}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoApp;

