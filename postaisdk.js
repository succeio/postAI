// import admin from "firebase-admin";
// import { serve } from "bun";


// const DDGS = require('./duckai4o.js');

// var serviceAccount = require("./hiki-b3ad5-firebase-adminsdk-faniv-bedf23f9f0.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://hiki-b3ad5-default-rtdb.europe-west1.firebasedatabase.app"
// });


// const server = serve({
//   port: 3000,
//   async fetch(req) {
//     // Устанавливаем заголовки CORS
//     const headers = {
//       "Access-Control-Allow-Origin": "*", // Разрешаем все источники
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Разрешаем методы
//       "Access-Control-Allow-Headers": "Content-Type", // Разрешаем заголовки
//     };

//     if (req.method === "OPTIONS") {
//       // Обрабатываем preflight запрос
//       return new Response(null, {
//         status: 204,
//         headers,
//       });
//     }

//     if (req.method === "POST") {
//       try {
//         const data = await req.json(); 
//         const postText = data.postText; 
//         const board = data.board; 
//         const thread = data.thread;
//         const postIdReply = data.postId;

//         const ddgs = new DDGS();
//         const response = await ddgs.chat(postText.replace(/#([A-Za-z0-9_-]+)/g, ''), 'gpt-4o-mini');

//         //console.log(`response: ${response} postText: ${postText}, board: ${board}, thread: ${thread}, postId: ${postIdReply}`); 
//         //----- Реализация отправки ответа в бд
//         const postId = admin.database().ref(`${board}/${thread}`).push().key; // Генерация уникального ID
//         //console.log(postId)
//         const newPost = {
//           name: 'Аноним',
//           password: '',
//           theme: '',
//           text: `#${postIdReply} ` + response,
//           url: '',
//           time: new Date().toLocaleTimeString('ru-RU', {
//             timeZone: 'Europe/Moscow',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit'
//           }),
//           data: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'),
//           day: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][new Date().getDay()],
//           postId: postId,
//           threadId: thread,
//           uId: '',
//           mimeType: ''
//         }
//         await admin.database().ref(`${board}/${thread}/posts/${postId}`).set(newPost);

//         // ----------- код обновления reply ----------- 
//         const postRef = admin.database().ref(`${board}/${thread}/posts/${postIdReply}`);
//         try {
//           const snapshot = await postRef.once('value');
//           if (snapshot.exists()) {
//             const currentReplies = snapshot.val().replies || [];
//             if (!currentReplies.includes(postId)) {
//               await postRef.update({
//                 replies: [...currentReplies, postId]
//               });
//               //console.log(`Пост с id ${postIdReply} успешно обновлен!`)
//             } else {
//               //console.log(`Пост с id ${postIdReply} уже содержит newPostId.`)
//             }
//           } else {
//             //console.log(`Пост с id ${postIdReply} не найден.`)
//           }
//         } catch (err) {
//           console.error(`Ошибка при обновлении документа с id ${postIdReply}: `, err);
//         }
//         //----- end

//         return new Response("Data received successfully!", {
//           status: 200,
//           headers,
//         });
//       } catch (error) {
//         console.error('Error processing request:', error);
//         return new Response("Invalid JSON or error processing request", { status: 400, headers });
//       }
//     }
//     return new Response("Method Not Allowed", { status: 405, headers });
//   },
// });

// console.log("Server is running on http://localhost:3000");

import admin from "firebase-admin";
import { serve } from "bun";

const DDGS = require('./duckai4o.js');

var serviceAccount = require("./hiki-b3ad5-firebase-adminsdk-faniv-bedf23f9f0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hiki-b3ad5-default-rtdb.europe-west1.firebasedatabase.app"
});

const server = serve({
  port: 3000,
  async fetch(req) {
    // Устанавливаем заголовки CORS
    const headers = {
      "Access-Control-Allow-Origin": "*", // Разрешаем все источники
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Разрешаем методы
      "Access-Control-Allow-Headers": "Content-Type", // Разрешаем заголовки
    };

    if (req.method === "OPTIONS") {
      // Обрабатываем preflight запрос
      return new Response(null, {
        status: 204,
        headers,
      });
    }

    if (req.method === "POST") {
      if (req.url === "/aipost") {
        return await handleAipost(req, headers);
      } else if (req.url === "/multipost") {
        return await handleMultipost(req, headers);
      }
    }

    return new Response("Method Not Allowed", { status: 405, headers });
  },
});

async function handleAipost(req, headers) {
  try {
    const data = await req.json();
    const postText = data.postText;
    const board = data.board;
    const thread = data.thread;
    const postIdReply = data.postId;

    const ddgs = new DDGS();
    const response = await ddgs.chat(postText.replace(/#([A-Za-z0-9_-]+)/g, ''), 'gpt-4o-mini');

    // Реализация отправки ответа в БД
    const postId = admin.database().ref(`${board}/${thread}`).push().key; // Генерация уникального ID
    const newPost = {
      name: 'Аноним',
      password: '',
      theme: '',
      text: `#${postIdReply} ` + response,
      url: '',
      time: new Date().toLocaleTimeString('ru-RU', {
        timeZone: 'Europe/Moscow',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      data: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'),
      day: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][new Date().getDay()],
      postId: postId,
      threadId: thread,
      uId: '',
      mimeType: ''
    };
    await admin.database().ref(`${board}/${thread}/posts/${postId}`).set(newPost);

    // Обновление reply
    const postRef = admin.database().ref(`${board}/${thread}/posts/${postIdReply}`);
    const snapshot = await postRef.once('value');
    if (snapshot.exists()) {
      const currentReplies = snapshot.val().replies || [];
      if (!currentReplies.includes(postId)) {
        await postRef.update({
          replies: [...currentReplies, postId]
        });
      }
    }

    return new Response("Data received successfully!", {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response("Invalid JSON or error processing request", { status: 400, headers });
  }
}

async function handleMultipost(req, headers) {
  try {
    const data = await req.json();
    // Вставьте свою логику для обработки данных на /multipost
    console.log("Received data on /multipost:", data);

    // Пример ответа
    return new Response("Data received successfully on /multipost!", {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error processing request on /multipost:', error);
    return new Response("Invalid JSON or error processing request on /multipost", { status: 400, headers });
  }
}

console.log("Server is running on http://localhost:3000");
