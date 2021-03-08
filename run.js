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
const TEST_TILT = "Tiltfile.test";

if (argsContains("build")) {
    build();
    exit(0);
} else if (argsContains("setup")) {
    runSetup();
    exit(0);
} else if (argsContains("down")) {
    shutDown();
    exit(0);
} else if (argsContains("dev")) {
    runDev();
    exit(0);
} else if (argsContains("test")) {
    runTest();
    exit(0);
} else {
    exit(0);
}

function build() {
    exec(`docker-compose build --parallel`);
}

function shutDown() {
    exec(`docker-compose -f ${DEV_COMPOSE} down --remove-orphans`);
    exec(`docker-compose -f ${TEST_COMPOSE} down --remove-orphans`);
    exec(`test $(command -v tilt) && tilt down`);
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

function runDev() {
    shouldBuild();
    shouldCleanUp();

    let services = [
        `mercurios-server`,
        `mercurios-nats`,
        `mercurios-client`,
        `mercurios-playground`,
    ];

    if (argsContains(["--pg"])) {
        services = [...services, "mercurios-postgres"];

        exec(`MERCURIOS_STORE=pg tilt up --hud=true ${services.join(" ")}`);
        exit(0);
    } else {
        services = [...services, "mercurios-mysql"];

        exec(`MERCURIOS_STORE=mysql tilt up --hud=true ${services.join(" ")}`);
        exit(0);
    }
}

function runTest() {
    shouldCleanUp();
    exec(`tilt up -f ${TEST_TILT} --hud=true`);
    exit(0);
}
