import * as express from "express";
import { json } from "body-parser";
import { firestore, rtdb } from "./db";
import { v4 as uuidv4 } from "uuid";
import { set, ref, push, getDatabase } from "firebase/database";
import * as cors from "cors";

const port = 4000;
const app = express();

app.use(express.json());
app.use(cors());

const userCollection = firestore.collection("users");
const roomsCollection = firestore.collection("rooms");

//toma el input y si no existe una cuenta asignada a ese mail la crea y devuelve el ID de ese usuario creado
app.post("/signup", (req, res) => {
  const email = req.body.email;
  const nombre = req.body.nombre;

  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        userCollection
          .add({
            email,
            nombre,
          })
          .then((newUserRef) => {
            res.json({
              id: newUserRef.id,
            });
          });
      } else {
        res.status(400).json({
          message: "user already exists",
        });
      }
    });

  res.json(req.body);
});

//busca en firestore que documento tiene ese e-mail y devuelve su id LARGO
//
app.post("/auth", (req, res) => {
  const { email } = req.body;
  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        res.status(404).json({
          message: "not found",
        });
      } else {
        res.json({
          id: searchResponse.docs[0].id,
        });
      }
    });
});

// le pasa el id largo del usuario y se fija si en la colleccion de usuarios esta ese id y si existe crea un nuevo room con un id random
app.post("/rooms", (req, res) => {
  const { userId } = req.body;
  userCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        const roomRef = rtdb.ref("/chatrooms/" + uuidv4());
        roomRef
          .set({
            messages: [],
            owner: userId,
          })
          .then(() => {
            const roomLongId = roomRef.key;
            const roomId = 1000 + Math.floor(Math.random() * 999);
            roomsCollection
              .doc(roomId.toString())
              .set({
                rtdbRoomId: roomLongId,
              })
              .then(() => {
                res.json({
                  id: roomId.toString(),
                });
              });
          });
      } else {
        res.status(401).json({
          message: "no existiss",
        });
      }
    });
});

app.get("/rooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;

  userCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            const data = snap.data();
            res.json(data);
          });
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
