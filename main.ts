import { App, Notice, Plugin, TFile, normalizePath } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() {
    console.log('Loading MyPlugin...');

    // Add the "New Daily Note" command
    this.addCommand({
      id: 'new-daily-note',
      name: 'New Daily Note',
      callback: async () => {
        await this.createDailyNote();
      },
    });
  }

  onunload() {
    console.log('Unloading MyPlugin...');
  }

  async createDailyNote() {
    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const noteTitle = `${day}-${month}-${year}`;
    const folderPath = normalizePath(`Life/${year}/${month}`);
    const filePath = `${folderPath}/${noteTitle}.md`;

    // Check if the folder exists; if not, create it
    const folderExists = await this.app.vault.adapter.exists(folderPath);
    if (!folderExists) {
      await this.app.vault.createFolder(folderPath);
    }

    // Check if the note already exists; if not, create it
    const fileExists = await this.app.vault.adapter.exists(filePath);
    if (!fileExists) {
      const content = `# ${noteTitle}\n\n`; // Optional initial content
      await this.app.vault.create(filePath, content);
      new Notice(`Daily note created: ${filePath}`);
    } else {
      new Notice(`Daily note already exists: ${filePath}`);
    }

    // Open the note in the editor
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      this.app.workspace.getLeaf(true).openFile(file);
    }
  }
}
