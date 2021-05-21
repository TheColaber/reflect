let files = [];
if (localStorage.files) {
  try {
    files = JSON.parse(localStorage.files);
  } catch (e) {}
}
let tooltips = [];
const app = Vue.createApp({
  data() {
    return {
      files,
      tooltips,
      newFileName: "New File",
      darkMode: localStorage.darkMode === "true",
      contextMenu: {},
      tooltip: {},
      icons: [
        {
          id: "upload",
          name: "Upload",
          path: "./images/upload-file.svg",
          click: this.clickFileInput,
        },
        {
          id: "github",
          name: "GitHub",
          path: "./images/github.svg",
          click: this.openGitHub,
        },
        {
          id: "mode",
          name: "Toggle Mode",
          path: "",
          click: this.toggleMode,
        },
        {
          id: "left",
          name: "Hide Sidebar",
          path: "./images/left.svg",
          click: this.hideSidebar,
        },
      ],
      tools: [
        "bold",
        "italic",
        "underline",
        {
          tool: "backColor",
          name: "background",
          children: [
            "red",
            "orange",
            "yellow",
            "green",
            "blue",
            "purple",
            "white",
            "black",
            "transparent",
          ],
        },
        {
          tool: "microphone",
          name: "BETA - record",
          click: this.recordAudio,
        },
      ],
      toolDropdown: null,
      selected: null,
      creatingFile: false,
      loaded: false,
      showSidebar: false,
      textareaContent: "",
      recording: {
        mediaRecorder: null,
        chunks: [],
      },
    };
  },
  computed: {},
  mounted() {
    if (files.length === 0) {
      this.createFile("File");
    }
    this.selected = 0;

    this.setDarkModeIcon();

    addEventListener("mousemove", (event) => {
      clearTimeout(this.tooltip.timeout);
      const found = this.tooltips.find((tooltip) =>
        event.path.includes(tooltip.el)
      );
      if (!found || !found.value) return (this.tooltip.show = false);
      const showTooltip = () => {
        this.tooltip.x = event.clientX + 10;
        this.tooltip.y = event.clientY + 10;
        this.tooltip.value = found.value;
        this.tooltip.show = true;
      };
      if (found.wait) {
        this.tooltip.timeout = setTimeout(showTooltip, 1000);
        return;
      }
      showTooltip();
    });

    this.loaded = true;
  },
  methods: {
    createFile(name, content = "") {
      this.files.push({
        name,
        content,
      });
      this.creatingFile = false;
      this.newFileName = "New File";
      this.selected = this.files.length - 1;
    },
    showContextMenu(event, { sidebarItem }) {
      if (sidebarItem) {
        this.contextMenu.extra = {
          index: sidebarItem.index,
        };
        this.contextMenu.items = [
          {
            name: "Remove File",
            click: () => {
              this.removeFile(this.contextMenu.extra.index);
            },
          },
          {
            name: "Rename File",
            click: () => {
              this.renameFile(this.contextMenu.extra.index);
            },
          },
          {
            name: "Download File",
            click: this.downloadFile,
          },
        ];
        this.contextMenu.x = event.clientX;
        this.contextMenu.y = event.clientY;
        this.contextMenu.show = true;
      }
    },
    hideContextMenu() {
      this.contextMenu.show = false;
    },
    removeFile(index = this.selected) {
      if (this.files.length - 2 < this.selected)
        this.selected =
          this.files.length - 2 >= 0 ? this.files.length - 2 : null;
      this.files.splice(index, 1);
      this.hideContextMenu();
    },
    renameFile(index = this.selected) {
      this.hideContextMenu();
      let file = this.files[index];
      file.editing = true;
      this.showSidebar = true;
      window.event.stopPropagation(); // TODO: Do this in the DOM
    },
    downloadFile() {
      let file = this.files[this.contextMenu.extra.index];
      const url = window.URL.createObjectURL(
        new Blob([file.content], {
          type: "text/plain",
        })
      );
      const downloadA = document.createElement("a");
      downloadA.href = url;
      downloadA.download = file.name + ".txt";
      document.body.appendChild(downloadA);
      downloadA.click();
      window.URL.revokeObjectURL(url);
      downloadA.remove();
      this.hideContextMenu();
    },

    clickFileInput() {
      let fileInput = this.$refs.fileInput;
      fileInput.click();
      fileInput.addEventListener(
        "change",
        (event) => {
          let file = fileInput.files[0];
          var reader = new FileReader();
          reader.readAsText(file, "UTF-8");
          reader.onload = (event) => {
            this.createFile(file.name.split(".")[0], event.target.result);
          };
        },
        { once: true }
      );
    },
    openGitHub() {
      location.href = "https://github.com/TheColaber/reflect";
    },
    toggleMode() {
      this.darkMode = !this.darkMode;
      this.setDarkModeIcon();
    },
    setDarkModeIcon() {
      this.icons.find((icon) => icon.id == "mode").path = this.darkMode
        ? "./images/sun.svg"
        : "./images/moon.svg";
    },
    toolPress(tool, child) {
      this.$refs.textarea.focus();
      if (tool.click) return tool.click();
      if (tool.children?.length && !child) {
        this.toolDropdown = tool.tool;
        return;
      }
      this.hideToolDropdown();
      document.execCommand(tool.tool || tool, false, child);
    },
    hideToolDropdown() {
      this.toolDropdown = null;
    },
    hideSidebar() {
      this.showSidebar = false;
    },
    async recordAudio() {
      if (!window.navigator?.mediaDevices?.getUserMedia) return;
      if (this.recording.mediaRecorder) {
        this.recording.mediaRecorder.stop();
        this.recording.mediaRecorder.onstop = (e) => {
          const blob = new Blob(this.recording.chunks, {
            type: "audio/ogg; codecs=opus",
          });

          var a = new FileReader();
          a.onload = (e) => {
            this.files[this.selected].content += `
            <div>&nbsp;<audio controls src="${e.target.result}"></audio>&nbsp;</div>`;
            this.textareaContent = this.files[this.selected].content;

            this.recording.chunks = [];
            this.recording.mediaRecorder = null;
            this.$refs.textarea.focus();
          };
          a.readAsDataURL(blob);
        };
        return;
      }

      let error = false;
      const stream = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .catch(() => (error = true));
      if (error) return;
      this.recording.mediaRecorder = new MediaRecorder(stream);
      this.recording.mediaRecorder.start();

      this.recording.mediaRecorder.ondataavailable = (e) => {
        this.recording.chunks.push(e.data);
      };
      //tools.find((tool) => tool.tool == "microphone");
    },
  },
  watch: {
    files: {
      handler(files) {
        localStorage.files = JSON.stringify(files);
      },
      deep: true,
    },
    darkMode(mode) {
      localStorage.darkMode = mode;
    },
    selected(selected) {
      if (selected == null) return;
      this.textareaContent = this.files[selected].content;
    },
  },
});

app.directive("focus", {
  mounted(el) {
    el.focus();
  },
});
app.directive("select", {
  mounted(el) {
    setTimeout(() => {
      el.select();
    }, 0);
  },
});
app.directive("title", {
  mounted(el, binding) {
    tooltips.push({ el, value: binding.value, wait: binding.arg === "wait" });
  },
});
app.directive("click-outside", {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (
        !(el === event.target || el.contains(event.target)) &&
        getComputedStyle(el).display != "none"
      ) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener("click", el.clickOutsideEvent);
  },
});

app.mount("#app");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./js/service-worker.js");
}
