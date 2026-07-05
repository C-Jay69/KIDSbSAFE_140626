import { db } from "./index";
import { domainBlacklist } from "./schema";
const rows = await db.select().from(domainBlacklist as any);
console.log(rows);