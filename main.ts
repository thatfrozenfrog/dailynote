import { 
  App, 
  Notice, 
  Plugin, 
  TFile, 
  normalizePath, 
  PluginSettingTab, 
  Setting, 
  MarkdownView, 
  Modal, 
  FuzzySuggestModal 
} from 'obsidian';

interface SuikaUltilitySettings {
  baseFolder: string;
  baseClassFolder: string;
}

const DEFAULT_SETTINGS: SuikaUltilitySettings = {
  baseFolder: 'Life',
  baseClassFolder: 'Class'
};



export default class SuikaUltility extends Plugin {
  settings: SuikaUltilitySettings;

  async onload() {
    console.log('Loading SuikaUltility...');

    await this.loadSettings();

    this.addCommand({
      id: 'new-daily-note',
      name: 'New Daily Note',
      callback: async () => {
        await this.createDailyNote();
      },
    });

    this.addCommand({
      id: 'new-class-note',
      name: 'New Class Note',
      callback: async () => {
        await this.createClassNote();
      },
    });


    this.addSettingTab(new SuikaUltilitySettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on('editor-paste', this.handlePaste.bind(this))
    );
  }

  onunload() {
    console.log('Unloading SuikaUltility...');
  }

  handlePaste(evt: ClipboardEvent, editor: CodeMirror.Editor, markdownView: MarkdownView) {
    const clipboardData = evt.clipboardData;
    if (!clipboardData) {
      return;
    }

    const text = clipboardData.getData('text');
    const imgurRegex = /^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.png$/;
    const matches = text.match(imgurRegex);
    if (matches) {
      evt.preventDefault();
      const formattedText = matches.map(link => `![](${link})`).join('\n');
      editor.replaceSelection(formattedText);
    }

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

  async createClassNote() {
    const folder = await new FolderPickerModal(this.app, this.settings.baseClassFolder).openModal();
    if (!folder) {
      new Notice("No folder selected. Operation canceled.");
      return;
    }
  
    const modal = new FilenameModal(this.app, async (filename) => {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      const fullFilename = `${formattedDate} ${filename.trim()}.md`;
      const filePath = normalizePath(`${folder}/${fullFilename}`);
  
      const fileExists = await this.app.vault.adapter.exists(filePath);
      if (!fileExists) {
        const content = `# ${filename.trim()}\n\n`;
        await this.app.vault.create(filePath, content);
        new Notice(`Class note created: ${filePath}`);
      } else {
        new Notice(`Class note already exists: ${filePath}`);
      }
  
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file instanceof TFile) {
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
}

class SuikaUltilitySettingTab extends PluginSettingTab {
  plugin: SuikaUltility;

  constructor(app: App, plugin: SuikaUltility) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for SuikaUltility' });

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
    
    new Setting(containerEl)
      .setName('Base Class Folder')
      .setDesc('Base folder for class notes')
      .addText(text => text
        .setPlaceholder('Enter base class folder')
        .setValue(this.plugin.settings.baseClassFolder)
        .onChange(async (value) => {
          this.plugin.settings.baseClassFolder = value;
          await this.plugin.saveSettings();
        }));
  }
}

class FolderPickerModal extends FuzzySuggestModal<string> {
  baseFolder: string;
  resolve: (value: string | PromiseLike<string>) => void;

  constructor(app: App, baseFolder: string) {
    super(app);
    this.baseFolder = baseFolder;
  }

  getItems(): string[] {
    const folderItems = this.app.vault.getAllLoadedFiles()
      .filter(f => f.path.startsWith(this.baseFolder) && !(f instanceof TFile))
      .map(f => f.path);
    return folderItems.length > 0 ? folderItems : [this.baseFolder];
  }

  getItemText(item: string): string {
    return item;
  }

  onChooseItem(item: string): void {
    this.resolve(item);
  }

  openModal(): Promise<string> {
    return new Promise(resolve => {
      this.resolve = resolve;
      this.open();
    });
  }
}

class FilenameModal extends Modal {
  onSubmit: (filename: string) => void;

  constructor(app: App, onSubmit: (filename: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Enter Filename' });

    const input = contentEl.createEl('input', { type: 'text' });
    input.style.width = '100%';
    input.placeholder = 'Enter the filename here...';

    const submitButton = contentEl.createEl('button', { text: 'Submit' });
    submitButton.style.marginTop = '10px';
    submitButton.style.width = '100%';

    submitButton.addEventListener('click', () => {
      const filename = input.value.trim();
      if (filename) {
        this.onSubmit(filename);
        this.close();
      } else {
        new Notice('Filename cannot be empty!');
      }
    });

    input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        submitButton.click();
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}



//3.2.4 代码解析
