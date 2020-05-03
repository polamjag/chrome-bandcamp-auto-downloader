class Downloader {
  constructor() {
    this.currentDownloadUrl = undefined;
    this.currentDownloadId = undefined;
  }

  isFree() {
    return !this.currentDownloadUrl;
  }

  download(url) {
    if (!this.isFree()) {
      return;
    }
    this.currentDownloadUrl = url;
    chrome.downloads.download(
      {
        url,
      },
      (downloadId) => {
        this.currentDownloadId = downloadId;
        console.log(`download ${url}, got id: ${downloadId}`);
      }
    );
  }

  getCurrentDownloadItem() {
    return new Promise((resolve, reject) => {
      chrome.downloads.search(
        {
          id: this.currentDownloadId,
        },
        (downloadItems) => {
          if (downloadItems[0]) {
            resolve(downloadItems[0]);
          }
          reject(`DownloadItem not found for id ${this.currentDownloadId}`);
        }
      );
    });
  }

  // https://developer.chrome.com/extensions/downloads#type-State
  async isDownloading() {
    const currentDownloadItem = await this.getCurrentDownloadItem();
    return currentDownloadItem.state === "in_progress";
  }

  async isDownloadCompleted() {
    const currentDownloadItem = await this.getCurrentDownloadItem();
    return currentDownloadItem.state === "complete";
  }

  finalizeDownload() {
    console.log(`finalize download id ${this.currentDownloadId}`);
    this.currentDownloadUrl = undefined;
    this.currentDownloadId = undefined;
  }

  async updateState() {
    if (this.isFree()) { return; }

    const currentDownloadItem = await this.getCurrentDownloadItem();
    console.log(`download id ${this.currentDownloadId}, state ${currentDownloadItem.state}`);
    if (await this.isDownloadCompleted()) {
      this.finalizeDownload();
    }
  }
}

class BulkDownloader {
  constructor(urls) {
    this.downloaders = Array.from({ length: 4 }, () => new Downloader());
    this.queue = urls;
    this.poller = null;
  }

  fire() {
    this.poller = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  hasNext() {
    return this.queue.length > 0;
  }

  getNextJob() {
    return this.queue.shift();
  }

  tick() {
    if (!this.hasNext()) {
      window.clearInterval(this.poller);
      return;
    }

    this.downloaders.forEach((downloader) => downloader.updateState());

    this.downloaders.forEach((downloader, i) => {
      console.log(i, downloader);
      if (downloader.isFree() && this.hasNext()) {
        downloader.download(this.getNextJob());
      }
    });
  }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.command === "exec_download_urls") {
    if (msg && msg.urls) {
      const bulkDownloader = new BulkDownloader(msg.urls);
      bulkDownloader.fire();
    } else {
      window.alert("No download urls found; please retry after reload");
    }
  }
});
