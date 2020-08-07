(() => {
  const downloadBtn = document.createElement("button");

  const fireDownload = () => {
    const urls = Array.from(
      document.querySelectorAll(".download-title a")
    ).map((el) => el.getAttribute("href"));
    chrome.runtime.sendMessage({ command: "exec_download_urls", urls });

    downloadBtn.innerText = "Downloading All Purchases..."

    const msg = document.createElement('div');
    msg.innerText = 'Not working well? Please reload page and retry';
    msg.style.padding = '.8em';
    msg.style.backgroundImage = '#1111';
    downloadBtn.insertAdjacentElement('afterend', msg);
  };

  downloadBtn.innerText = "Auto Download All Purchases";
  downloadBtn.style.margin = "0 0 0 8px";
  downloadBtn.style.padding = ".2em .3em";
  downloadBtn.style.fontSize = "12pt";
  downloadBtn.style.fontWeight = "bold";
  downloadBtn.addEventListener("click", fireDownload);

  document.querySelector(".download-extras").appendChild(downloadBtn);
})();
