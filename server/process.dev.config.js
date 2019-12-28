module.exports = {
    apps: [
        {
            name: "dev_server",
            script: "bin/www",
            exec_mode: "cluster",
            instances: 2,
            watch: ["dist"],
            env: {
                NODE_OPTIONS: "--inspect=0.0.0.0:9220",
            },
        },
    ],
};
