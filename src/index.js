import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ProcessDesigner from './components/ProcessDesigner/ProcessDesigner.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store/store';

// const IndexPage = (
//   <Provider store={store}>
//     <div>
//       <ProcessDesigner />
//     </div>
//   </Provider>
// )

// ReactDOM.render(IndexPage, document.getElementById('root'))

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //   {/* <App /> */}
  // </React.StrictMode>
  <Provider store={store}>
    <div>
      <ProcessDesigner />
    </div>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
