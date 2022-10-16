function download(url) {
  chrome.downloads.download(
    {
      url: url,
    },
    (gotDownloadId) => {
      chrome.tabs.query({ url: "https://bandcamp.com/download*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            command: "download_started",
            download: {
              id: gotDownloadId,
              url: url,
            },
          });
        });
      });
    }
  );
}

chrome.downloads.onChanged.addListener((downloadDelta) => {
  chrome.downloads.search({ id: downloadDelta.id }, async (results) => {
    const found = results.find((x) => x.id === downloadDelta.id);
    if (!found) {
      return;
    }

    chrome.tabs.query({ url: "https://bandcamp.com/download*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          command: "download_update",
          download: {
            id: found.id,
            url: found.url,
            state: found.state,
          },
        });
      });
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.command === "exec_download_urls") {
    if (msg && msg.urls) {
      for (const url of msg.urls) {
        download(url);
      }
    } else {
      window.alert("No download urls found; please retry after reload");
    }
  }
});
