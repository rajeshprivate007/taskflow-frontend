import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  User,
  BarChart3,
  Target,
  Zap,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { todos, stats, loadTodos, loadStats } = useTodos();
  const [recentTasks, setRecentTasks] = useState([]);
  const [productivityData, setProductivityData] = useState([]);

  useEffect(() => {
    // Load initial data
    loadTodos({ limit: 5 });
    loadStats();
  }, [loadTodos, loadStats]);

  useEffect(() => {
    // Set recent tasks from todos
    setRecentTasks(todos.slice(0, 5));
    
    // Calculate weekly productivity from todos
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      
      // Count tasks completed on this day
      const tasksCompletedOnDay = todos.filter(todo => {
        if (todo.status === 'completed' && todo.updatedAt) {
          const todoDate = new Date(todo.updatedAt);
          return todoDate.toDateString() === date.toDateString();
        }
        return false;
      }).length;
      
      last7Days.push({ day: dayName, tasks: tasksCompletedOnDay });
    }
    
    setProductivityData(last7Days);
  }, [todos]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const StatCard = ({ icon, title, value, change, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-secondary-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-primary-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const TaskItem = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          task.priority === 'high' ? 'bg-red-500' : 
          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
        <div>
          <p className={`font-medium ${task.completed ? 'line-through text-secondary-500' : 'text-primary-900'}`}>
            {task.title}
          </p>
          <p className="text-sm text-secondary-500">Due: {task.dueDate}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {task.completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Clock className="w-5 h-5 text-secondary-400" />
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-900">TaskFlow</span>
            </div>
            
        <div className="flex items-center space-x-4">
          <button className="p-2 text-secondary-600 hover:text-primary-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-secondary-600 hover:text-primary-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/settings" className="p-2 text-secondary-600 hover:text-primary-600 transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-primary-900">{user?.name}</p>
              <p className="text-xs text-secondary-500">{user?.email}</p>
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Welcome back!</h1>
          <p className="text-secondary-600">Here's what's happening with your tasks today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            title="Completed Tasks"
            value={stats.completed || 0}
            change={12}
            color="bg-green-100"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            title="Pending Tasks"
            value={stats.pending || 0}
            change={-5}
            color="bg-blue-100"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            title="Overdue Tasks"
            value={stats.overdue || 0}
            change={-2}
            color="bg-red-100"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            title="Completion Rate"
            value={`${completionRate}%`}
            change={8}
            color="bg-purple-100"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary-900">Recent Tasks</h2>
                <Link 
                  to="/todos" 
                  className="btn btn-primary px-4 py-2 rounded-full text-sm flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  to="/todos" 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all tasks →
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/todos" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-primary-600" />
                  <span className="text-primary-900">Add New Task</span>
                </Link>
                <Link to="/todos?filter=all" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors w-full text-left">
                  <Filter className="w-5 h-5 text-primary-600" />
                  <span className="text-primary-900">Filter Tasks</span>
                </Link>
                <Link to="/todos" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-colors w-full text-left">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="text-primary-900">View Calendar</span>
                </Link>
              </div>
            </motion.div>

            {/* Productivity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-primary-900 mb-4">This Week's Productivity</h3>
              <div className="space-y-4">
                {productivityData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600">{item.day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-secondary-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(item.tasks / 15) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-primary-900 w-8">{item.tasks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Today's Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-secondary-600">Complete 5 high-priority tasks</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-secondary-600">Maintain 80% completion rate</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-secondary-600">Review weekly analytics</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

