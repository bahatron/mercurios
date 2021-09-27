// require("ts-node").register();

const { $config } = require("./dist/utils/config");

module.exports = {
    apps: [
        {
            script: "dist/bin/mercurios-server.js",
            name: "mercurios server",
            exec_mode: "cluster",
            instances: $config.mercurios_workers,
            out_file: "/dev/null",
            error_file: "/dev/null",
            watch: $config.dev_mode ? ["dist"] : false,
            node_args: $config.dev_mode
                ? ["--inspect=0.0.0.0:9230"]
                : undefined,
        },
    ],
};
