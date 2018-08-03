import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SearchResult from './SearchResult';

const mapStateToProps = state => ({
  searchResults: state.searchResults,
});

const ConnectedSearchResults = ({ searchResults }) => (
  <React.Fragment>
    {searchResults
          .map((searchItem, index) => (
            <tr key={`search-result-item-${index}`}>
              <SearchResult
                searchItem={searchItem}
                addToPlaylist={this.props.addToPlaylist}
                userId={this.props.user.userId}
                roomId={this.props.roomId}
              />
            </tr>))}
  </React.Fragment>
);

ConnectedSearchResults.propTypes = {
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const SearchResults = connect(mapStateToProps)(ConnectedSearchResults);

export default SearchResults;
