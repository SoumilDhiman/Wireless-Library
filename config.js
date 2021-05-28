import * as firebase from 'firebase'
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyDDK3-NEUWoXGLLkPBXfIxcZu1kwA5vo8s",
    authDomain: "wireless-library-d6faf.firebaseapp.com",
    databaseURL: "https://wireless-library-d6faf-default-rtdb.firebaseio.com",
    projectId: "wireless-library-d6faf",
    storageBucket: "wireless-library-d6faf.appspot.com",
    messagingSenderId: "946398554366",
    appId: "1:946398554366:web:28a8d10637f452c1a69daf"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()