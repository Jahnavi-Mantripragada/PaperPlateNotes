import React from 'react';
import ReactDOM from 'react-dom/client';
import WorldMap from './components/WorldMap';
import './App.css';

function App() {
  return (
    <div className="app">
      <WorldMap />
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}

export default App;
