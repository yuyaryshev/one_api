# yone_api

A very simple back-end for small single user sites.

# Usage

Open folder where you want to store your data.

Data will be 'data' subfolder. It's created when the server starts.

Now just

```bash
npx yone_api
```

And try opening 

http://localhost:8200/api/one

You can get the data with this get api.

You can post new data with post api (same url) - see client example below

## Client example

You just get the data with GET and change it with POST.

Only one thing have to be done when changing: you must pass prevDataVersion along with data. This is to protect your data.

```javascript
const axios = require("axios");
async function main() {
    const port = 8200;
    const apiUrl = `http://localhost:${port}/api/one`;

    // Get the data
    const { ok, data, dataVersion } = (await axios.get(apiUrl)).data;
    console.log("Your data version is:", dataVersion);
    console.log("Here is your data:", data);

    // Let's set change some data
    const newVersion = `${(+dataVersion || 0) + 1}`;
    data.xx = `Some data '${data.xx || "undefined"}'`;

    const { data: newData } = await axios.post(apiUrl, {
        params: { data, prevDataVersion: dataVersion, newDataVersion: newVersion },
    });
    console.log("Sent new data:", newData, "\n\n");

    // Get the new data
    {
        const { ok, data, dataVersion } = (await axios.get(apiUrl)).data;
        console.log("Your NEW data version is:", dataVersion);
        console.log("Here is your NEW data:", data);
    }
}

main().then();
```

#### The result

```
Your data version is: c57e0d12-4548-4fc8-b4f6-e291f0790cbb
Here is your data: { ts: '2000-01-01 00:00:00' }
Sent new data: { ok: true } 


Your NEW data version is: 1
Here is your NEW data: { ts: '2000-01-01 00:00:00', xx: "Some data 'undefined'" }
```

## Why bother with all thouse versions?

Well... you don't want to loose your data, don't you?

The version guards you from overwriting the data with empty one or with conflicted data.

If you pass the wrong prevDataVersion yone_api will back up data before it overwrites it.

## Integrating into back-end

If you want to control your backend, but still wish to use **yone_api**

```javascript
import express from "express";
import {publishOneApis} from "yone_api";
//const {publishOneApis} = require("yone_api");

const startAwesomeServer = async () => {
    const app = express();
    app.use(express.json());

    let httpServer = http.createServer(app);
    const env = { settings: {port:80} };        // Settings for OneApi
    publishOneApis(env, app);                   // This publishes OneApi apis

    const httpServerInstance = httpServer.listen(env.settings.port, () => {
        console.log(`Started http://localhost:${env.settings.port}/api/one`);
    });
};
```



# settings.json

You can create settings.json to specify port in it.
