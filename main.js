/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MyPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  baseFolder: "Life",
  baseClassFolder: "Class"
};
var FolderPickerModal = class extends import_obsidian.FuzzySuggestModal {
  constructor(app, baseFolder) {
    super(app);
    this.baseFolder = baseFolder;
  }
  getItems() {
    const folderItems = this.app.vault.getAllLoadedFiles().filter((f) => f.path.startsWith(this.baseFolder) && !(f instanceof import_obsidian.TFile)).map((f) => f.path);
    return folderItems.length > 0 ? folderItems : [this.baseFolder];
  }
  getItemText(item) {
    return item;
  }
  onChooseItem(item) {
    this.resolve(item);
  }
  openModal() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }
};
var FilenameModal = class extends import_obsidian.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Enter Filename" });
    const input = contentEl.createEl("input", { type: "text" });
    input.style.width = "100%";
    input.placeholder = "Enter the filename here...";
    const submitButton = contentEl.createEl("button", { text: "Submit" });
    submitButton.style.marginTop = "10px";
    submitButton.style.width = "100%";
    submitButton.addEventListener("click", () => {
      const filename = input.value.trim();
      if (filename) {
        this.onSubmit(filename);
        this.close();
      } else {
        new import_obsidian.Notice("Filename cannot be empty!");
      }
    });
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        submitButton.click();
      }
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var MyPlugin = class extends import_obsidian.Plugin {
  async onload() {
    console.log("Loading MyPlugin...");
    await this.loadSettings();
    this.addCommand({
      id: "new-daily-note",
      name: "New Daily Note",
      callback: async () => {
        await this.createDailyNote();
      }
    });
    this.addCommand({
      id: "new-class-note",
      name: "New Class Note",
      callback: async () => {
        await this.createClassNote();
      }
    });
    this.addSettingTab(new MyPluginSettingTab(this.app, this));
    this.registerEvent(
      this.app.workspace.on("editor-paste", this.handlePaste.bind(this))
    );
  }
  onunload() {
    console.log("Unloading MyPlugin...");
  }
  handlePaste(evt, editor, markdownView) {
    const clipboardData = evt.clipboardData;
    if (!clipboardData) {
      return;
    }
    const text = clipboardData.getData("text");
    const imgurRegex = /^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.png$/;
    const matches = text.match(imgurRegex);
    if (matches) {
      evt.preventDefault();
      const formattedText = matches.map((link) => `![](${link})`).join("\n");
      editor.replaceSelection(formattedText);
    }
  }
  async createDailyNote() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const noteTitle = `${day}-${month}-${year}`;
    const folderPath = (0, import_obsidian.normalizePath)(`${this.settings.baseFolder}/${year}/${month}`);
    const filePath = `${folderPath}/${noteTitle}.md`;
    const folderExists = await this.app.vault.adapter.exists(folderPath);
    if (!folderExists) {
      await this.app.vault.createFolder(folderPath);
    }
    const fileExists = await this.app.vault.adapter.exists(filePath);
    if (!fileExists) {
      const content = `# ${noteTitle}

`;
      await this.app.vault.create(filePath, content);
      new import_obsidian.Notice(`Daily note created: ${filePath}`);
    } else {
      new import_obsidian.Notice(`Daily note already exists: ${filePath}`);
    }
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof import_obsidian.TFile) {
      this.app.workspace.getLeaf(true).openFile(file);
    }
  }
  async createClassNote() {
    const folder = await new FolderPickerModal(this.app, this.settings.baseClassFolder).openModal();
    if (!folder) {
      new import_obsidian.Notice("No folder selected. Operation canceled.");
      return;
    }
    const modal = new FilenameModal(this.app, async (filename) => {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
      const fullFilename = `${formattedDate} ${filename.trim()}.md`;
      const filePath = (0, import_obsidian.normalizePath)(`${folder}/${fullFilename}`);
      const fileExists = await this.app.vault.adapter.exists(filePath);
      if (!fileExists) {
        const content = `# ${filename.trim()}

`;
        await this.app.vault.create(filePath, content);
        new import_obsidian.Notice(`Class note created: ${filePath}`);
      } else {
        new import_obsidian.Notice(`Class note already exists: ${filePath}`);
      }
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file instanceof import_obsidian.TFile) {
        this.app.workspace.getLeaf(true).openFile(file);
      }
    });
    modal.open();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var MyPluginSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for MyPlugin" });
    new import_obsidian.Setting(containerEl).setName("Base Folder").setDesc("Base folder for daily notes").addText((text) => text.setPlaceholder("Enter base folder").setValue(this.plugin.settings.baseFolder).onChange(async (value) => {
      this.plugin.settings.baseFolder = value;
      await this.plugin.saveSettings();
    }));
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgXG4gIEFwcCwgXG4gIE5vdGljZSwgXG4gIFBsdWdpbiwgXG4gIFRGaWxlLCBcbiAgbm9ybWFsaXplUGF0aCwgXG4gIFBsdWdpblNldHRpbmdUYWIsIFxuICBTZXR0aW5nLCBcbiAgTWFya2Rvd25WaWV3LCBcbiAgTW9kYWwsIFxuICBGdXp6eVN1Z2dlc3RNb2RhbCBcbn0gZnJvbSAnb2JzaWRpYW4nO1xuaW50ZXJmYWNlIE15UGx1Z2luU2V0dGluZ3Mge1xuICBiYXNlRm9sZGVyOiBzdHJpbmc7XG4gIGJhc2VDbGFzc0ZvbGRlcjogc3RyaW5nO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBNeVBsdWdpblNldHRpbmdzID0ge1xuICBiYXNlRm9sZGVyOiAnTGlmZScsXG4gIGJhc2VDbGFzc0ZvbGRlcjogJ0NsYXNzJ1xufTtcblxuY2xhc3MgRm9sZGVyUGlja2VyTW9kYWwgZXh0ZW5kcyBGdXp6eVN1Z2dlc3RNb2RhbDxzdHJpbmc+IHtcbiAgYmFzZUZvbGRlcjogc3RyaW5nO1xuICByZXNvbHZlOiAodmFsdWU6IHN0cmluZyB8IFByb21pc2VMaWtlPHN0cmluZz4pID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGJhc2VGb2xkZXI6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5iYXNlRm9sZGVyID0gYmFzZUZvbGRlcjtcbiAgfVxuXG4gIGdldEl0ZW1zKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBmb2xkZXJJdGVtcyA9IHRoaXMuYXBwLnZhdWx0LmdldEFsbExvYWRlZEZpbGVzKClcbiAgICAgIC5maWx0ZXIoZiA9PiBmLnBhdGguc3RhcnRzV2l0aCh0aGlzLmJhc2VGb2xkZXIpICYmICEoZiBpbnN0YW5jZW9mIFRGaWxlKSlcbiAgICAgIC5tYXAoZiA9PiBmLnBhdGgpO1xuICAgIHJldHVybiBmb2xkZXJJdGVtcy5sZW5ndGggPiAwID8gZm9sZGVySXRlbXMgOiBbdGhpcy5iYXNlRm9sZGVyXTtcbiAgfVxuXG4gIGdldEl0ZW1UZXh0KGl0ZW06IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBvbkNob29zZUl0ZW0oaXRlbTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZXNvbHZlKGl0ZW0pO1xuICB9XG5cbiAgb3Blbk1vZGFsKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH0pO1xuICB9XG59XG5cbmNsYXNzIEZpbGVuYW1lTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIG9uU3VibWl0OiAoZmlsZW5hbWU6IHN0cmluZykgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgb25TdWJtaXQ6IChmaWxlbmFtZTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLm9uU3VibWl0ID0gb25TdWJtaXQ7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0VudGVyIEZpbGVuYW1lJyB9KTtcblxuICAgIGNvbnN0IGlucHV0ID0gY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnIH0pO1xuICAgIGlucHV0LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGlucHV0LnBsYWNlaG9sZGVyID0gJ0VudGVyIHRoZSBmaWxlbmFtZSBoZXJlLi4uJztcblxuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnU3VibWl0JyB9KTtcbiAgICBzdWJtaXRCdXR0b24uc3R5bGUubWFyZ2luVG9wID0gJzEwcHgnO1xuICAgIHN1Ym1pdEJ1dHRvbi5zdHlsZS53aWR0aCA9ICcxMDAlJztcblxuICAgIHN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gaW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgaWYgKGZpbGVuYW1lKSB7XG4gICAgICAgIHRoaXMub25TdWJtaXQoZmlsZW5hbWUpO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXcgTm90aWNlKCdGaWxlbmFtZSBjYW5ub3QgYmUgZW1wdHkhJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICBzdWJtaXRCdXR0b24uY2xpY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uQ2xvc2UoKSB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15UGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IE15UGx1Z2luU2V0dGluZ3M7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nIE15UGx1Z2luLi4uJyk7XG5cbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmV3LWRhaWx5LW5vdGUnLFxuICAgICAgbmFtZTogJ05ldyBEYWlseSBOb3RlJyxcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlRGFpbHlOb3RlKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmV3LWNsYXNzLW5vdGUnLFxuICAgICAgbmFtZTogJ05ldyBDbGFzcyBOb3RlJyxcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQ2xhc3NOb3RlKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG5cbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IE15UGx1Z2luU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKCdlZGl0b3ItcGFzdGUnLCB0aGlzLmhhbmRsZVBhc3RlLmJpbmQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIGNvbnNvbGUubG9nKCdVbmxvYWRpbmcgTXlQbHVnaW4uLi4nKTtcbiAgfVxuXG4gIGhhbmRsZVBhc3RlKGV2dDogQ2xpcGJvYXJkRXZlbnQsIGVkaXRvcjogQ29kZU1pcnJvci5FZGl0b3IsIG1hcmtkb3duVmlldzogTWFya2Rvd25WaWV3KSB7XG4gICAgY29uc3QgY2xpcGJvYXJkRGF0YSA9IGV2dC5jbGlwYm9hcmREYXRhO1xuICAgIGlmICghY2xpcGJvYXJkRGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRleHQgPSBjbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQnKTtcbiAgICBjb25zdCBpbWd1clJlZ2V4ID0gL15odHRwczpcXC9cXC9pXFwuaW1ndXJcXC5jb21cXC9bYS16QS1aMC05XStcXC5wbmckLztcbiAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaChpbWd1clJlZ2V4KTtcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCBmb3JtYXR0ZWRUZXh0ID0gbWF0Y2hlcy5tYXAobGluayA9PiBgIVtdKCR7bGlua30pYCkuam9pbignXFxuJyk7XG4gICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihmb3JtYXR0ZWRUZXh0KTtcbiAgICB9XG5cbiAgfVxuXG5cbiAgYXN5bmMgY3JlYXRlRGFpbHlOb3RlKCkge1xuICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB5ZWFyID0gdG9kYXkuZ2V0RnVsbFllYXIoKTtcbiAgICBjb25zdCBtb250aCA9IFN0cmluZyh0b2RheS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwnMCcpO1xuICAgIGNvbnN0IGRheSA9IFN0cmluZyh0b2RheS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgY29uc3Qgbm90ZVRpdGxlID0gYCR7ZGF5fS0ke21vbnRofS0ke3llYXJ9YDtcbiAgICBjb25zdCBmb2xkZXJQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLnNldHRpbmdzLmJhc2VGb2xkZXJ9LyR7eWVhcn0vJHttb250aH1gKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGAke2ZvbGRlclBhdGh9LyR7bm90ZVRpdGxlfS5tZGA7XG5cblxuICAgIGNvbnN0IGZvbGRlckV4aXN0cyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGZvbGRlclBhdGgpO1xuICAgIGlmICghZm9sZGVyRXhpc3RzKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIoZm9sZGVyUGF0aCk7XG4gICAgfVxuXG5cbiAgICBjb25zdCBmaWxlRXhpc3RzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMoZmlsZVBhdGgpO1xuICAgIGlmICghZmlsZUV4aXN0cykge1xuICAgICAgY29uc3QgY29udGVudCA9IGAjICR7bm90ZVRpdGxlfVxcblxcbmA7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoZmlsZVBhdGgsIGNvbnRlbnQpO1xuICAgICAgbmV3IE5vdGljZShgRGFpbHkgbm90ZSBjcmVhdGVkOiAke2ZpbGVQYXRofWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXcgTm90aWNlKGBEYWlseSBub3RlIGFscmVhZHkgZXhpc3RzOiAke2ZpbGVQYXRofWApO1xuICAgIH1cblxuXG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYodHJ1ZSkub3BlbkZpbGUoZmlsZSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlQ2xhc3NOb3RlKCkge1xuICAgIGNvbnN0IGZvbGRlciA9IGF3YWl0IG5ldyBGb2xkZXJQaWNrZXJNb2RhbCh0aGlzLmFwcCwgdGhpcy5zZXR0aW5ncy5iYXNlQ2xhc3NGb2xkZXIpLm9wZW5Nb2RhbCgpO1xuICAgIGlmICghZm9sZGVyKSB7XG4gICAgICBuZXcgTm90aWNlKFwiTm8gZm9sZGVyIHNlbGVjdGVkLiBPcGVyYXRpb24gY2FuY2VsZWQuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgXG4gICAgY29uc3QgbW9kYWwgPSBuZXcgRmlsZW5hbWVNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKGZpbGVuYW1lKSA9PiB7XG4gICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gYCR7U3RyaW5nKHRvZGF5LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX0tJHtTdHJpbmcodG9kYXkuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7dG9kYXkuZ2V0RnVsbFllYXIoKX1gO1xuICAgICAgY29uc3QgZnVsbEZpbGVuYW1lID0gYCR7Zm9ybWF0dGVkRGF0ZX0gJHtmaWxlbmFtZS50cmltKCl9Lm1kYDtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gbm9ybWFsaXplUGF0aChgJHtmb2xkZXJ9LyR7ZnVsbEZpbGVuYW1lfWApO1xuICBcbiAgICAgIGNvbnN0IGZpbGVFeGlzdHMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhmaWxlUGF0aCk7XG4gICAgICBpZiAoIWZpbGVFeGlzdHMpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGAjICR7ZmlsZW5hbWUudHJpbSgpfVxcblxcbmA7XG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShmaWxlUGF0aCwgY29udGVudCk7XG4gICAgICAgIG5ldyBOb3RpY2UoYENsYXNzIG5vdGUgY3JlYXRlZDogJHtmaWxlUGF0aH1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ldyBOb3RpY2UoYENsYXNzIG5vdGUgYWxyZWFkeSBleGlzdHM6ICR7ZmlsZVBhdGh9YCk7XG4gICAgICB9XG4gIFxuICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlUGF0aCk7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKHRydWUpLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG1vZGFsLm9wZW4oKTtcbiAgfVxuICBcblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxufVxuXG5jbGFzcyBNeVBsdWdpblNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBNeVBsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBNeVBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblxuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdTZXR0aW5ncyBmb3IgTXlQbHVnaW4nIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQmFzZSBGb2xkZXInKVxuICAgICAgLnNldERlc2MoJ0Jhc2UgZm9sZGVyIGZvciBkYWlseSBub3RlcycpXG4gICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdFbnRlciBiYXNlIGZvbGRlcicpXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYXNlRm9sZGVyKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYmFzZUZvbGRlciA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KSk7XG4gIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBV087QUFNUCxJQUFNLG1CQUFxQztBQUFBLEVBQ3pDLFlBQVk7QUFBQSxFQUNaLGlCQUFpQjtBQUNuQjtBQUVBLElBQU0sb0JBQU4sY0FBZ0Msa0NBQTBCO0FBQUEsRUFJeEQsWUFBWSxLQUFVLFlBQW9CO0FBQ3hDLFVBQU0sR0FBRztBQUNULFNBQUssYUFBYTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxXQUFxQjtBQUNuQixVQUFNLGNBQWMsS0FBSyxJQUFJLE1BQU0sa0JBQWtCLEVBQ2xELE9BQU8sT0FBSyxFQUFFLEtB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
