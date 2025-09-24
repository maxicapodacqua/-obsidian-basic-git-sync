import { FileSystemAdapter, Notice, Plugin } from 'obsidian';
import simpleGit from 'simple-git';

export default class BasicGitSyncPlugin extends Plugin {

	async onload() {

		this.registerEvent(this.app.vault.on('modify', async (file) => {
			console.log(file.name);
			new Notice('File modified!');
			// Only because is desktop
			const adapter = this.app.vault.adapter as FileSystemAdapter;
			const baseDir = adapter.getBasePath();

			const gitClient = simpleGit({
				baseDir,
			});
			console.log(await gitClient.status());
		}))
	}

	onunload() {

	}
}

