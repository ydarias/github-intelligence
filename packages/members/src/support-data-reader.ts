import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface SupportEntry {
  talentId: string | null;
  jobRole: string | null;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let value = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          value += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          value += line[i];
          i++;
        }
      }
      values.push(value);
      if (line[i] === ",") i++;
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) {
        values.push(line.slice(i));
        break;
      }
      values.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return values;
}

export class SupportDataReader {
  static load(): Map<string, SupportEntry> {
    const csvPath = fileURLToPath(new URL("../support-data.csv", import.meta.url));
    let content: string;
    try {
      content = readFileSync(csvPath, "utf-8");
    } catch {
      return new Map();
    }

    const map = new Map<string, SupportEntry>();
    const lines = content.split("\n");

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined || line.trim() === "") continue;
      const cols = parseCSVLine(line);
      const email = cols[1]?.trim();
      if (!email) continue;
      map.set(email.toLowerCase(), {
        talentId: cols[0]?.trim() || null,
        jobRole: cols[3]?.trim() || null,
      });
    }

    return map;
  }
}
