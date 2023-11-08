import axios from 'axios';
import { readFile, writeFile } from 'fs';
import 'dotenv/config'

type WordData = string;

interface UpdatedWordData {
    word: string;
    pronunciation: string;
    partOfSpeech: string;
    definition: string[];
}

const { apiKey } = process.env;

async function getWordInfo(word: string): Promise<UpdatedWordData | null> {
    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data[0];

        if (!data) {
            console.warn(`No data found for word: ${word}`);
            return null;
        }

        const pronunciation = data.hwi.hw ? data.hwi.hw.replace(/\*/g, ' - ') : '';
        const definition = Array.isArray(data.shortdef) ? data.shortdef : [];
        const partOfSpeech = data.fl || '';

        return {
            word,
            pronunciation,
            partOfSpeech,
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

(async function() {
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
})();
