module.exports = {
    apps: [
        {
            name: "mercurios",
            script: "bin/www",
            exec_mode: "cluster",
            instances: parseInt(process.env.PROCESSES) || "max",
            max_restarts: 10,
        },
    ],
};
