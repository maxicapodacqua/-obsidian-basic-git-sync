import { Notice, Plugin, setIcon } from 'obsidian';
import GitService from './services/GitService';


type PluginState = 'starting' | 'invalid-repo' | 'ready' | 'pulling' | 'pushing' | 'error';

export default class BasicGitSyncPlugin extends Plugin {

	private gitService: GitService;
	private statusBar: HTMLElement;
	private statusBarIcon: HTMLElement;
	private pluginState: PluginState = 'starting';


	async onload() {

		this.statusBarIcon = this.addStatusBarItem();
		setIcon(this.statusBarIcon, 'info');
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

		// Always start by pulling changes
		await this.downloadChanges();

		// Not using this as it could cause some error when user changes tabs often
		// this.registerEvents();


		// I'll go with a different approach, an interval with push and pull

		this.registerInterval(window.setInterval(async () => {
			await this.uploadChanges();
			await this.downloadChanges();
		}, 3000));

		this.addCommand({
			name: 'Upload changes',
			id: 'upload-changes',
			callback: async () => {
				await this.uploadChanges();
			}
		});

		this.addCommand({
			name: 'Download changes',
			id: 'download-changes',
			callback: async () => {
				await this.downloadChanges();
			}
		});
	}

	private async uploadChanges() {

		try {
			await this.gitService.add('.');
			const hasChanges = await this.gitService.commit(`Update commit by ${this.manifest.name} ${Date.now()}`);
			if (hasChanges) {
				this.setPluginState('pushing');
				await this.gitService.push();
			}
			this.setPluginState('ready');
		} catch (e: unknown) {
			console.error(e);
			this.setPluginState('error');
		}
	}
	private async downloadChanges() {
		try {
			this.setPluginState('pulling');
			await this.gitService.pull();
			this.setPluginState('ready');
		} catch (e: unknown) {
			console.error(e);
			this.setPluginState('error');
		}
	}

	private async registerEvents() {
		this.registerEvent(this.app.vault.on('modify', async (_file) => {
			console.log("modify");
			await this.uploadChanges();
		}));

		this.registerEvent(this.app.vault.on('create', async (_file) => {
			console.log("create");
			await this.uploadChanges();
		}));

		this.registerEvent(this.app.vault.on('delete', async (_file) => {
			console.log("delete");
			await this.uploadChanges();
		}));

		this.registerEvent(this.app.vault.on('rename', async (_file) => {
			console.log("rename");
			await this.uploadChanges();
		}));


		this.registerEvent(this.app.workspace.on('file-open', async (_file) => {
			console.log("this.app.workspace.on('file-open',");
			await this.downloadChanges();
		}));

	}

	private setPluginState(newState: PluginState) {

		const statusIconMap: Record<PluginState, string> = {
			"invalid-repo": 'refresh-cw-off',
			'error': 'refresh-cw-off',
			'pulling': 'book-down',
			'pushing': 'book-up',
			'ready': 'book',
			'starting': 'soup',
		};

		console.log(`${this.pluginState} -> ${newState}`);
		this.pluginState = newState;
		this.statusBar.setText(`git: ${newState}`);
		setIcon(this.statusBarIcon, statusIconMap[newState]);
	}

	onunload() {

	}
}

