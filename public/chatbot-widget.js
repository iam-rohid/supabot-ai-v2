!(function () {
  const BTN_ID = "sb-btn";
  const IFRAME_ID = "sb-iframe";
  const OVERLAY_ID = "sb-overlay";
  const MSG_BOX_ID = "sb-msg-box";

  const s = document.querySelector('script[data-name="SB-ChatBox"]');
  if (!s) {
    return;
  }

  const xm = s.dataset.xMargin || "18";
  const ym = s.dataset.yMargin || "18";
  const p = s.dataset.position || "right";

  const btn = document.createElement("button");
  btn.id = BTN_ID;
  btn.style.backgroundColor = s.dataset.color;
  btn.style.position = "fixed";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.justifyContent = "center";
  btn.style.borderRadius = "32px";
  btn.style.width = "64px";
  btn.style.height = "64px";
  btn.style.border = "none";
  btn.style.outline = "none";
  btn.style.cursor = "pointer";
  btn.style.transition = "all 0.25s ease 0s";
  btn.style.userSelect = "none";
  btn.style.boxSizing = "border-box";
  btn.style.boxShadow = "rgba(0, 0, 0, 0.15) 0px 4px 8px";
  btn.style.zIndex = 90;
  btn.style.transform = "scale(0)";
  btn.style.opacity = 0;
  if (p === "left") {
    btn.style.left = xm + "px";
  } else {
    btn.style.right = xm + "px";
  }
  btn.style.bottom = ym + "px";

  const iframe = document.createElement("iframe");
  iframe.id = IFRAME_ID;
  iframe.src =
    `http://localhost:3000/widget/chatbot/${s.dataset.id}?` +
    "color=" +
    encodeURIComponent(s.dataset.color);
  iframe.style.position = "fixed";
  iframe.style.transition = "all 0.3s ease 0s";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.maxWidth = "400px";
  iframe.style.maxHeight = "620px";
  iframe.style.borderRadius = "10px";
  iframe.style.boxShadow = "rgba(0, 0, 0, 0.15) 0px 8px 32px";
  iframe.style.zIndex = 100;
  iframe.style.backgroundColor = "#fff";
  iframe.style.border = "1px solid #E4E4E7";
  iframe.style.boxSizing = "border-box";
  iframe.style.zIndex = 110;
  iframe.style.bottom = `${64 + Number(ym) * 2}px`;
  if (p == "left") {
    iframe.style.transformOrigin = "left bottom";
    iframe.style.left = xm + "px";
  } else {
    iframe.style.transformOrigin = "right bottom";
    iframe.style.right = xm + "px";
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.position = "fixed";
  overlay.style.cursor = "pointer";
  overlay.style.inset = 0;
  overlay.style.zIndex = 100;

  const msgBox = document.createElement("div");
  msgBox.id = MSG_BOX_ID;
  msgBox.innerText = "Hi there 👋";
  msgBox.style.padding = "12px";
  msgBox.style.backgroundColor = "#fff";
  msgBox.style.color = "#000";
  msgBox.style.fontWeight = "600";
  msgBox.style.boxShadow = "rgba(0, 0, 0, 0.15) 0px 8px 32px";
  msgBox.style.borderRadius = "6px";
  msgBox.style.position = "fixed";
  msgBox.style.zIndex = 99;
  msgBox.style.bottom = `${64 + Number(ym) * 2}px`;
  if (p === "left") {
    msgBox.style.left = xm + "px";
    msgBox.style.transformOrigin = "left bottom";
  } else {
    msgBox.style.right = xm + "px";
    msgBox.style.transformOrigin = "right bottom";
  }
  msgBox.style.transition = "all .3s ease 0s";
  msgBox.style.transform = "scale(.5)";
  msgBox.style.opacity = 0;
  msgBox.style.fontFamily =
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

  document.body.append(btn);
  document.body.append(iframe);
  document.body.append(overlay);
  document.body.append(msgBox);

  const closeMessageBox = () => {
    msgBox.style.opacity = 0;
    msgBox.style.transform = "scale(.5)";
    msgBox.style.pointerEvents = "none";
  };

  setTimeout(() => {
    btn.style.transform = "scale(1)";
    btn.style.opacity = 1;
  }, 100);

  setTimeout(() => {
    msgBox.style.transform = "scale(1)";
    msgBox.style.opacity = 1;
  }, 600);

  setTimeout(() => {
    closeMessageBox();
  }, 5000);

  let chatboxOpen = false;

  const showChatbox = () => {
    btn.innerHTML =
      "<img src='http://localhost:3000/x-icon.svg' alt='Chatbot Icon' style='width: 32px; height: 32px; object-fit: contain; padding: 0; margin: 0; pointer-events: none;' />";
    overlay.style.opacity = 1;
    overlay.style.pointerEvents = "auto";
    iframe.style.opacity = 1;
    iframe.style.pointerEvents = "auto";
    iframe.style.transform = "scale(1)";
    document.documentElement.style.overflow = "hidden";
    chatboxOpen = true;
  };

  const hideChatbox = () => {
    btn.innerHTML =
      "<img src='http://localhost:3000/chatbot-icon.svg' alt='Chatbot Icon' style='width: 32px; height: 32px; object-fit: contain; padding: 0; margin: 0; pointer-events: none;' />";
    overlay.style.opacity = 0;
    overlay.style.pointerEvents = "none";
    iframe.style.opacity = 0;
    iframe.style.pointerEvents = "none";
    iframe.style.transform = "scale(0)";
    document.documentElement.style.overflow = "unset";
    chatboxOpen = false;
  };

  hideChatbox();

  overlay.onclick = () => {
    hideChatbox();
  };

  btn.onclick = () => {
    if (!chatboxOpen) {
      showChatbox();
      closeMessageBox();
    } else {
      hideChatbox();
    }
  };

  btn.onmouseover = () => {
    btn.style.transform = "scale(1.1)";
  };
  btn.onmousedown = () => {
    btn.style.transform = "scale(0.9)";
  };
  btn.onmouseleave = () => {
    btn.style.transform = "scale(1)";
  };
})();
