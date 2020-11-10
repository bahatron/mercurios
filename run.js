#!/usr/bin/node

const { execSync } = require("child_process");
const argv = process.argv.slice(2);

const exec = (command) => execSync(command, { stdio: [0, 1, 2] });
const exit = (code) => process.exit(code);
const argsContains = (flag) => {
    return Array.isArray(flag)
        ? argv.some((item) => flag.includes(item))
        : argv.includes(flag);
};

function shutDown() {
    exec("tilt down");
    exec("docker-compose down --remove-orphans");
    exec("docker-compose -f docker-compose.test.yml down --remove-orphans");
    exec("docker-compose -f docker-compose.prod.yml down --remove-orphans");
}

function shouldCleanUp() {
    if (argsContains(["-c", "--clean"])) {
        shutDown();
    }
}

function build() {
    exec(`docker-compose -f docker-compose.base.yml build --parallel`);
}

function shouldBuild() {
    if (argsContains(["-b", "--build"])) {
        build();
    }
}

if (argsContains("up")) {
    shouldBuild();
    shouldCleanUp();
    exec("tilt up --hud=true");
    shutDown();
    exit(0);
}

if (argsContains("down")) {
    shutDown();
    exit(0);
}

if (argsContains("build")) {
    build();
}

if (argsContains("setup")) {
    exec("npx lerna clean -y");
    exec("npm install");
    exit(0);
}

if (argsContains("test")) {
    shouldBuild();
    shouldCleanUp();
    exec("docker-compose -f docker-compose.test.yml up -d");
    exec(
        `docker exec mercurios_server sh -c "wait-for-it mercurios_server:4254 -t 30 -- npm run test"`
    );
    exec(
        `docker-compose -f docker-compose.test.yml run mercurios_client sh -c "npm run test"`
    );
    exit(0);
}

if (argsContains("update")) {
    exec("npx lerna exec -- npm update");
    exit(0);
}

exit(0);
