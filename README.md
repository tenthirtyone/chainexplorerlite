<div id="top"></div>

<div align="center">

<h3 align="center">Blockchain Explorer/Reporter</h3>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

![Project Screen Shot (in docs folder)](https://github.com/tenthirtyone/chainexplorer/blob/master/docs/systemdesign.jpg?raw=true)

This repo contains a basic block explorer that follows the above system design (All images reside in docs folder). It is written as a monolithic application, but is intended to demonstrate the principles required to build the above at scale. The project supports including the code as a NodeJS module, and may also be run directly from the command line or packaged in a docker container.

The user may interact with this module in two ways. Through the command line or through a web gui. Instructions are provided for both. It relies on Infura for its connection to the Ethereum network and may be configured through an `.env` file, by passing individual classes config objects, or modifying each classes default configuration. Additional references are provided through JSdoc output located in the `docs` directory.

<p align="right">(<a href="#top">back to top</a>)</p>

### Requirements

- Given a range of blocks, how much Ether was transferred/received.
- The user may provide a range or blocks, or
- Provide a single number representing how far back from the present block.
- Display the total Ether transferred.
- Display which addresses sent Ether.
- Display which addresses received Ether.
- Of these addresses, which are Contract addresses.

#### Optional Requirements Satisfied

- Display how many Uncles are present for the provided block range
- Display a count of unique sender addresses
- Display a count of unique receiver addresses
- Display a count of how many contracts were created
- Display a count of the total unique addresses

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

The project relies on `express`, `lru-cache`, `sequelize`, an in-memory `sqlite3` database, and `web3` connection to the Infura service. No additional system-level services are required.

The web gui is a react app residing in the `client` directory and will install/build as a postinstall script after running `npm install`.

### Prerequisites

The project was developed against Node v16. It makes limited use of optional chaining, mostly for defensive programming in the starting/clearing of listeners, and requires at least Node v14. It requires an Infura application Id that will be provided via BitWarden link in the submission email.

### Installation

1. From the top-level directory, npm install.

```sh
npm install
```

2. Refer to the `.env.example` file to create a new `.env` file. Defaults will work fine with a provided Infura Id.

3. Fetch some block data. The Infura service will listen for new blocks, however, a convenience method is provided to fetch the previous N blocks. This is outside of the reporting service, which relies exclusively on cached block data _For a more in-depth explanation see the Assumptions section below_

```sh
node
> Explorer = require('.'); explorer = new Explorer();
> explorer.start()
03:18:47.282Z  INFO App: App starting...
03:18:47.322Z  INFO App: App started.
03:18:47.325Z  INFO API: Listening on 4000
>
```

From here, you may see the infura service begin indexing blocks as they are mined. That is OK. Use the following command to fetch additional historical data:

```sh
> explorer.fetchLastNBlocks(5)
03:20:06.247Z  INFO Infura: Adding block 13401266 to work queue
03:20:06.251Z  INFO Infura: Adding block 13401265 to work queue
03:20:06.251Z  INFO Infura: Adding block 13401264 to work queue
03:20:06.252Z  INFO Infura: Adding block 13401263 to work queue
03:20:06.252Z  INFO Infura: Adding block 13401262 to work queue
```

Replace 5 with your desired historical amount. I advise keeping it around 20-50 as the in-memory db journal can be a little overwhelmed and the Infura service is scheduled to run at 25 requests per second, well over the Ethereum Network throughput of 15tps.

Also, if you allow the infura service to run for a long time you may experience a slight startup delay while the Cache service populates itself with the previously saved blocks in the database. (It took ~5-10 seconds with a query limit of 10,000).

From here, you may leave it running from the Node cli and interact with the CLI directly using the instructions in the following section.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Command Line

```sh
$ node
> let report; explorer.createReport([startBlock], [endBlock]).then(data => report = data)
> let report; explorer.lastNBlockReport([blocksBack]).then(data => report = data)
```

Summary and report data will be in the report Object.

```
report.summary
report.senders
report.receivers
report.contracts
report.startBlock
report.endBlock
```

or

```sh
$ node index
```

Will start the application

### Web Interface

A GUI is available @ `localhost:4000`, or you may enter the `client` directory and run it in developer mode with `npm run start`.
![GUI Screen Shot (in docs folder)](https://github.com/tenthirtyone/chainexplorer/blob/master/docs/gui-startup.png?raw=true)
![GUI Report Screen Shot (in docs folder)](https://github.com/tenthirtyone/chainexplorer/blob/master/docs/gui-report.png?raw=true)
![GUI Report Contract Screen Shot (in docs folder)](https://github.com/tenthirtyone/chainexplorer/blob/master/docs/gui-contract.png?raw=true)

Sender/Receiver data will lazily display each list with a 'show more' button located below its respective list.

<p align="right">(<a href="#top">back to top</a>)</p>

## Testing

Backend:

```sh
$ mocha ./test
```

Client

```sh
$ npm run test
```

## Assumptions / Tradeoffs

- Production Data

  Up front, this would be a very write-heavy application. It would index the entire chain and afterward only write with the new blocks that come in. At which time it becomes read-heavy.

- Caching

  I do not like caching query results as a strategy (There are n^2 number of possible reports). Instead, I prefer to cache the objects that go into the query or report. The majority of blockchain data will never change, with the exception of reorgs. It is cheap/easy to update the cache and db. Presently, Ethereum mainnet sits at around 1TB of data. For an enterprise client, that would be approximately $5k or less a month to hold in something like Redis.

- Infura Rate Limits

  I was able to fetch from Infura reasonably quickly, but did not go beyond 100 rps. I tried to target a number that was greater than Ethereum's TPS and would allow for a single service to fetch previous data while still backfilling chain data. At scale, it would be possible to implement something that runs in parallel or horizontally scales and backfills the chain data quickly. Especially if relying on your own in-house nodes.

- Database

  The first real limitation I hit was the in-memory db having a journaling issue where transactions were saving before their blocks were written. This messed up the associations and led to missing data. At scale, an enterprise db or even system-level db service would reduce this bottleneck.

- Data Availability

  I chose not to rely directly on the infura RPC to fetch data for the user. If the user experience is the priority, then having cache'd chain data is going to be the most effective way to make the app responsive. It would be reasonable to provide a fallback while the chain indexes that relies on the RPC but I felt that capability was demonstrated based on the existing service without implementing it directly.

- Report Parsing & Formatting

  Because I was supporting a CLI and Web UI, I chose to put the report formatting in the report service. The `.forEach` loop does block the event loop. However, it's not performing major tasks, like crypto, just basic Math. At scale, it would make sense to pass this off to a worker pool or pass the raw report data to the user device and let the front end handle it.

- DoS

  Sensible defensive limitations to the reporting. Having one jerk user, or a malicious competitor, that would constantly hammer on reports from the Genesis block to the most recent block would be an issue.
