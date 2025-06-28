
'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutBtn';
import { useSocket } from '@/contextApi/SocketContext';
import CallingInterface from '@/components/CallingInterface';
import Peer from 'simple-peer'

const Page = () => {
  const [me, setMe] = useState("");

  const [receivingCall, setReceivingCall] = useState(false); // Flag to check if we are receiving a call
  const [caller, setCaller] = useState("");
  const [callerEmail, setCallerEmail] = useState(""); // Email of the caller 
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false); // Flag to check if the call is accepted



  let connectionRef = useRef();

  let myVideo = useRef();
  let userVideo = useRef(); // Video of the user
  let [stream, setStream] = useState();

  const [userInfoVal, setUserInfoVal] = useState({});
  const { socket, callEnded, setCallEnded } = useSocket();


  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userInfo = async () => {
      try {
        if (socket) {
          fetch("http://localhost:5000/api/verifyuser", {
            credentials: "include"
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.user) {
                setUserInfoVal({ id: data.user.id, email: data.user.email })
                socket.emit("user-joined", {
                  id: data.user.userId,
                  email: data.user.email,
                });
              }
            });

          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
              myVideo.current.srcObject = stream;

            }
          })

        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    userInfo();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket connected with ID:', socket.id);
      setMe(socket.id);
    };

    socket.on('connect', handleConnect);

    // ✅ Immediately run if already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  // Runs once to check auth and get users
  useEffect(() => {
    const checkAuthAndFetchUsers = async () => {
      try {
        const authRes = await fetch('http://localhost:5000/api/verifyuser', {
          credentials: 'include',
        });

        if (authRes.status === 401) {
          router.push('/login');
        } else {
          const usersRes = await fetch('http://localhost:5000/user/all', {
            credentials: 'include',
          });

          const data = await usersRes.json();
          setUsers(data.users);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error:', err);
        router.push('/login');
      }
    };

    checkAuthAndFetchUsers();
  }, [router]);

  // Runs only when socket is available
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (data) => {
      setOnlineUsers(data);
    };

    socket.on('get-online-users', handleOnlineUsers);

    return () => {
      socket.off('get-online-users', handleOnlineUsers);
    };
  }, [socket]);

  useEffect(() => {

    socket.on('callToUser', (data) => {
      console.log('Incoming calling', data);

      setReceivingCall(true);
      setCaller(data.from);
      setCallerEmail(data.fromEmail);
      setCallerSignal(data.signal);
    })

    socket.on('call-ended', (data) => {
      setCallEnded(true);
      setCallAccepted(false);
      setReceivingCall(false); 
      connectionRef.current.destroy(); 

      if (userVideo.current) {
        userVideo.current.srcObject = null; 
      }
    })

    socket.on('disconnectUser',(data)=>{
      if(caller == data.disUser){
        leaveCall();
      } else{

      }
    })

  }, [socket, caller])




  const callToUser = (id) => {

    let peer = new Peer({
      initiator: true,
      stream: stream,
      trickle: false,
    })


    peer.on('signal', (data) => {

      socket.emit("callToUser", {
        callToUserId: id, // id of the user to call
        signalData: data,
        from: me, // id of the user making the call
        email: userInfoVal.email,
      });

    })

    socket.once('callAccepted', (data) => {
      setCallAccepted(true);
      setCaller(data.from);

      peer.signal(data.signal);
    })

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    })

    connectionRef.current = peer; // store the peer connection in a ref

  }

  let handleAnswerCall = () => {
    setCallAccepted(true);
    setCallEnded(false); 

    let peer = new Peer({
      initiator: false, // we are not the initiator of the call
      stream: stream,
      trickle: false,
    })

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller, from: me });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    }
    );

    if (!callerSignal) {
      console.error('CallerSignal is undefined');
      return
    }

    peer.signal(callerSignal) // signal the caller's signal to the peer

    connectionRef.current = peer;


  }

  const leaveCall = () => { 
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    connectionRef.current.destroy();

    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }

    socket.emit('call-ended', {
      to: caller
    })
  }

  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.id === userId)
  }

  if (loading) return <p>Checking login and loading users...</p>;

  return (
    <div className="p-4">
      <LogoutButton />
      <h1 className="text-xl font-bold mb-4">All Users</h1>

      <ul className="space-y-2">
        {users.map(user => (
          <li onClick={() => callToUser(user._id)} key={user._id} className="p-3 cursor-pointer hover:bg-gray-200 bg-gray-100 rounded-md shadow">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {isUserOnline(user._id) ? (
              <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-full shadow-sm">
                🟢 Online
              </span>
            ) : (
              <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-gray-400 rounded-full shadow-sm">
                ⚫ Offline
              </span>
            )}

          </li>
        ))}
      </ul>

      <div>
        <h2>Chat Room</h2>
        {userInfoVal.email && (
          <p>Welcome, {userInfoVal.email} (ID: {userInfoVal.id})</p>
        )}




        <div className="flex flex-col md:flex-row justify-center items-center gap-10 mt-10 px-4">
          {/* Local Video */}
          <div className="bg-gray-100 p-4 rounded-2xl shadow-md text-center">
            <h1 className="text-xl font-semibold mb-3 text-gray-700">Local Video</h1>
            <video
              className="w-72 h-52 rounded-lg bg-black"
              autoPlay
              muted
              ref={(myVideo) => {
                if (myVideo && stream) myVideo.srcObject = stream;
              }}
            ></video>
          </div>

          {/* Remote Video */}
          <div className="bg-gray-100 p-4 rounded-2xl shadow-md text-center">
            <h1 className="text-xl font-semibold mb-3 text-gray-700">Remote Video</h1>
            <video
              className="w-72 h-52 rounded-lg bg-black"
              autoPlay
              muted
              ref={userVideo}
            ></video>
          </div>
        </div>

        {(receivingCall && !callAccepted) ? (
          <CallingInterface callerEmail={callerEmail} answerCall={handleAnswerCall} setReceivingCall={setReceivingCall} />
        ) : (
          null
        )}

        {callAccepted && !callEnded ? (
          <button
            onClick={() => leaveCall()} // replace with your function 
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-300 ease-in-out"
          >
            🔴 End Call
          </button>

        ) : (null)}
      </div>
    </div>
  );
};

export default Page;
