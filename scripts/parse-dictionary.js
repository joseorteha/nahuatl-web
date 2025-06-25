const fs = require('fs');
const path = require('path');

const markdownPath = path.join(__dirname, '..', 'dicc-zon.md');
const outputPath = path.join(__dirname, '..', 'backend', 'data', 'dictionary.json');

console.log('Starting precision dictionary parsing based on structural analysis...');
console.log(`Reading from: ${markdownPath}`);

const content = fs.readFileSync(markdownPath, 'utf8');
const lines = content.split('\n');

const dictionary = [];
let currentEntryLines = [];
let dictionaryStarted = false;

// The dictionary proper starts at the line "# A"
for (const line of lines) {
    if (!dictionaryStarted) {
        if (line.trim() === '# A') {
            dictionaryStarted = true;
        }
        continue;
    }

    const trimmedLine = line.trim();
    const isNewSection = /^#\s[A-Z]/.test(trimmedLine);
    const isNewEntryLine = /^(?:###\s*)?\*\*/.test(trimmedLine);

    if ((isNewEntryLine || isNewSection) && currentEntryLines.length > 0) {
        const entryText = currentEntryLines.join(' ').replace(/\s+/g, ' ');
        const entry = parseEntry(entryText);
        if (entry) {
            dictionary.push(entry);
        }
        currentEntryLines = isNewEntryLine ? [trimmedLine] : [];
    } else if (isNewEntryLine) {
        currentEntryLines.push(trimmedLine);
    } else if (currentEntryLines.length > 0 && trimmedLine) {
        currentEntryLines.push(trimmedLine);
    }
}

if (currentEntryLines.length > 0) {
    const entryText = currentEntryLines.join(' ').replace(/\s+/g, ' ');
    const entry = parseEntry(entryText);
    if (entry) {
        dictionary.push(entry);
    }
}

function parseEntry(text) {
    const entryRegex = /^(?:###\s*)?\*\*(.*?)\*\*/;
    const match = text.match(entryRegex);
    if (!match) return null;

    const wordPart = match[1].trim();
    let restOfLine = text.substring(match[0].length).trim();
    
    const wordVariants = wordPart.split(',').map(w => w.trim()).filter(w => w);
    if (wordVariants.length === 0) return null;

    const newEntry = {
        word: wordVariants[0],
        variants: wordVariants.slice(1),
    };

    const parts = restOfLine.split('–');
    newEntry.grammar_info = parts.shift().trim();
    let remainingText = parts.join('–').trim();

    const sciNameMatch = remainingText.match(/\(([^)]+)\)/);
    if (sciNameMatch) {
        newEntry.scientific_name = sciNameMatch[1];
        remainingText = remainingText.replace(sciNameMatch[0], '').trim();
    }

    const keywordRegex = /\s+(?=Ej\.|Sin\.|R\.|véa\.|Dícese)/g;
    const allParts = remainingText.split(keywordRegex);
    
    newEntry.definition = allParts.shift().trim().replace(/[.\s]$/, '');
    
    allParts.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart.startsWith('Ej.')) {
            const content = trimmedPart.substring(3).trim();
            const examplesRaw = content.split(';').map(s => s.trim());
            newEntry.examples = (newEntry.examples || []).concat(examplesRaw.map(ex => {
                const [nahuatl, espanol] = ex.split('–').map(s => s.trim());
                return { nahuatl: nahuatl || '', espanol: espanol ? espanol.replace(/[.\s]$/, '') : '' };
            }).filter(e => e.nahuatl));
        } else if (trimmedPart.startsWith('Sin.')) {
            const content = trimmedPart.substring(4).trim();
            newEntry.synonyms = (newEntry.synonyms || []).concat(content.split(',').map(s => s.trim().replace(/[.\*\s]$/, '')));
        } else if (trimmedPart.startsWith('R.')) {
            const content = trimmedPart.substring(2).trim();
            newEntry.roots = (newEntry.roots || []).concat(content.split(',').map(s => s.trim().replace(/[.\s]$/, '')));
        } else if (trimmedPart.startsWith('véa.')) {
            const content = trimmedPart.substring(4).trim();
            newEntry.see_also = (newEntry.see_also || []).concat(content.split(',').map(s => s.trim().replace(/[.\s]$/, '')));
        } else if (trimmedPart.startsWith('Dícese')) {
            const content = trimmedPart.substring(6).trim();
            newEntry.alt_spellings = (newEntry.alt_spellings || []).concat(content.split(',').map(s => s.trim().replace(/[.\s]$/, '')));
        }
    });

    if (newEntry.variants && newEntry.variants.length === 0) delete newEntry.variants;
    if (newEntry.examples && newEntry.examples.length === 0) delete newEntry.examples;
    if (newEntry.synonyms && newEntry.synonyms.length === 0) delete newEntry.synonyms;
    if (newEntry.roots && newEntry.roots.length === 0) delete newEntry.roots;
    if (newEntry.see_also && newEntry.see_also.length === 0) delete newEntry.see_also;
    if (newEntry.alt_spellings && newEntry.alt_spellings.length === 0) delete newEntry.alt_spellings;

    return newEntry;
}

fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2), 'utf8');

console.log(`\nPrecision parsing complete!`);
console.log(`${dictionary.length} structured entries written to ${outputPath}`);
