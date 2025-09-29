import { App, FileSystemAdapter } from 'obsidian';
import simpleGit, { SimpleGit } from 'simple-git';

export default class GitService {

	gitClient: SimpleGit;

	constructor(app: App) {
		// Only because is desktop
		const adapter = app.vault.adapter as FileSystemAdapter;
		const baseDir = adapter.getBasePath();

		this.gitClient = simpleGit({
			baseDir,
		});
	}

	public async isValidRepo() {
		try {
			const isRepo = await this.gitClient.checkIsRepo();

			if (!isRepo) {
				return false;
			}

			await this.gitClient.listRemote();
			return true;
		} catch (_e: unknown) {
			return false;
		}
	}

	/** TODO: delete this function */
	public _getGitClient() {
		return this.gitClient;
	}
}
