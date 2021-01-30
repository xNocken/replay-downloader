const downloadFile = require("./downloadFile");

const baseFolderUrl = 'https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplays/public%2F';

const handleDownload = (chunks, matchId, deviceAuth, callback, results = [], updateCallback) => {
  const nextChunk = chunks.shift();

  if (!nextChunk) {
    callback(results);

    return;
  }

  downloadFile(`${ baseFolderUrl }${ matchId }%2F${ nextChunk.Id }.bin`, deviceAuth, (data, err) => {
    if (!data) {
      callback(false, err);

      return;
    }

    results.push({
      ...nextChunk,
      size: nextChunk.size + data.length,
      data: data,
    });

    updateCallback(nextChunk.chunkType);

    handleDownload(chunks, matchId, deviceAuth, callback, results, updateCallback);
  }, nextChunk.encoding)
}

module.exports = handleDownload;
