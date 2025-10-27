import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { todoAPI, apiUtils } from '../services/api';
import toast from 'react-hot-toast';

const TodoContext = createContext();

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    starred: 'all',
    page: 1,
    limit: 20
  });

  // Transform MongoDB _id to id for frontend compatibility
  const transformTodo = (todo) => {
    if (!todo) return null;
    return {
      ...todo,
      id: todo._id || todo.id
    };
  };

  // Load todos with current filters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadTodos = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      
      const response = await todoAPI.getTodos(updatedFilters);
      const transformedTodos = response.data.data.todos.map(transformTodo);
      setTodos(transformedTodos);
      
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await todoAPI.getStats();
      setStats(response.data.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = apiUtils.handleError(error);
      console.error('Failed to load stats:', message);
      return { success: false, error: message };
    }
  }, []);

  // Create todo
  const createTodo = async (todoData) => {
    try {
      setLoading(true);
      const response = await todoAPI.createTodo(todoData);
      const newTodo = transformTodo(response.data.data);
      
      setTodos(prev => [newTodo, ...prev]);
      await loadStats(); // Refresh stats
      
      toast.success('Todo created successfully!');
      return { success: true, data: newTodo };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update todo
  const updateTodo = async (id, todoData) => {
    try {
      setLoading(true);
      const response = await todoAPI.updateTodo(id, todoData);
      const updatedTodo = transformTodo(response.data.data);
      
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      await loadStats(); // Refresh stats
      
      toast.success('Todo updated successfully!');
      return { success: true, data: updatedTodo };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo status
  const toggleTodo = async (id) => {
    try {
      const response = await todoAPI.toggleTodo(id);
      const updatedTodo = transformTodo(response.data.data);
      
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      await loadStats(); // Refresh stats
      
      toast.success('Todo status updated!');
      return { success: true, data: updatedTodo };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      setLoading(true);
      await todoAPI.deleteTodo(id);
      
      setTodos(prev => prev.filter(todo => todo.id !== id));
      await loadStats(); // Refresh stats
      
      toast.success('Todo deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Archive todo
  const archiveTodo = async (id) => {
    try {
      setLoading(true);
      await todoAPI.archiveTodo(id);
      
      setTodos(prev => prev.filter(todo => todo.id !== id));
      await loadStats(); // Refresh stats
      
      toast.success('Todo archived successfully!');
      return { success: true };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Add subtask
  const addSubtask = async (id, subtaskData) => {
    try {
      const response = await todoAPI.addSubtask(id, subtaskData);
      const updatedTodo = transformTodo(response.data.data);
      
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      toast.success('Subtask added successfully!');
      return { success: true, data: updatedTodo };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Toggle subtask
  const toggleSubtask = async (id, subtaskId) => {
    try {
      const response = await todoAPI.toggleSubtask(id, subtaskId);
      const updatedTodo = transformTodo(response.data.data);
      
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      return { success: true, data: updatedTodo };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Add comment
  const addComment = async (id, commentData) => {
    try {
      const response = await todoAPI.addComment(id, commentData);
      const updatedTodo = transformTodo(response.data.data);
      
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      toast.success('Comment added successfully!');
      return { success: true, data: updatedTodo };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Bulk operations
  const bulkOperation = async (operationData) => {
    try {
      setLoading(true);
      const response = await todoAPI.bulkOperation(operationData);
      
      // Reload todos and stats after bulk operation
      await loadTodos();
      await loadStats();
      
      toast.success('Bulk operation completed successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = apiUtils.handleError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Search todos
  const searchTodos = async (searchTerm) => {
    return await loadTodos({ search: searchTerm, page: 1 });
  };

  // Filter todos
  const filterTodos = async (newFilters) => {
    return await loadTodos({ ...newFilters, page: 1 });
  };

  // Load initial data - only run once on mount
  useEffect(() => {
    if (apiUtils.isAuthenticated()) {
      loadTodos();
      loadStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  const value = {
    todos,
    stats,
    loading,
    filters,
    loadTodos,
    loadStats,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    archiveTodo,
    addSubtask,
    toggleSubtask,
    addComment,
    bulkOperation,
    searchTodos,
    filterTodos,
    setFilters
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
