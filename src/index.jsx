// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/
// Nama File: index.jsx

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
// Impor './App', './contexts/DataContext', dan './index.css' dihapus karena kita akan gabungkan kodenya di sini.

// --- Definisi Context ---
// Mendefinisikan context yang akan digunakan komponen untuk berbagi data.
const DataContext = createContext(null);

/**
 * Fungsi reducer menangani transisi state untuk daftar todo.
 * @param {Array} state - State saat ini (daftar todos).
 * @param {object} action - Aksi yang sedang dilakukan.
 * @returns {Array} State yang baru.
 */
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      if (!action.payload || typeof action.payload !== 'string' || action.payload.trim() === '') {
        return state; // Jangan tambahkan todo kosong
      }
      return [
        ...state,
        { id: Date.now(), text: action.payload, completed: false },
      ];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case 'REMOVE_TODO':
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

/**
 * Fungsi initializer untuk reducer.
 * Mencoba memuat daftar todo dari localStorage.
 * @param {Array} initialValue - Nilai awal default (array kosong).
 * @returns {Array} Todos yang tersimpan atau nilai awal.
 */
const initializer = (initialValue = []) => {
  try {
    const storedTodos = localStorage.getItem('todos');
    // Jika ada todos tersimpan, parse. Jika tidak, kembalikan nilai awal.
    return storedTodos ? JSON.parse(storedTodos) : initialValue;
  } catch (error) {
    console.error("Gagal mem-parse todos dari localStorage", error);
    // Jika parse gagal, kembalikan nilai awal.
    return initialValue;
  }
};

/**
 * Komponen DataProvider membungkus bagian dari aplikasi yang perlu
 * akses ke state daftar todo yang dibagikan.
 * @param {object} props - Props komponen, termasuk children.
 */
function DataProvider({ children }) {
  // Gunakan fungsi initializer sebagai argumen ketiga useReducer
  // Ini memuat state awal dari localStorage
  const [todos, dispatch] = useReducer(todoReducer, [], initializer);

  // Tambahkan hook useEffect untuk menyimpan todos ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error("Gagal menyimpan todos ke localStorage", error);
    }
  }, [todos]); // Efek ini berjalan setiap kali state 'todos' berubah
  
  // Prop 'value' adalah apa yang akan diterima oleh semua komponen konsumen.
  const value = { todos, dispatch };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook kustom untuk mempermudah akses data context.
 * Akan melempar error jika digunakan di luar DataProvider.
 * @returns {object} Nilai context { todos, dispatch }.
 */
function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData harus digunakan di dalam DataProvider');
  }
  return context;
}

// --- Komponen ---

/**
 * Komponen untuk menambahkan item todo baru.
 */
function AddTodoForm() {
  const [text, setText] = useState('');
  const { dispatch } = useData(); // Dapatkan fungsi dispatch dari context

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch({ type: 'ADD_TODO', payload: text });
      setText(''); // Kosongkan input setelah ditambahkan
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Apa yang perlu dilakukan?"
          className="flex-grow min-w-0 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
        >
          Add
        </button>
      </div>
    </form>
  );
}

/**
 * Komponen untuk menampilkan satu item todo.
 * @param {object} props - Props komponen.
 * @param {object} props.todo - Item todo yang akan ditampilkan.
 */
function TodoItem({ todo }) {
  const { dispatch } = useData(); // Dapatkan dispatch dari context

  return (
    <li className="flex items-center justify-between p-4 mb-2 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span
          className={`ml-3 text-lg ${
            todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => dispatch({ type: 'REMOVE_TODO', payload: todo.id })}
        className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Remove
      </button>
    </li>
  );
}

/**
 * Komponen untuk menampilkan daftar item todo.
 */
function TodoList() {
  const { todos } = useData(); // Dapatkan todos dari context

  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
        Belum ada tugas. Tambahkan satu di atas!
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

/**
 * Komponen App utama.
 * Ini adalah akar dari aplikasi React kita.
 */
function App() {
  return (
    // Kita tidak perlu membungkus DataProvider di sini lagi
    // karena itu sudah dilakukan di ReactDOM.render
    <div className="antialiased text-gray-900 bg-gray-100 font-inter">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
              My Todo List
            </h1>
            <AddTodoForm />
            <TodoList />
          </div>
        </div>
      </div>
    </div>
  );
}

// Ambil root element dari file dashboard-react.php
const rootElement = document.getElementById('umh-react-app');

if (rootElement) {
    ReactDOM.render(
        <React.StrictMode>
            {/* Bungkus App dengan DataProvider agar semua komponen bisa akses state global */}
            <DataProvider>
                <App />
            </DataProvider>
        </React.StrictMode>,
        rootElement
    );
}