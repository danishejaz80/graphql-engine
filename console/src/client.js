/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { useBasename } from 'history';

import firebase from 'firebase';

import FIREBASE_CONFIG from './firebase-config';

import getRoutes from './routes';

import globals from './Globals';
import { store } from './store';

const hashLinkScroll = () => {
  const { hash } = window.location;
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }, 0);
  } else {
    // This is a hack to solve the issue with scroll retention during page change.
    setTimeout(() => {
      const element = document.getElementsByTagName('body');
      if (element && element.length > 0) {
        element[0].scrollIntoView();
      }
    }, 0);
  }
};

const history = syncHistoryWithStore(browserHistory, store);

/* ****************************************************************** */

// Enable hot reloading
if (__DEVELOPMENT__ && module.hot) {
  /*
  module.hot.accept('./reducer', () => {
    store.replaceReducer(require('./reducer'));
  });
  */
  module.hot.accept();
}
// Main routes and rendering
const Main = () => {
  const routeHistory = useBasename(() => history)({
    basename: globals.urlPrefix,
  });

  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  useEffect(() => {
    if (firebaseInitialized) return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      setFirebaseInitialized(true);
    } catch (err) {
      console.error(err);
    }
  }, [firebaseInitialized]);

  return (
    <Router
      history={routeHistory}
      routes={getRoutes(store)}
      onUpdate={hashLinkScroll}
    />
  );
};

const dest = document.getElementById('content');
ReactDOM.render(
  <Provider store={store} key="provider">
    <Main />
  </Provider>,
  dest
);

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger
}
