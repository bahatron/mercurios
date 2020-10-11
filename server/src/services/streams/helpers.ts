export function natsQueryToSql(filter: string): string {
    let splitted = filter.split(".");
    let index = splitted.indexOf(">");

    if (index >= 0) {
        splitted.splice(index, splitted.length, "%");
    }

    return splitted
        .map((item) => (item === "*" ? "%" : item))
        .reduceRight((carry, value, index, arr) => {
            if (value === "%" && arr[index - 1] === "%") {
                return carry;
            }
            carry.push(value);
            return carry;
        }, [] as string[])
        .reverse()
        .join(".");
}
