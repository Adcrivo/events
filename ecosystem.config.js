module.exports = {
    apps: [
        {
            name: 'events',
            script: 'npm start',
            interpreter: 'node',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '800M',
            env: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                PORT: 8080
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 8080
            },
        },
    ],
};
