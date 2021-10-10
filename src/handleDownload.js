const downloadFileWithLink = require('./downloadFileWithLink');

const handleDownload = async (chunks, maxConcurrentDownloads, updateCallback) => {
  const downloads = [];
  const results = [];

  chunks.splice(0, maxConcurrentDownloads || Infinity).forEach((chunk, index) => {
    const download = async () => {
      const data = await downloadFileWithLink(chunk.DownloadLink, chunk.encoding);

      results[index] = {
        ...chunk,
        size: chunk.size + data.length,
        data,
      };

      updateCallback(chunk.chunkType);
    };

    downloads.push(download());
  });

  await Promise.all(downloads);

  if (chunks.length) {
    results.push(...await handleDownload(chunks, maxConcurrentDownloads, updateCallback));
  }

  return results;
};

module.exports = handleDownload;
