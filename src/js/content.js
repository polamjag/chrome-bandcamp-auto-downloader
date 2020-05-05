(() => {
  const fireDownload = () => {
    const urls = Array.from(
      document.querySelectorAll(".download-title a")
    ).map((el) => el.getAttribute("href"));
    chrome.runtime.sendMessage({ command: "exec_download_urls", urls });
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.innerText = "Auto Download All Purchases";
  downloadBtn.style.margin = "0 0 0 8px";
  downloadBtn.style.padding = ".2em .3em";
  downloadBtn.style.fontSize = "12pt";
  downloadBtn.style.fontWeight = "bold";
  downloadBtn.addEventListener("click", fireDownload);

  document.querySelector(".download-extras").appendChild(downloadBtn);
})();
