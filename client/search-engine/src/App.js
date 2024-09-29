import { useState } from 'react';
import axios from 'axios';

import "./App.css"

const SearchResults = ({ results }) => {
  return (
    <ul>
      {results.map((result, index) => (
        <li key={index}>
          <h3>{result.title} ({result.source})</h3>
          <p>{result.description}</p>
          <a href={result.link} target="_blank" rel="noreferrer">Go to {result.source}</a>
          <p>Views: {result.views}</p>
          {result.thumbnail && <img src={result.thumbnail} alt={result.title} />}
        </li>
      ))}
    </ul>
  );
};

const App = () => {
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // This for access or fetchthe data from the localhost:3000 (our index.js) 
  // This for access or fetch the data from your server 
const handleSearch = async () => {
  try {
      const response = await axios.get('http://192.168.29.133:3000/search', { // replace with your local IP
          params: { q: searchQuery }, // q set as searchQuery 
      });
      setResults(response.data);
  } catch (error) {
      console.error('Error fetching search results:', error);
  }
};


  return (
    <div>
    <div className='container'>
      <input className='inputel'
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for videos, articles, blogs"
      />
      <button className='btn' onClick={handleSearch}>Search</button>
      </div>
      <SearchResults results={results} className="searchResult" />
    </div>

    
  );
};

export default App;
