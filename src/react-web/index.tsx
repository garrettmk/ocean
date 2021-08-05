import React from 'react';
import ReactDOM from 'react-dom';


const App = () => (
  <h1>This is the app</h1>
);


const rootEl = document.getElementById('root');
if (!rootEl)
  throw new Error("Can't render app: root element not found");

ReactDOM.render(<App/>, rootEl);