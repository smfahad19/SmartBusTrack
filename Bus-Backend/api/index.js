const { createServer } = require('../index');

let cached;

module.exports = async (req, res) => {
    try {
        if (!cached) cached = createServer();
        const { app } = await cached;
        return app(req, res);
    } catch (err) {
        cached = null; // agle request par dobara try kare
        console.error('Startup failed:', err);
        res.status(500).json({ error: err.message });
    }
};