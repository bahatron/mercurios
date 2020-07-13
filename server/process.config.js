module.exports = {
    apps: [
        {
            script: "dist/bin/http_server.js",
            name: "mercurios",
            watch: true,
            autorestart: false,
        },
    ],
};
