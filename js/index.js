const app = Vue.createApp({
  data() {
    return {
      creatingFile: false,
      files: [],
      newFileName: "New File",
      selected: null,
      loaded: false,
      contextMenu: {},
      icons: [
        {
          path: "./images/upload-file.svg",
          click: this.clickFileInput,
        },
        {
          path: "./images/github.svg",
          click: this.openGitHub,
        },
      ],
    };
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
            click: this.removeFile,
          },
          {
            name: "Rename File",
            click: this.renameFile,
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
    removeFile() {
      if (this.files.length - 2 < this.selected)
        this.selected =
          this.files.length - 2 >= 0 ? this.files.length - 2 : null;
      this.files.splice(this.contextMenu.extra.index, 1);
      this.hideContextMenu();
    },
    renameFile() {
      this.hideContextMenu();
      let file = this.files[this.contextMenu.extra.index];
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
  mounted() {
    this.createFile("File", "Start Typing!");
    this.selected = 0;
    this.loaded = true;
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
