import { $mercurios } from "./mercurios";

$mercurios.Server.listen(4254, () => {
    console.log(`mercurios server listening on port 4254`);
});
