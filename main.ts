import { App, Notice, Plugin, TFile, normalizePath, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
  baseFolder: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  baseFolder: 'Life'
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    console.log('Loading MyPlugin...');

    await this.loadSettings();

    this.addCommand({
      id: 'new-daily-note',
      name: 'New Daily Note',
      callback: async () => {
        await this.createDailyNote();
      },
    });

    this.addSettingTab(new MyPluginSettingTab(this.app, this));
  }

  onunload() {
    console.log('Unloading MyPlugin...');
  }

  async createDailyNote() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2,'0');
    const day = String(today.getDate()).padStart(2, '0');
    const noteTitle = `${day}-${month}-${year}`;
    const folderPath = normalizePath(`${this.settings.baseFolder}/${year}/${month}`);
    const filePath = `${folderPath}/${noteTitle}.md`;


    const folderExists = await this.app.vault.adapter.exists(folderPath);
    if (!folderExists) {
      await this.app.vault.createFolder(folderPath);
    }


    const fileExists = await this.app.vault.adapter.exists(filePath);
    if (!fileExists) {
      const content = `# ${noteTitle}\n\n`;
      await this.app.vault.create(filePath, content);
      new Notice(`Daily note created: ${filePath}`);
    } else {
      new Notice(`Daily note already exists: ${filePath}`);
    }


    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      this.app.workspace.getLeaf(true).openFile(file);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class MyPluginSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for MyPlugin' });

    new Setting(containerEl)
      .setName('Base Folder')
      .setDesc('Base folder for daily notes')
      .addText(text => text
        .setPlaceholder('Enter base folder')
        .setValue(this.plugin.settings.baseFolder)
        .onChange(async (value) => {
          this.plugin.settings.baseFolder = value;
          await this.plugin.saveSettings();
        }));
  }
}