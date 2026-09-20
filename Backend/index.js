require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");


const app = express();

//app.use(cors());
app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("backend is running");
}) 


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    },
});
console.log("PORT:", process.env.PORT);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

const rooms = new Map();
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    let currentuser = null;
    let currentroom = null;

    socket.on("joined", ({ name, roomid }) => {
        if (currentroom) {
            const oldroom = rooms.get(currentroom);
            if (oldroom) {
                oldroom.Users.delete(currentuser);
                io.to(currentroom).emit("userupdate", Array.from(oldroom.Users));
            }
            socket.leave(currentroom);
        }

        if (!rooms.has(roomid)) {
            rooms.set(roomid, {
                Users: new Set(),
                code: "//start from here",
                language: "javascript"
            })
        }

        const room = rooms.get(roomid);

        if (room.Users.has(name)) {
            socket.emit("usererror", "User already exists!!!");
            return;
        }

        currentuser = name;
        currentroom = roomid;
        socket.join(roomid);

        room.Users.add(name);

        socket.emit("joinsuccess", { name, roomid });

        // Send current code to the new user
        socket.emit("codeupdated", rooms.get(roomid).code);     // or socket.emit("codeUpdate", room.code);

        // send language upadate to new user
        socket.emit("languagechanged", room.language);


        // Update users for everyone
        io.to(roomid).emit(
            "userupdate",
            Array.from(room.Users)
        );

    })

    socket.on("languagechange", ({ roomid, language }) => {
        const room = rooms.get(roomid);

        if (!room) {
            return;
        }
        room.language = language;
        io.to(roomid).emit("languagechanged", language);
    })

    socket.on("leave", () => {
        if (currentroom && currentuser) {
            const room = rooms.get(currentroom);
            if (room) {
                room.Users.delete(currentuser);

                io.to(currentroom).emit("userupdate", Array.from(room.Users));
            }
            socket.leave(currentroom);

            currentroom = null;
            currentuser = null;
        }
    });

    socket.on("disconnect", () => {
        if (currentroom && currentuser) {

            const room = rooms.get(currentroom);

            if (room) {
                room.Users.delete(currentuser);

                io.to(currentroom).emit(
                    "userupdate",
                    Array.from(room.Users)
                );
            }
        }
    });

    socket.on("codechange", ({ roomid, code }) => {
        const room = rooms.get(roomid);
        if (!room) return;
        room.code = code;
        socket.to(roomid).emit("codeupdated", code);
    });

    socket.on("typing",({roomid,name}) => {
        socket.to(roomid).emit("usertyping",name);
    });
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
})