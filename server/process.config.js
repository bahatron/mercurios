module.exports = {
    apps: [
        {
            name: "mercurios_server",
            script: "bin/www",
            exec_mode: "cluster",
            instances: parseInt(process.env.PROCESSES) || "max",
        },
    ],
};
