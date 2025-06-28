
module.exports = function (io) {
    let onlineUsersList = []; // ✅ Global array to store online users

    io.on('connection', (socket) => {
        console.log('🟢 A user connected:', socket.id);

        // 🟡 Listen for user joining 
        socket.on('user-joined', ({ id, email }) => {

            // ✅ Join room for private messaging (optional, but useful)
            socket.join(id);

            // ✅ Check if user is already in the list
            const existingUserIndex = onlineUsersList.findIndex(user => user.id === id);

            if (existingUserIndex === -1) {
                // Add new user
                onlineUsersList.push({ socketId: socket.id, id, email });
            } else {
                // Update existing user's socketId (in case of reconnect)
                onlineUsersList[existingUserIndex].socketId = socket.id;
            }

            io.emit('get-online-users', onlineUsersList);
        });

        socket.on('callToUser', (data) => {
            console.log(`Call coming from ${data.from} && email = ${data.email}`);

            let userSocketData = onlineUsersList.find((user) => user.id == data.callToUserId);

            if (userSocketData) {
                console.log('Call to user', userSocketData); // ✅ Call to user 

                io.to(userSocketData.socketId).emit('callToUser', {
                    signal: data.signalData,
                    from: data.from,
                    fromEmail: data.email,
                })

            }

        })

        socket.on('call-ended', (data) => {
            io.to(data.to).emit('call-ended'); // ✅ Call ended notification to the user who received the call
        })

        socket.on('answerCall', (data) => {
            console.log('Answer call ', data);
            io.to(data.to).emit('callAccepted', {
                signal: data.signal,
                from: data.from,
            })
 
        }) 

        socket.on('manual-logout', () => {
            console.log('🚪 User manually logged out:', socket.id);
            onlineUsersList = onlineUsersList.filter(user => user.socketId !== socket.id);
            io.emit('get-online-users', onlineUsersList);
        });

        // 🔴 Handle disconnect
        socket.on('disconnect', () => {
            console.log('🔴 A user disconnected:', socket.id);
            console.log('Ok disconnect'); 
            


            // ✅ Remove disconnected user
            onlineUsersList = onlineUsersList.filter(user => user.socketId !== socket.id);

            // ✅ Emit updated list 

            socket.broadcast.emit('disconnectUser', {
                disUser: socket.id, // ✅ Emit the disconnected user's id
            }) 

            io.emit('get-online-users', onlineUsersList);
        });
    });

}; 
