import React, { Component } from 'react';
import './App.css';
// import Search from './Search.js';
// import Table from './Table.js';
// import Button from './Button.js';
import PropTypes from 'prop-types';

//default values
const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage='

// function isSearched(searchTerm) {
//   return function(item) {
//     return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// }

//stateful class component
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY
    };

    //binds the object 'this' to all functions for use
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  };

  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  };

  setSearchTopstories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : []; 

    const updatedHits = [
      ...oldHits, ...hits       // save all pages in one array, which then gets displayed
    ];

    this.setState({ results: { ...results, [searchKey]: { hits:updatedHits, page} 
      } 
    });
  };

  fetchSearchTopstories(searchTerm, page) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
      .then(response => response.json())
      .then(results => this.setSearchTopstories(results))
      .catch(error => console.log(`Beep boop an error has occurred: ${error}`))
  };

  //lifecycle method
  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  };

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({ results: { ...results, [searchKey]: { hits: updatedHits, page }
      }
    });
  };

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value })
  };

  onSearchSubmit (event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if(this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }

    event.preventDefault();
  };

  render() {
    const { searchTerm, results, searchKey } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    if(!results) { return null; }
    console.log(this.state);
    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>This is a child, coming from parent!</Search>
        </div>
        <Table list={list} onDismiss={this.onDismiss}/>
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>More...</Button>
        </div>
      </div>
    );
  };
};

export default App;


//stateless functional components
const Search = ({ value, onChange, onSubmit, children }) => {
  return (
    <form onSubmit={onSubmit}>
      <input type="text" onChange={onChange} value={value}/>
      <button type="submit">{children}</button>
    </form>
  )
};

const Button = ({ onClick, className = '', children}) => {
  return (
    <button onClick={onClick} className={className} type="button">{children}</button>
  )
};

Button.propTypes = {      //type checker to prevent bugs, validation
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};

const Table = ({ list, onDismiss }) => {
  return(
    <div className="table">
      {list.map(item =>
        <div key={item.objectID} className="table-row">
          <span style={{ width: '40%' }}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={{ width: '30%' }}>
            {item.author}
          </span>
          <span style={{ width: '10%' }}>
            {item.num_comments}
          </span>
          <span style={{ width: '10%' }}>
            {item.points}
          </span>
          <span style={{ width: '10%' }}>
            <Button
            onClick={() => onDismiss(item.objectID)}
            className="button-inline"
            >
            Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>
  )
};