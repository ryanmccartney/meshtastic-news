const RSS_URL = "https://feeds.bbci.co.uk/news/rss.xml";
const PROXY_URL = "https://proxy.cors.dev/";

async function loadBBCNews() {
    const status = document.getElementById("rss-status");
    const container = document.getElementById("rss-feed");

    try {
        const response = await fetch(PROXY_URL + RSS_URL, { credentials: "omit" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const xml = await response.text();
        const doc = new DOMParser().parseFromString(xml, "application/xml");

        if (doc.querySelector("parsererror")) {
            throw new Error("Invalid RSS feed");
        }

        const items = [...doc.querySelectorAll("channel > item")].slice(0, 10);

        container.replaceChildren();

        items.forEach((item) => {
            const title = item.querySelector("title")?.textContent.trim() || "";
            const url = item.querySelector("link")?.textContent.trim() || "";
            const date = item.querySelector("pubDate")?.textContent.trim() || "";

            const entry = document.createElement("article");
            entry.className = "news-item";

            const link = document.createElement("a");
            link.textContent = title;
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            const time = document.createElement("small");
            const parsedDate = new Date(date);
            time.textContent = Number.isNaN(parsedDate.getTime())
                ? ""
                : parsedDate.toLocaleString();

            entry.append(link, time);
            container.append(entry);
        });

        status.textContent = `Showing ${items.length} latest headlines`;
    } catch (error) {
        console.error("RSS error:", error);
        status.textContent = "Unable to load BBC News.";
    }
}

loadBBCNews();

// Refresh every 5 minutes
setInterval(loadBBCNews, 5 * 60 * 1000);
