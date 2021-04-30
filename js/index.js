const app = Vue.createApp({
  data() {
    return {
      creatingFile: false,
      files: [],
      newFileName: "New File",
      selected: null,
      loaded: false,
      contextMenu: {},
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
