import $knex, { knex } from "../adapters/knex";
const $db = {
    async insert(
        table: string,
        data: Record<string, string | number>
    ): Promise<number | undefined> {
        return new Promise((resolve, reject) => {
            $knex.transaction(async trx => {
                try {
                    let result = await trx(table).insert(data);

                    await trx.commit();

                    resolve(result.shift());
                } catch (err) {
                    await trx.rollback();

                    reject(err);
                }
            });
        });
    },

    async findOneBy<T = any>(
        table: string,
        query: Record<string, string | number>
    ): Promise<T | undefined> {
        return await $knex
            .select("*")
            .from(table)
            .where(query)
            .first();
    },

    async hasTable(table: string): Promise<boolean> {
        return $knex.schema.hasTable(table);
    },

    async createTable(
        table: string,
        callback: (schema: knex.CreateTableBuilder) => void
    ): Promise<void> {
        if (await $knex.schema.hasTable(table)) {
            return;
        }

        await $knex.schema.createTable(table, callback);
    },

    async truncate(table: string) {
        if (!(await $db.hasTable(table))) {
            return;
        }

        await $knex(table).truncate();
    }
};

export default $db;
