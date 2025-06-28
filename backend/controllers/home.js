
const User = require('../models/userSchema')

const home = async (req, res) => {
    try {
        const { userId } = req.user;

        // 1. Find the user by ID
        const user = await User.findById(userId).select("email name");

        // 2. If user not found
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 3. Build redirect URL with email and name
        const redirectUrl = `http://localhost:3000/?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`;

        // 4. Redirect to frontend
        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Error in home route:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = {
    home
}