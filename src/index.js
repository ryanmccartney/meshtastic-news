require("dotenv").config();
const Parser = require("rss-parser");
const cron = require("node-cron");
const { MeshDevice, Types } = require("@meshtastic/core");
const { TransportHTTP } = require("@meshtastic/transport-http");

const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? "*/5 * * * *";
const RSS_FEED_URL = process.env.RSS_FEED_URL;
const MESHTASTIC_NODE_IP_ADDRESS = process.env.MESHTASTIC_NODE_IP_ADDRESS;
const MESHTASTIC_CHANNEL_NUMBER = process.env.MESHTASTIC_CHANNEL_NUMBER
    ? parseInt(process.env.MESHTASTIC_CHANNEL_NUMBER)
    : 1;
const MAX_ITEMS = process.env.MAX_ITEMS ? parseInt(process.env.MAX_ITEMS) : 3;
const MAX_MESSAGE_BYTES = process.env.MAX_MESSAGE_BYTES
    ? parseInt(process.env.MAX_MESSAGE_BYTES)
    : 200;
const MAX_HEADLINE_LENGTH = process.env.MAX_HEADLINE_LENGTH
    ? parseInt(process.env.MAX_HEADLINE_LENGTH)
    : 50;

const parser = new Parser();
let lastHeadlines = "";
let device;

const isConnected = () => {
    return device && device.deviceStatus === Types.DeviceStatusEnum.DeviceConfigured;
};

const getMessageBytes = (message) => {
    return Buffer.byteLength(message, "utf8");
};

const formatDate = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())} on ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const shortenText = (text, maxChars) => {
    if (text.length <= maxChars) return text;

    const shortened = text.substring(0, maxChars);
    const lastSpace = shortened.lastIndexOf(" ");

    return (lastSpace > 0 ? shortened.substring(0, lastSpace) : shortened).trimEnd() + "...";
};

const checkHeadlines = async () => {
    if (isConnected()) {
        const feed = await parser.parseURL(RSS_FEED_URL);

        const title = `**${feed.title}** at ${formatDate(new Date(feed.lastBuildDate))}`;
        let headlines = "";

        for (const i in feed.items) {
            if (i >= MAX_ITEMS) {
                break;
            }
            headlines += `\n- ${shortenText(feed.items[i].title, MAX_HEADLINE_LENGTH)}`;
        }

        const message = `${title}\n${headlines}`.slice(0, MAX_MESSAGE_BYTES);

        if (headlines !== lastHeadlines) {
            console.log(`New headlines, sending message.`);
            console.log(
                `Message is ${getMessageBytes(message)} bytes. Max permitted is ${MAX_MESSAGE_BYTES}`
            );
            console.log("----------------MESSAGE--------------------");
            console.log(message);
            console.log("-------------------------------------------");

            lastHeadlines = headlines;
            const packetId = await device.sendText(
                message,
                "broadcast",
                false,
                MESHTASTIC_CHANNEL_NUMBER
            );
        } else {
            console.log(`Headlines haven't changed, not sending a message`);
        }
    }
};

const main = async () => {
    if (RSS_FEED_URL && MESHTASTIC_NODE_IP_ADDRESS) {
        const transport = await TransportHTTP.create(MESHTASTIC_NODE_IP_ADDRESS);
        device = new MeshDevice(transport);
        await device.configure();
        await checkHeadlines();

        cron.default.schedule(CRON_SCHEDULE, checkHeadlines);
    } else {
        console.log(`Missing RSS Feed URL or Meshtastic Node IP`);
    }
};

main();
