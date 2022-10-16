(() => {
  const downloadBtn = document.createElement("button");

  const statusMessage = document.createElement("div");
  statusMessage.innerText = "Waiting for download... Do not close this tab";
  statusMessage.style.fontSize = "1.2em";
  statusMessage.style.backgroundImage = "#1111";
  statusMessage.style.width = "800px";
  statusMessage.style.margin = "0 auto";

  let activeDownloads = [];
  let downloadQueue = [];
  const MAX_CONCURRENT_DOWNLOADS = 4;

  const findAllDownloadLinks = async () => {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const urls = Array.from(
          document.querySelectorAll(".download-title a")
        ).map((el) => el.getAttribute("href"));

        // wait until all download links available
        if (urls.every((x) => !!x)) {
          return resolve(urls);
        } else {
          return resolve(findAllDownloadLinks());
        }
      }, 500);
    });
  };

  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.command) {
      case "download_update":
        if (msg.download.state === "complete") {
          activeDownloads = activeDownloads.filter(
            (x) => x.id !== msg.download.id
          );
        }
        tick();
        break;
      case "download_started":
        // update activeDownloads with Download.id
        activeDownloads = activeDownloads.map((x) => {
          if (x.url === msg.download.url) {
            return msg.download;
          } else {
            return x;
          }
        });
        break;
    }
  });

  const download = (url) => {
    activeDownloads.push({ url: url });
    chrome.runtime.sendMessage({ command: "exec_download_urls", urls: [url] });
  };

  const tick = () => {
    const diff = MAX_CONCURRENT_DOWNLOADS - activeDownloads.length;
    const nextDownloads = downloadQueue.splice(0, diff);

    nextDownloads.forEach((x) => download(x));
    statusMessage.innerText = `Downloading (${
      activeDownloads.length + downloadQueue.length
    } remaining); Do not close this tab`;

    if (downloadQueue.length === 0) {
      statusMessage.innerText =
        "All downloads triggered; You can close this tab";
    }
  };

  const fireDownload = async () => {
    downloadBtn.innerText = "Downloading All Purchases...";

    document
      .querySelector(".download-extras")
      .insertAdjacentElement("afterend", statusMessage);

    const urls = await findAllDownloadLinks();
    downloadQueue.push(...urls);
    tick();

    statusMessage.innerText = "Downloading";
  };

  downloadBtn.innerText = "Auto Download All Purchases";
  downloadBtn.style.margin = "0 0 0 8px";
  downloadBtn.style.padding = ".2em .3em";
  downloadBtn.style.fontSize = "12pt";
  downloadBtn.style.fontWeight = "bold";
  downloadBtn.addEventListener("click", fireDownload);

  document.querySelector(".download-extras").appendChild(downloadBtn);
})();
