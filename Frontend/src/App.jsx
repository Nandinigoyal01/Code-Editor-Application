import { useState, useEffect } from 'react'
import { z } from "zod";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { BsEmojiSmileFill } from "react-icons/bs";

import "./assets/App.css";
const socket = io(import.meta.env.VITE_SOCKET_URL) /*, {
    transports: ["polling"]
}); */


function App() {

  const [name, setName] = useState(sessionStorage.getItem("name") || "");
  const [roomid, setRoomId] = useState(sessionStorage.getItem("roomid") || "");
  const [isjoined, setIsJoined] = useState(sessionStorage.getItem("isjoined") === "true");
  const [language, setLanguage] = useState("javascript");
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState("//start your code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [typing,setTyping] = useState("");

  console.log("ALL ENV:", import.meta.env);
console.log("SOCKET:", import.meta.env.VITE_SOCKET_URL);
console.log("TEST:", import.meta.env.VITE_TEST);
  useEffect(() => {
    const savedJoined = sessionStorage.getItem("isjoined");
    const savedRoomId = sessionStorage.getItem("roomid");
    const savedUserName = sessionStorage.getItem("name");

    if (savedJoined === "true" && savedRoomId && savedUserName) {
      socket.emit("joined", {
        name: savedUserName,
        roomid: savedRoomId,
      });
    }
  }, []);

  useEffect(() => {
    socket.on("languagechanged", (language) => {
      setLanguage(language);
    })

    socket.on("userupdate", (users) => {
      setUsers(users);
    })

    socket.on("usertyping",(name) => {
      setTyping(`${name.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    })
    socket.on("codeupdated", (code) => {
      setCode(code);
    })

    socket.on("usererror",(message) => {
      toast.error(message);
      setName("");
    })

    socket.on("joinsuccess", ({ name, roomid }) => {
      setIsJoined(true);

      sessionStorage.setItem("name", name);
      sessionStorage.setItem("roomid", roomid);
      sessionStorage.setItem("isjoined", "true");
    })
    return () => {
      socket.off("languagechanged");
      socket.off("userupdate");
      socket.off("codeupdated");
      socket.off("joinsuccess");
      socket.off("usertyping");
      socket.off("usererror");
    }
  }, [])



  const formSchema = z.object({
    roomid: z.string().trim().min(1, "Please enter a room ID"),
    name: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "Username can only contain letters, numbers, spaces and _"
      ),
  });

  const handlesubmit = (e) => {
    e.preventDefault();

    const result = formSchema.safeParse({
      name: name,
      roomid: roomid,
    })

    if (!result.success) {
      //console.log(result.error.issues);
      toast.error(result.error.issues[0].message);
      return;
    }

    //console.log("Valid Data: ", result.data);
    //console.log("Name:", name);
    //console.log("roomid:", roomid);



    //setIsJoined(true);

    if (name && roomid) {
      socket.emit("joined", ({ name, roomid }));
    }

    //setName("");
    //setRoomId("");
  }

  const handleclick = async () => {
    await navigator.clipboard.writeText(roomid);

    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);

  }
  const handleleave = () => {
    //e.preventDefault();
    socket.emit("leave");
    setName("");
    setRoomId("");
    setIsJoined(false);
    setCode("//start your code here");
    setLanguage("Javascript");

    sessionStorage.removeItem("name");
    sessionStorage.removeItem("roomid");
    sessionStorage.removeItem("isjoined");

  }

  const handleCodeChange = (newcode) => {
    setCode(newcode);
    socket.emit("codechange", { roomid, code: newcode });
    socket.emit("typing",({roomid,name}));
  }


  const handlelanguage = (e) => {
    const newlanguage = e.target.value;
    setLanguage(newlanguage);
    socket.emit("languagechange", ({ roomid, language: newlanguage }));
  }

  if (!isjoined) {
    return (

      <>

        <form onSubmit={handlesubmit}>
          <h1>Let's code!!! <BsEmojiSmileFill />

          </h1>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label>Room Id:</label>
            <input
              type="text"
              value={roomid}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button type="submit">Enter the room</button>
        </form>

      </>
    )

  }

  return (
    <>
      <div className='editor-page'>
        <div className='sidebar'>
          <h1>welcome to editor page!!!</h1>
          <h1>your roomid: {roomid}</h1>
          <button onClick={handleclick}>copy roomId</button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
          <h3>Users in Room:</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user.slice(0, 8)}...</li>
            ))}
          </ul>
          <p className='typing-indicator'>{typing}</p>
          <select className='language-selector'
            value={language}
            onChange={handlelanguage}>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <button onClick={handleleave}>leave the room</button>
        </div>

        <div className='editor-wrapper'>
          <Editor
            //height="500px"
            height={"100%"}
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

      </div>
    </>
  )

}

export default App
