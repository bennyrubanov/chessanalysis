const { getResults } = require('./index.ts');


/**
 *
 * @param results.json
 * @returns final analysis results of all files created and deleted in streaming_partial_decompresser
 */
const aggregateResults = () => {
    const results = getResults();
  };
  
  // Call the function after all files have been processed
  aggregateResults();