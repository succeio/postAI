import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const _0x2c23c4=_0x2fa2;function _0x2fa2(_0x347d16,_0x5671c8){const _0x4d608c=_0x4d60();return _0x2fa2=function(_0x2fa22f,_0x5ed4b){_0x2fa22f=_0x2fa22f-0x94;let _0x2f254d=_0x4d608c[_0x2fa22f];return _0x2f254d;},_0x2fa2(_0x347d16,_0x5671c8);}function _0x4d60(){const _0x8667e8=['9rfhwSN','12876NaEDSM','5469300hQGFPB','1:279434190282:web:25d20c8b5f826ac6750333','162DQcLwK','14968920DaOvLW','49206476xdzonL','hiki-b3ad5','118419WTXiMR','5338984XqBlyK','hiki-b3ad5.appspot.com','247EUWZil','279434190282','G-LJFJE29SVK','6kZwffK','hiki-b3ad5.firebaseapp.com','903088ROnIBT'];_0x4d60=function(){return _0x8667e8;};return _0x4d60();}(function(_0x2383f4,_0x47e004){const _0x29ff18=_0x2fa2,_0x534987=_0x2383f4();while(!![]){try{const _0x344f7e=-parseInt(_0x29ff18(0x99))/0x1*(parseInt(_0x29ff18(0xa0))/0x2)+parseInt(_0x29ff18(0x9c))/0x3*(parseInt(_0x29ff18(0x9e))/0x4)+-parseInt(_0x29ff18(0xa1))/0x5+-parseInt(_0x29ff18(0xa3))/0x6*(parseInt(_0x29ff18(0x96))/0x7)+-parseInt(_0x29ff18(0x97))/0x8*(-parseInt(_0x29ff18(0x9f))/0x9)+-parseInt(_0x29ff18(0xa4))/0xa+parseInt(_0x29ff18(0x94))/0xb;if(_0x344f7e===_0x47e004)break;else _0x534987['push'](_0x534987['shift']());}catch(_0x26a6bd){_0x534987['push'](_0x534987['shift']());}}}(_0x4d60,0xe90a8));const firebaseConfig={'apiKey':'AIzaSyAQX5g53jQKZzmbSH437w0Vf8sPvxagOb0','authDomain':_0x2c23c4(0x9d),'databaseURL':'https://hiki-b3ad5-default-rtdb.europe-west1.firebasedatabase.app','projectId':_0x2c23c4(0x95),'storageBucket':_0x2c23c4(0x98),'messagingSenderId':_0x2c23c4(0x9a),'appId':_0x2c23c4(0xa2),'measurementId':_0x2c23c4(0x9b)};

// Инициализация приложения Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Realtime Database
const database = getDatabase(app);

// Инициализация Firebase Storage
const storage = getStorage(app);

export { database, storage };
