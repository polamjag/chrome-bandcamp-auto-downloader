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
            return resolve(downloadItems[0]);
          }
          return reject(`DownloadItem not found for id ${this.currentDownloadId}`);
        }
      );
    });
  }

  async canFinalizeDownload() {
    const currentDownloadItem = await this.getCurrentDownloadItem();
    // https://developer.chrome.com/extensions/downloads#type-State
    return (
      currentDownloadItem.state === "complete" ||
      currentDownloadItem.state === "interrupted"
    );
  }

  finalizeDownload() {
    console.log(`finalize download id ${this.currentDownloadId} (url: ${this.currentDownloadUrl})`);
    this.currentDownloadUrl = undefined;
    this.currentDownloadId = undefined;
  }

  async updateState() {
    if (this.isFree()) {
      return;
    }

    const currentDownloadItem = await this.getCurrentDownloadItem();
    if (!currentDownloadItem) {
      return;
    }

    console.log(
      `updateState: download id ${this.currentDownloadId}, state ${currentDownloadItem.state}`
    );

    if (await this.canFinalizeDownload()) {
      this.finalizeDownload();
    }
  }
}

class BulkDownloader {
  constructor(urls) {
    this.downloaders = Array.from({ length: 4 }, () => new Downloader());
    this.queue = urls;
  }

  fire() {
    this.kickTick();
  }

  async kickTick() {
    await this.tick();
    if (this.hasNext()) {
      window.setTimeout(() => {
        this.kickTick();
      }, 500);
    }
  }

  hasNext() {
    return this.queue.length > 0;
  }

  getNextJob() {
    return this.queue.shift();
  }

  async tick() {
    await Promise.all(
      this.downloaders.map(async (downloader) => {
        await downloader.updateState();
        if (downloader.isFree() && this.hasNext()) {
          downloader.download(this.getNextJob());
        }
      })
    );
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
