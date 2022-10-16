(() => {
  const downloadBtn = document.createElement("button");

  const findAllDownloadLinks = async () => {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const urls = Array.from(
          document.querySelectorAll(".download-title a")
        ).map((el) => el.getAttribute("href"));

        // wait until all download links available
        if (urls.every(x => !!x)) {
          return resolve(urls)
        } else {
          return resolve(findAllDownloadLinks());
        }
      }, 500);
    });
  };

  const fireDownload = async () => {
    downloadBtn.innerText = "Downloading All Purchases...";

    const msg = document.createElement("div");
    msg.innerText = "Waiting for download";
    msg.style.padding = ".8em";
    msg.style.backgroundImage = "#1111";
    downloadBtn.insertAdjacentElement("afterend", msg);

    const urls = await findAllDownloadLinks();
    chrome.runtime.sendMessage({ command: "exec_download_urls", urls });

    msg.innerText = "Started Downloading"
  };

  downloadBtn.innerText = "Auto Download All Purchases";
  downloadBtn.style.margin = "0 0 0 8px";
  downloadBtn.style.padding = ".2em .3em";
  downloadBtn.style.fontSize = "12pt";
  downloadBtn.style.fontWeight = "bold";
  downloadBtn.addEventListener("click", fireDownload);

  document.querySelector(".download-extras").appendChild(downloadBtn);
})();
