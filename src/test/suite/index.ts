import * as path from 'path';
import * as fs from 'fs';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
	});

	const testsRoot = path.resolve(__dirname, '.');

	return new Promise((c, e) => {
		const files = fs.readdirSync(testsRoot).filter(f => f.endsWith('.test.js'));

		files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

		try {
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			e(err);
		}
	});
}
