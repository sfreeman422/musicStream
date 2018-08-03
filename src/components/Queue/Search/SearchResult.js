import React from 'react';
import PropTypes from 'prop-types';
import './SearchResult.css';

const SearchResult = ({
  searchItem,
  addToPlaylist,
  roomId,
  userId,
}) => {
  const addObject = {
    video_id: searchItem.id.videoId,
    title: searchItem.snippet.title,
    thumbnail: searchItem.snippet.thumbnails.default.url,
    roomId,
    userId,
  };

  return (
    <td>
      <div className="videoResult">
        <div className="thumbnail-section">
          <img
            src={searchItem.snippet.thumbnails.default.url}
            id="thumbnail"
            alt="YouTube Thumbail"
          />
        </div>
        <div className="video-title">
          {searchItem.snippet.title}
        </div>
      </div>
      <div className="resultButtons">
        <button onClick={() => addToPlaylist(addObject)}>Add</button>
        <button onClick={() => console.log('should preview')}>Preview</button>
      </div>
    </td>
  );
};

export default SearchResult;

SearchResult.propTypes = {
  searchItem: PropTypes.object.isRequired,
  addToPlaylist: PropTypes.func.isRequired,
  roomId: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
};
