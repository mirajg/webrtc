
import React from 'react'
import { useSocket } from '@/contextApi/SocketContext'

const CallingInterface = ({ callerEmail, setReceivingCall, answerCall }) => {

    let { callEnded, setCallEnded } = useSocket(); 
    

    return (
        <div className="flex w-full fixed top-0 left-0 flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-lg font-semibold mb-4">📞 Call from <span className="text-blue-600">{callerEmail}</span></p>

                <div className="flex gap-4 justify-center">
                    <button onClick={() => setReceivingCall(false)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full shadow-md transition">
                        Reject
                    </button> 
                    <button onClick={answerCall} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full shadow-md transition">
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CallingInterface
