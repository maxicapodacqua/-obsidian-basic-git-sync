import { Notice, Plugin } from 'obsidian';
import GitService from './services/GitService';


type PluginState = 'starting' | 'invalid-repo' | 'ready' | 'pulling' | 'pushing';

export default class BasicGitSyncPlugin extends Plugin {

	private gitService: GitService;
	private statusBar: HTMLElement;
	private pluginState: PluginState = 'starting';


	async onload() {

		this.statusBar = this.addStatusBarItem();
		this.statusBar.createEl('span');
		this.setPluginState('starting');

		this.gitService = new GitService(this.app);

		if (! await this.gitService.isValidRepo()) {
			new Notice("Current vault is not a repo");
			this.setPluginState('invalid-repo');
			return; // Stop plugin execution here
		} else {
			this.setPluginState('ready')
		}


		// this.registerEvent(this.app.vault.on('modify', async (file) => {
		// 	console.log(file.name);
		// 	new Notice('File modified!');
		// 	console.log(await this.gitService._getGitClient().status());
		// }))
	}

	private setPluginState(newState: PluginState) {
		console.log(`${this.pluginState} -> ${newState}`);
		this.pluginState = newState;
		this.statusBar.setText(newState);
	}

	onunload() {

	}
}

