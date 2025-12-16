// src/dasf/parser.ts
// src/dasf/parser.ts
import type {DasfDocument} from './types';

/**
 * Parses the content of a DASF file into a structured JavaScript object.
 */
export class DASFParser {
    /**
     * Parses a string containing DASF-formatted documentation.
     * @param dasfContent The raw string content of the .dasf file.
     * @returns A DasfDocument object.
     * @throws Error if the format is invalid.
     */
    public parse(dasfContent: string): { doc: DasfDocument, title: string } {
        const lines = dasfContent.trim().split('\n');

        if (lines[0].trim() !== 'DASF-01') {
            throw new Error('Invalid DASF format: Missing or incorrect version header (must be DASF-01).');
        }
        if (!lines[1].trim().includes("title:")) {
            throw new Error('Invalid DASF format: Missing or incorrect title header (must be title:some string).');
        }

        const title = lines[1].replace("title:", '').trim()
        let body = lines.slice(2).join('\n');

        // 1. Remove // comments to avoid breaking JSON.parse
        body = body.replace(/\/\/.* /g, '');

        // 2. Add commas between entries and quote the keys.
        // An entry ends with '}' and the next one may start on a new line with a key.
        // This regex finds a closing brace, any whitespace (including newlines), and then the next key.
        // It adds a comma and quotes the key it finds.
        // Keys can contain letters, numbers, slash, underscore, dot, and hyphen.
        body = body.replace(/}\s*([a-zA-Z0-9/_.$-]+)\s*:/g, '},\n"$1":');

        // 3. Quote the very first key, which isn't preceded by a '}' and thus not matched by the above.
        body = body.replace(/^\s*([a-zA-Z0-9/_.$-]+)\s*:/g, '"$1":');

        const jsonString = `{${body}}`;

        try {
            // Parse the sanitized string into a JavaScript object.
            return {doc: JSON.parse(jsonString) as DasfDocument, title};
        } catch (error) {
            console.error("Error parsing DASF content. The format might be invalid.");
            console.error("Attempted to parse the following string:", jsonString);
            if (error instanceof Error) {
                console.error("Original JSON.parse error:", error.message);
                throw new Error(error.message);
            }
            else throw new Error("Failed to parse DASF file content into a valid structure.");
        }
    }
}
