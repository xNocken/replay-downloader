const downloadFileWithLink = require("./downloadFileWithLink");

const handleDownload = (chunks, matchId, deviceAuth, callback, results = [], updateCallback) => {
  const nextChunk = chunks.shift();

  if (!nextChunk) {
    callback(results);

    return;
  }

  downloadFileWithLink(nextChunk.DownloadLink, nextChunk.encoding, (data, err) => {
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
  });
}

module.exports = handleDownload;
