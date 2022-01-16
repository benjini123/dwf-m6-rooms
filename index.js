"use strict";
exports.__esModule = true;
var express = require("express");
var db_1 = require("./db");
var uuid_1 = require("uuid");
var cors = require("cors");
var port = 4000;
var app = express();
app.use(express.json());
app.use(cors());
var userCollection = db_1.firestore.collection("users");
var roomsCollection = db_1.firestore.collection("rooms");
//toma el input y si no existe una cuenta asignada a ese mail la crea y devuelve el ID de ese usuario creado
app.post("/signup", function (req, res) {
    var email = req.body.email;
    var nombre = req.body.nombre;
    userCollection
        .where("email", "==", email)
        .get()
        .then(function (searchResponse) {
        if (searchResponse.empty) {
            userCollection
                .add({
                email: email,
                nombre: nombre
            })
                .then(function (newUserRef) {
                res.json({
                    id: newUserRef.id
                });
            });
        }
        else {
            res.status(400).json({
                message: "user already exists"
            });
        }
    });
    res.json(req.body);
});
//busca en firestore que documento tiene ese e-mail y devuelve su id LARGO
//
app.post("/auth", function (req, res) {
    var email = req.body.email;
    userCollection
        .where("email", "==", email)
        .get()
        .then(function (searchResponse) {
        if (searchResponse.empty) {
            res.status(404).json({
                message: "not found"
            });
        }
        else {
            res.json({
                id: searchResponse.docs[0].id
            });
        }
    });
});
// le pasa el id largo del usuario y se fija si en la colleccion de usuarios esta ese id y si existe crea un nuevo room con un id random
app.post("/rooms", function (req, res) {
    var userId = req.body.userId;
    userCollection
        .doc(userId.toString())
        .get()
        .then(function (doc) {
        if (doc.exists) {
            var roomRef_1 = db_1.rtdb.ref("/chatrooms/" + uuid_1.v4());
            roomRef_1
                .set({
                messages: [],
                owner: userId
            })
                .then(function () {
                var roomLongId = roomRef_1.key;
                var roomId = 1000 + Math.floor(Math.random() * 999);
                roomsCollection
                    .doc(roomId.toString())
                    .set({
                    rtdbRoomId: roomLongId
                })
                    .then(function () {
                    res.json({
                        id: roomId.toString()
                    });
                });
            });
        }
        else {
            res.status(401).json({
                message: "no existiss"
            });
        }
    });
});
app.get("/rooms/:roomId", function (req, res) {
    var userId = req.query.userId;
    var roomId = req.params.roomId;
    userCollection
        .doc(userId.toString())
        .get()
        .then(function (doc) {
        if (doc.exists) {
            roomsCollection
                .doc(roomId)
                .get()
                .then(function (snap) {
                var data = snap.data();
                res.json(data);
            });
        }
        else {
            res.status(401).json({
                message: "no existis"
            });
        }
    });
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
