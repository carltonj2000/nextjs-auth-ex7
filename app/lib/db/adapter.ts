import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import db from "./index";
import { sessionTable, userTable } from "./schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export default adapter;
