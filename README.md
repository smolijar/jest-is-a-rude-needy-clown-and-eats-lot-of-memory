# Benchmarking testing frameworks

Benchmark of memory requirements for different JS test frameworks after running into some issues with Jest memory requirements causing OOM with about ~450 tests (50 suites).

See these old but good issues: https://github.com/kulshekhar/ts-jest/issues/1967, https://github.com/facebook/jest/issues/11956

## Measuring memory peaks

### Node.js ticking spy

This works correctly when you have a single process running. Mocha runs like this on default, Jest requires a `--runInBand` option, but it is not possible for AVA, which uses threads and cannot be forced out of them.

```js
let memStats = {};
const now = require("perf_hooks").performance.now;
const start = now();
const cpuUsage = process.cpuUsage();

process.nextTick(() => {
  const current = process.memoryUsage();
  for (const key in current) {
    memStats[key] = Math.max(memStats[key] || 0, current[key]);
  }
});

process.on("exit", () => {
  console.log({
    memStats,
    timeMilliseconds: now() - start,
    cpuUsage: process.cpuUsage(cpuUsage),
    pid: process.pid,
  });
});
```

### `time`

`/usr/bin/time` (not to be confused with you shell variant of `time`), when run with `-v` gives you memory debug regarding the process.

```
$ /usr/bin/time -v npm run test

	User time (seconds): 4.39
	System time (seconds): 0.45
	Percent of CPU this job got: 7%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 1:06.76
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 95012
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 60030
	Voluntary context switches: 6206
	Involuntary context switches: 499
	Swaps: 0
	File system inputs: 0
	File system outputs: 8
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 0
```

## How to run

1. Generate test suites

- Set `SUIT_COUNT` to determine the number of test suites
- Run `./gen.sh` to generate the test suites

2. Set number of tests in test suite with `TEST_COUNT` (must be greater than 0)
3. Set the wait in each test `TEST_WAIT` in milliseconds
4. Run tests with:

```
npm run mocha
npm run jest
npm run ava
```

Notes:

- Jest without `--runInBand` and Mocha with `--parallel` make memory benching skewed, since child processes are not included. Process based runners run in a single process by default

## Concurrency model

| -     | concurrent suites                               | concurrent tests within suites                |
| ----- | ----------------------------------------------- | --------------------------------------------- |
| jest  | yes, separate processes (no with `--runInBand`) | no                                            |
| mocha | no (yes with `--parallel`, separate processes)  | no (unmaintained package)                     |
| ava   | yes, thread workers (no with `-c 1`)            | yes (tests with `.parallel` run sequentially) |

## Results

```
Linux manjaro 5.9.16-1-MANJARO #1 SMP PREEMPT Mon Dec 21 22:00:46 UTC 2020 x86_64 GNU/Linux
Intel(R) Core(TM) i7-7567U CPU @ 3.50GHz

π node -v
    v14.16.0
π npm -v
    6.14.11
π npx jest --version
    27.4.7
π npx mocha --version
    9.1.3
π npx ava --version
    1.0.0

"ava": "4.0.1",
"jest": "27.4.7"
"mocha": "9.1.3"
```

### Many tests

```
TEST_WAIT=0
SUIT_COUNT=1000
TEST_COUNT=100
```

| -     | time    | Maximum resident set size |
| ----- | ------- | ------------------------- |
| jest  | 1:04.52 | 1571 MB                   |
| mocha | 0:07.63 | 471 MB                    |
| ava   | 8:38.42 | 451 MB                    |

See [[many.txt]](./res/many.txt)

- Jest has terrible memory requirements
- AVA has terrible time performance
- Mocha and AVA have comparable memory requirements
- Mocha has unmatched time performance

### Concurrent tests

```
TEST_WAIT=500
SUIT_COUNT=10
TEST_COUNT=10
```

| -                | time    | Maximum resident set size |
| ---------------- | ------- | ------------------------- |
| jest --runInBand | 1:06.76 | 95 MB                     |
| ava              | 0:03.47 | 131 MB                    |
| mocha            | 0:55.05 | 53 MB                     |
| jest             | 0:22.19 | ?                         |
| mocha --parallel | 0:20.68 | ?                         |

- AVA has the worst memory performance, but adequate to unmatched speed (individual tests run in parallel)
- Mocha still has best memory requirements and outperforms Jest slightly in bot sequential nad parallel runs

See [[wait.txt]](./res/wait.txt)

### Case X

```
TEST_WAIT=500
SUIT_COUNT=49
TEST_COUNT=9
```

| -                | time    | Maximum resident set size |
| ---------------- | ------- | ------------------------- |
| jest --runInBand | 1:06.76 | 95 MB                     |
| ava              | 0:03.47 | 131 MB                    |
| mocha            | 0:55.05 | 53 MB                     |
| jest             | 0:22.19 | ?                         |
| mocha --parallel | 0:20.68 | ?                         |

### Leakables

```
TEST_WAIT=0
SUIT_COUNT=1000
TEST_COUNT=1
```

Simple run:

| -     | time    | Maximum resident set size |
| ----- | ------- | ------------------------- |
| mocha | 0:04.07 | 84 MB                     |
| jest  | 0:47.41 | 203 MB                    |
| ava   | 2:21.42 | 275 MB                    |

Import `path`, `crypto`, `os`, `fs` in each test:

| -     | time    | Maximum resident set size |
| ----- | ------- | ------------------------- |
| mocha | 0:04.59 | 86 MB                     |
| jest  | 0:37.21 | 544 MB                    |
| ava   | 2:16.24 | 265 MB                    |

Atop of that, leave hanging `setInterval` (possibly simulating opened connection)

| -     | time    | Maximum resident set size |
| ----- | ------- | ------------------------- |
| mocha | 0:06.77 | 89 MB                     |
| jest  | 0:41.99 | 1202 MB                   |
| ava   | 2:17.27 | 267 MB                    |

- Importing different modules does not really make difference to AVA and Mocha memory-wise. With Jest, just using different modules sends the memory to the moon.
- Mocha keeps by far the lowest memory profile and best performance to both Jest and AVA
- Mocha and AVA stay stable regardless of open handles, while Jest goes crazy with memory

## Refs

- Parallel tests in Mocha with shared database: https://medium.com/leaselock-engineering/50-faster-testing-in-mochas-parallel-mode-a8eced30e823
- Integration tests with AVA over shared resource: https://github.com/avajs/ava/blob/main/docs/recipes/isolated-mongodb-integration-tests.md
- Running tests in parallel with Mocha: https://github.com/danielstjules/mocha.parallel
