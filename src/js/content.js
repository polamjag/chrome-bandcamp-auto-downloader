chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.command === "get_all_download_urls") {
    const urls = Array.from(
      document.querySelectorAll(".download-title a")
    ).map((el) => el.getAttribute("href"));
    console.log("[Bandcamp Auto Downloader] start downloading urls:", urls);
    sendResponse({ urls });
  }
});
