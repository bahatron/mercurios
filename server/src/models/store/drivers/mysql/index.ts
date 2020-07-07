import { EventStoreFactory, EventStore } from "../../interfaces";

const mysqlDriver: EventStoreFactory = async () => {
    return <EventStore>{};
};
