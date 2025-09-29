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

	public async add(files: string | string[]) {
		return await this.gitClient.add(files);
	}

	/**
	 * Returns if there were changes committed
	 */
	public async commit(message: string | string[]): Promise<boolean> {
		const res = await this.gitClient.commit(message);
		return (res.summary.changes + res.summary.deletions + res.summary.insertions) > 0;
	}

	public async push() {
		return await this.gitClient.push();
	}

	public async pull() {
		return await this.gitClient.pull();
	}

	/** TODO: delete this function */
	public _getGitClient() {
		return this.gitClient;
	}
}
