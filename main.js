import { serve } from "bun";
import { database, storage } from './firebase.js'
import { ref as dbRef, push, set, get, update } from 'firebase/database'
//import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const DDGS = require('./duckai4o.js');

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

    const chance = Math.random();
//    console.log(chance)
    if (req.method === "POST") {
      if (chance <= 0.45) {
        try {
          const data = await req.json(); 
          const postText = data.postText; 
          const board = data.board; 
          const thread = data.thread;
          const postIdReply = data.postId;

          const ddgs = new DDGS();
          const response = await ddgs.chat(postText.replace(/#([A-Za-z0-9_-]+)/g, ''), 'gpt-4o-mini');

          //console.log(`response: ${response} postText: ${postText}, board: ${board}, thread: ${thread}, postId: ${postIdReply}`); 
          //----- Реализация отправки ответа в бд
          const postId = push(dbRef(database, `${board}/${thread}`)).key // Генерация уникального ID
          //console.log(postId)
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
          }
          await set(dbRef(database, `${board}/${thread}/posts/${postId}`), newPost)

          // ----------- код обновления reply ----------- 
          const postRef = dbRef(database, `${board}/${thread}/posts/${postIdReply}`)
          try {
            const snapshot = await get(postRef)
            if (snapshot.exists()) {
              const currentReplies = snapshot.val().replies || []
              if (!currentReplies.includes(postId)) {
                await update(postRef, {
                  replies: [...currentReplies, postId]
                })
                //console.log(`Пост с id ${postIdReply} успешно обновлен!`)
              } else {
                //console.log(`Пост с id ${postIdReply} уже содержит newPostId.`)
              }
            } else {
              //console.log(`Пост с id ${postIdReply} не найден.`)
            }
          } catch (err) {
            console.error(`Ошибка при обновлении документа с id ${postIdReply}: `, err)
          }
        
          //----- end

          return new Response("Data received successfully!", {
            status: 200,
            headers,
          });
        } catch (error) {
          return new Response("Invalid JSON", { status: 400, headers });
        }
      }
    }

    return new Response("Method Not Allowed", { status: 405, headers });
  },
});

console.log("Server is running on http://localhost:3000");
