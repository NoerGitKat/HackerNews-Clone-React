import React, { Component } from 'react';
import './App.css';
// import Search from './Search.js';
// import Table from './Table.js';
// import Button from './Button.js';

//default values
const DEFAULT_QUERY = 'redux';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

function isSearched(searchTerm) {
  return function(item) {
    return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

//stateful class component
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY
    };

    //binds the object 'this' to all functions for use
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  };

  setSearchTopstories(result) {
    this.setState({ result });
  };

  fetchSearchTopstories(searchTerm) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(error => console.log(`Beep boop an error has occurred: ${error}`))
  };

  //lifecycle method
  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopstories(searchTerm);
  };

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({ result: {...this.state.result, hits: updatedHits}});
  };

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value })
  };

  onSearchSubmit () {
    const { searchTerm } = this.state;
    this.fetchSearchTopstories(searchTerm);
  };

  render() {
    const { searchTerm, result } = this.state;

    if(!result) { return null; }
    console.log(this.state);
    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>This is a child, coming from parent!</Search>
        </div>
        { result ? <Table list={result.hits} pattern={searchTerm} onDismiss={this.onDismiss}/> : null } {/*conditional rendering*/}
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

const Table = ({ list, pattern, onDismiss }) => {
  return(
    <div className="table">
      {list.filter(isSearched(pattern)).map(item =>
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