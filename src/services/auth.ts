import $error from "@bahatron/error";

interface User {
    uid: string;
}

const $auth = {
    /** @todo: proper authentication */
    async authenticateToken(token: string = ""): Promise<User> {
        let test =
            Boolean(token) &&
            new RegExp(
                /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
            ).test(token);

        if (!test) {
            throw $error.Unauthorized(`Invalid token`);
        }

        return {
            uid: token
        };
    }
};
export default $auth;
