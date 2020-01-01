module.exports = {
    apps: [
        {
            name: "dev_server",
            script: "dist/bin/www.js",
            exec_mode: "cluster",
            instances: 2,
            watch: ["dist"],
            env: {
                ENV: "dev",
            },
        },
    ],
};
