import mercurios from "@bahatron/mercurios";

export const $mercurios = mercurios({
    driver: "pg",
    url: "postgres://admin:secret@mercurios-postgres:5432/mercurios",
});
