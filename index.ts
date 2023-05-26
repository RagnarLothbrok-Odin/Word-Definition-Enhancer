import axios from 'axios';
import { readFile, writeFile } from 'fs';

type WordData = string;

interface UpdatedWordData {
    word: string;
    definition: string[];
    type: string;
}

const apiKey = '9b226440-a339-4ed7-a43e-2e8569f8c0e6';

async function getWordInfo(word: string): Promise<UpdatedWordData | null> {
    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data[0];

        if (!data) {
            console.warn(`No data found for word: ${word}`);
            return null;
        }

        const definition = Array.isArray(data.shortdef) ? data.shortdef : [];
        const type = data.fl || '';

        return {
            word,
            type,
            definition,
        };
    } catch (error) {
        console.error(`Error fetching data for word: ${word}`, error);
        return null;
    }
}

async function processWords(words: WordData): Promise<UpdatedWordData[]> {
    const updatedWords: UpdatedWordData[] = [];
    const totalWords = words.length;

    for (let i = 0; i < totalWords; i++) {
        const wordData = words[i];
        const info = await getWordInfo(wordData);

        if (info) {
            updatedWords.push(info);
        }

        await sleep(1000);
        console.log(`Processed word ${i + 1}/${totalWords}`);
    }

    return updatedWords;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    readFile('words.json', 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading JSON data from file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        const updatedData = await processWords(jsonData);

        writeFile('updated_words.json', JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                console.error('Error writing updated data to file:', err);
            } else {
                console.log('Updated data successfully written to file.');
            }
        });
    });
}

main();
