module.exports = {
    apps: [
        {
            name: "mercurios_server",
            script: "dist/bin/www.js",
            exec_mode: "cluster",
            instances: parseInt(process.env.PROCESSES) || "max",
        },
    ],
};
