async function download(url) {
  return new Promise((resolve, reject) => {
    let downloadId;
    chrome.downloads.download(
      {
        url: url,
      },
      (gotDownloadId) => {
        downloadId = gotDownloadId;
      }
    );

    chrome.downloads.onChanged.addListener((downloadDelta) => {
      if (downloadDelta.id === downloadId) {
        chrome.downloads.search({ id: downloadId }, (results) => {
          const a = results.find((x) => x.id === downloadId);
          if (!a) {
            return;
          }
          if ((a.state.current = "complete")) {
            return resolve();
          } else if (a.state.current === "interrupted") {
            return reject();
          }
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
  if (msg.command === "exec_download_urls") {
    if (msg && msg.urls) {
      for await (const url of msg.urls) {
        await download(url)
      }
    } else {
      window.alert("No download urls found; please retry after reload");
    }
  }
});
