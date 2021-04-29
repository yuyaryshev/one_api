const axios = require("axios");
async function main() {
    const port = 8201;
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
