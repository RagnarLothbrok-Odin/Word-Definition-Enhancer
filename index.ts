import axios from 'axios';
import { readFile, writeFile, existsSync, readFileSync } from 'fs';
import 'dotenv/config'
import * as process from "process";

type WordData = string;

interface UpdatedWordData {
    word: string;
    pronunciation: string;
    partOfSpeech: string;
    definition: string[];
}

/**
 * Checks if the "words.json" file exists and is a valid JSON file.
 * If the file does not exist or is not valid, it displays an error message and exits the program.
 */
if (!existsSync('words.json')) {
    const jsonData = JSON.parse(readFileSync('words.json', 'utf8'));
    if (!jsonData) {
        console.log('[Word Definition Enhancer] The file "words.json" is empty or not a valid JSON file.');
        process.exit(1);
    }
}

/**
 * Checks if the "updated_words.json" file exists.
 * If it exists, it displays a message to prevent accidental overwrites and exits the program.
 */
if (existsSync('updated_words.json')) {
    console.log('[Word Definition Enhancer] To prevent accidental overwrites, please remove the existing "updated_words.json" file.');
    process.exit(1);
}

const { apiKey } = process.env;

/**
 * Retrieves word information from an external API.
 * @param word - The word for which to fetch information.
 * @returns The word information or null if no data is found.
 */
async function getWordInfo(word: string): Promise<UpdatedWordData | null> {
    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data[0];

        if (!data) {
            console.warn(`[Word Definition Enhancer] No data found for word: ${word}`);
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
        console.error(`[Word Definition Enhancer] Error fetching data for word: ${word}`, error);
        return null;
    }
}

/**
 * Processes an array of words to obtain word definitions and pronunciation.
 * @param words - An array of words to process.
 * @returns An array of processed word data.
 */
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
        console.log(`[Word Definition Enhancer] Processed word ${i + 1}/${totalWords}`);
    }

    return updatedWords;
}

/**
 * Delays execution for a specified duration.
 * @param ms - The duration to sleep in milliseconds.
 * @returns A Promise that resolves after the specified duration.
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function for reading JSON data, processing words, and writing updated data to a file.
 * It also calculates the time taken for the operation.
 */
(async function() {
    const startTime = new Date().getTime();

    readFile('words.json', 'utf8', async (err, data) => {
        if (err) {
            console.error('[Word Definition Enhancer] Error reading JSON data from file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        const updatedData = await processWords(jsonData);

        const endTime = new Date().getTime();
        const timeDifference = endTime - startTime;

        const minutes = Math.floor(timeDifference / 60000);
        const seconds = Math.floor((timeDifference % 60000) / 1000);

        writeFile('updated_words.json', JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                console.error('[Word Definition Enhancer] Error writing updated data to file:', err);
            } else {
                console.log(`\n[Word Definition Enhancer] Completed ${jsonData.length.toLocaleString('en')} properties!\n[Word Definition Enhancer] Time taken: ${minutes} minutes ${seconds} seconds`);
            }
        });
    });
})();
