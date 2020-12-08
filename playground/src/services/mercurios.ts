import mercurios from "@bahatron/mercurios";

export default mercurios.connect({
    url: process.env.VUE_APP_MERCURIOS_URL,
    id: "mercurios_playground",
});
