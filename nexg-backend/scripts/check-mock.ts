// Verify mock slug fix + report mock search counts for QA parity queries.
import {
  getSeedOffering,
  getSeedOfferingsByMerchant,
  nexgMerchants,
  searchSeedOfferings,
} from "C:/Users/lenovo/Desktop/wolt-react-native-main/data/nexg/nexg-catalog";
import { nexgMerchants as _x } from "C:/Users/lenovo/Desktop/wolt-react-native-main/data/nexg/nexg-catalog";
import { merchants } from "C:/Users/lenovo/Desktop/wolt-react-native-main/data/nexg/merchants";

const ids = nexgMerchants.map((m) => m.id);
console.log("mock merchants:", ids.length, "has mrc_002:", ids.includes("mrc_002"));
console.log("itm_111 in mock:", JSON.stringify(getSeedOffering("itm_111")?.name ?? null));
console.log("mrc_002 items in mock:", getSeedOfferingsByMerchant("mrc_002").length);
const empty = ids.filter((id) => getSeedOfferingsByMerchant(id).length === 0);
console.log("mock merchants with EMPTY catalog:", JSON.stringify(empty));
for (const q of ["burger", "spa", "pizza", "safari", "laundry", "nyama", "coffee"]) {
  const mq = q.toLowerCase();
  const mh = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(mq) ||
      m.categoryLabel.toLowerCase().includes(mq) ||
      m.tags.some((t) => t.toLowerCase().includes(mq)) ||
      m.description.toLowerCase().includes(mq)
  ).length;
  console.log(`mock search '${q}': merchants=${mh} items=${searchSeedOfferings(mq).length}`);
}
void _x;
