export type serverRequestData = {
    serverID: string,
    status: 'TARGET' | 'MASTER',
    timestamp?: number
}

export class SQL_Link {
    static AreLinked(master_server: serverRequestData, target_server: serverRequestData): boolean {
        return true;
    }

    static Linking_process(master_server: serverRequestData, target_server: serverRequestData): boolean {
        return true;
    }

    static Unlinking_process(master_server: serverRequestData, target_server: serverRequestData): boolean {
        return true;
    }

    static getPairs(server: serverRequestData): serverRequestData {
        let a:serverRequestData = {
            serverID: "string",
            status: 'TARGET',
        }
        return a;
    }
}
