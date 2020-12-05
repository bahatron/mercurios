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

const DEV_COMPOSE = "docker-compose.dev.yml";
const TEST_COMPOSE = "docker-compose.test.yml";

function build() {
    exec(`docker-compose build --parallel`);
}

function shutDown() {
    exec(`test $(command -v tilt) && tilt down`);
    exec(`docker-compose -f ${DEV_COMPOSE} down --remove-orphans`);
    exec(`docker-compose -f ${TEST_COMPOSE} down --remove-orphans`);
}

function shouldCleanUp() {
    if (argsContains(["-c", "--clean"])) {
        shutDown();
    }
}

function shouldBuild() {
    if (argsContains(["-b", "--build"])) {
        build();
    }
}

function runUp() {
    shouldBuild();
    shouldCleanUp();
    exec("tilt up --hud=true");
    shutDown();
}

function runTest() {
    shouldBuild();
    shouldCleanUp();
    exec(`docker-compose -f ${TEST_COMPOSE} up -d`);
    exec(
        `docker exec mercurios-server sh -c "wait-for-it mercurios-server:4254 -t 30 -- npm run test"`
    );
    exec(
        `docker-compose -f ${TEST_COMPOSE} run mercurios-client sh -c "npm run test"`
    );
}

if (argsContains("build")) {
    build();
    exit(0);
} else if (argsContains("setup")) {
    exec("npx lerna clean -y");
    exec("npm install");
    exit(0);
} else if (argsContains("update")) {
    exec("npx lerna exec -- npm update");
    exit(0);
} else if (argsContains("down")) {
    shutDown();
    exit(0);
} else if (argsContains("up")) {
    runUp();
    exit(0);
} else if (argsContains("test")) {
    runTest();
    exit(0);
} else {
    exit(0);
}
