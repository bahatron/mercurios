module.exports = {
    apps: [
        {
            name: "mercurios",
            script: "dist/bin/www.js",
            exec_mode: "cluster",
            instances: parseInt(process.env.PROCESSES) || "max",
            max_restarts: 3,
        },
    ],
};
