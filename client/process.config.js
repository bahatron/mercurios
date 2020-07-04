console.log(`=== NODE ENV: ${process.env.NODE_ENV}`);

module.exports = {
    apps: [
        {
            name: "playground",
            script: "dist/playground.js",
            watch: process.env.NODE_ENV === "production" ? false : ["dist"],
            autorestart: process.env.NODE_ENV === "production",
        },
    ],
};
