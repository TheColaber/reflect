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
      styles: {
        textSize: 20,
      },
      creatingFile: false,
      newFileName: "New File",
      selected: null,
      loaded: false,
      contextMenu: {},
      tooltip: {},
      icons: [
        {
          name: "Upload",
          path: "./images/upload-file.svg",
          click: this.clickFileInput,
        },
        {
          name: "GitHub",
          path: "./images/github.svg",
          click: this.openGitHub,
        },
      ],
    };
  },
  computed: {
    cssVariables() {
      return `
      --textSize: ${this.styles.textSize}px;
      `;
    },
  },
  mounted() {
    if (files.length === 0) {
      this.createFile("File", "Start Typing!");
    }
    this.selected = 0;

    addEventListener("mousemove", (event) => {
      clearTimeout(this.tooltip.timeout);
      const found = this.tooltips.find((tooltip) =>
        event.path.includes(tooltip.el)
      );
      // found.value
      if (!found) return (this.tooltip.show = false);
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
      let fileInput = this._.refs.fileInput;
      fileInput.click();
      const callback = (event) => {
        console.log(event);
      };

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
  },
  watch: {
    files: {
      handler(files) {
        localStorage.files = JSON.stringify(files);
      },
      deep: true,
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
      if (!(el === event.target || el.contains(event.target))) {
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
