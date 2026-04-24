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
                NODE_ENV: 'dev',
            },
            env_production: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                PORT: 8080,
                DATABASE_URL: process.env.DATABASE_URL,
                SQS_QUEUE_URL: process.env.SQS_QUEUE_URL
            },
        },
    ],
};
