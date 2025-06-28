
'use client'
import { useRouter } from 'next/navigation';
import { useSocket } from '@/contextApi/SocketContext';

const LogoutButton = () => {
  const { socket } = useSocket();
  const router = useRouter();

  const handleLogout = async () => {

    let response = confirm('Do you want to logout');

    if (!response) {
      return
    }

    socket?.emit("manual-logout"); // emit logout event to server

    socket.off('disconnect');
    socket.disconnect();  

    await fetch('http://localhost:5000/logout', {
      credentials: 'include',
    });

    document.cookie = 'token=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-2 rounded-2xl cursor-pointer bg-red-500 text-white font-semibold hover:bg-red-600 transition duration-300 shadow-md"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
