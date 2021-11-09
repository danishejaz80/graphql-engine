import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Firebase from 'firebase';
import { Modal } from 'react-bootstrap';

const FirebaseLogin = ({ show }) => {
  const [isOpen, setIsOpen] = useState(show);

  useEffect(() => {
    Firebase.auth().onAuthStateChanged(() => {
      if (Firebase.auth().currentUser?.uid) {
        setIsOpen(false);
      }
    });
  }, []);

  return (
    <div>
      <Modal show={isOpen} size="sm">
        <Modal.Header>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center align-items-center">
            <StyledFirebaseAuth
              uiConfig={{
                signInSuccessUrl: '/',
                signInOptions: [
                  Firebase.auth.EmailAuthProvider.PROVIDER_ID,
                  Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                ],
                signInFlow: 'popup',
              }}
              firebaseAuth={Firebase.auth()}
            />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

FirebaseLogin.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default FirebaseLogin;
