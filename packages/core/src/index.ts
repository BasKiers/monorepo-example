import chalk from "chalk";

export interface Example {
  id: string,
  name: string
}

export function sum(a: number, b: number) {
  return a + b + 6;
}

export function krijtje(s: string) {
  return chalk.blue(s);
}

export {times} from "./map/directory/file";