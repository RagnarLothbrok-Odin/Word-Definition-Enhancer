# Word Definition Enhancer

This Node.js script enhances word definitions and pronunciation information by fetching data from an external API. It reads a list of words from a JSON file, retrieves data for each word, and saves the updated information to an output file. Additionally, it performs checks to ensure the proper use of input and output files.

## Features

- Checks the existence and validity of the input file, `words.json`
- Prevents accidental overwrites by checking for the existence of the output file, `updated_words.json.`
- Retrieves word information including pronunciation, part of speech, and definitions from an external API.
- Delays execution between word processing to comply with API usage limits.

## Instructions

To use this script, follow these steps:

1. Clone this repository to your local machine or [download](https://github.com/RagnarLothbrok-Odin/Word-Definition-Enhancer/archive/refs/heads/main.zip) the script directly.

2. Install the required dependencies using npm:

   ```bash
   yarn install
   ```

3. Set up your API key:

- Get an API key by signing up at the [Merriam-Webster Dictionary API](https://www.dictionaryapi.com/account/my-keys).
- Rename `env.example` to `.env`, and enter your API key into the file, for example:

  ```text
  apiKey=HCPAHR0GeKWp8B
  ```

4. Run the script:

   ```bash
   yarn start
   ```

5. The script will start processing each word, fetching their definitions and pronunciation, and saving the updated data to `updated_words.json`
