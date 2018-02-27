interface AsyncCallback<T> { (err: any, res: T): void }
interface AsyncFunction<T> { (fn: AsyncCallback<T>): void }

export function promisify<T>(fn: AsyncFunction<T>, ...args: any[]): Promise<T> {
	if (args.length == 0)
		return new Promise<T>((resolve, reject) => {
			fn((err: any, res: T) => err ? reject(err) : resolve(res));
		});
	else
		return promisify((cb: AsyncCallback<T>) => fn.apply(null, [...args, cb]));
}
