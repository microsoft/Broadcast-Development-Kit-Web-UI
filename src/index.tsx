import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import configureStore, { DispatchExts, history }  from "./services/store";

import 'antd/dist/antd.css';
import './index.css';
import App from './App';
import { loadConfig } from './stores/config/asyncActions';
import { pollCurrentCallAsync } from './stores/calls/asyncActions';

const store = configureStore();
const storeDispatch = store.dispatch as DispatchExts;

// triger config loading
storeDispatch(loadConfig())

// trigger automatic polling of selected call
storeDispatch(pollCurrentCallAsync());

ReactDOM.render(<>
  <ReduxProvider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </ReduxProvider>

</>, document.getElementById('root'));
