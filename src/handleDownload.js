const { baseDataUrl } = require("../constants");
const downloadFile = require("./downloadFile");

const handleDownload = (chunks, matchId, deviceAuth, callback, results = [], updateCallback) => {
  const nextChunk = chunks.shift();

  if (!nextChunk) {
    callback(results);

    return;
  }

  downloadFile(`${baseDataUrl}${matchId}/${nextChunk.Id}.bin`, deviceAuth, (data, err) => {
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
