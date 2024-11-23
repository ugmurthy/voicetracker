// Courtesy : claude Sonnet 3.5
/*
Prompt: I am using REMIX run web framework to build and app. 
On the client side i want two functions to write to LocalStorage 
and be assessible to subsequent sessions. 
The obj to be stored is a called result which is a json object. 
I would like subsequent result to be stored in the same localStorage 
flushing our any results that are older. The max results to be stored is 10
*/
// Constants
const STORAGE_KEY = 'SpeechResults';
const MAX_RESULTS = 3;

/**
 * Saves a new result to localStorage, maintaining only the 10 most recent entries
 * @param {Object} result - The result object to store as STRING
 * NOTE: The object is stored as string
 */
export const saveResult = (result) => {
  try {
    if (!result) {
      return true;
    }
    // Get existing results
    const existingResults = getResults();
    
    // Add timestamp to track recency
    const resultWithTimestamp = {
      result:JSON.stringify(result),
      timestamp: new Date().toISOString()
    };

    // Add new result to the beginning of the array
    const updatedResults = [resultWithTimestamp, ...existingResults];
    
    // Keep only the MAX_RESULTS most recent entries
    const trimmedResults = updatedResults.slice(0, MAX_RESULTS);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedResults));
    
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Retrieves all stored results from localStorage
 * @returns {Array} Array of stored results, newest first
 */
export const getResults = () => {
  try {
    const storedResults = localStorage.getItem(STORAGE_KEY);
    if (!storedResults) return [];
    
    return JSON.parse(storedResults);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * Clears all stored results from localStorage
 */
export const clearResults = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};
