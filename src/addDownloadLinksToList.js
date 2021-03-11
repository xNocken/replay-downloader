const { baseDataUrl } = require("../constants");
const getDownloadLink = require("./getDownloadLink");

const addDownloadLinksToList = (list, index, matchId, deviceAuth, callback) => {
  const currentChunk = list[index];

  if (!currentChunk) {
    callback(list);
    return;
  }

  getDownloadLink(`${baseDataUrl}${matchId}/${currentChunk.Id}.bin`, deviceAuth, (link) => {
    currentChunk.DownloadLink = link;

    addDownloadLinksToList(list, index + 1, matchId, deviceAuth, callback);
  });
};

module.exports = addDownloadLinksToList;
