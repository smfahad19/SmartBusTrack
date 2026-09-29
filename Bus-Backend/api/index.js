let cached;

module.exports = async (req, res) => {
    try {
        if (!cached) {
            const { createServer } = require('../index');
            cached = createServer();
        }
        const { app } = await cached;
        return app(req, res);
    } catch (err) {
        cached = null;
        console.error('Startup failed:', err);
        res.status(500).json({
            error: err.message,
            code: err.code,
            stack: String(err.stack || '').split('\n').slice(0, 6),
        });
    }
};