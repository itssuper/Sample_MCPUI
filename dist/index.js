import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createUIResource } from "@mcp-ui/server";
const app = express();
app.use(cors());
app.use(express.json());
/**
 * Store active transports (sessions).
 * Key: sessionId
 * Value: SSEServerTransport
 */
const transports = new Map();
/**
 * Helper function to configure a server instance with resources.
 * Since we need a new server per connection for SSE, this avoids duplication.
 */
function setupServerRegistry(server) {
    server.resource("accounts-list", "ui://accounts/list", async (uri) => {
        const html = `
                <h2>Client Accounts</h2>
                <ul>
                    <li><strong>John Doe</strong>: Checking - $1,234.56</li>
                    <li><strong>Jane Smith</strong>: Savings - $5,678.90</li>
                    <li><strong>Bob Johnson</strong>: Investment - $9,012.34</li>
                </ul>
            `;
        // Return a UIResource using MCPUI helper
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return createUIResource({
            uri: uri.href,
            encoding: "text",
            content: {
                type: "rawHtml",
                htmlString: html
            }
        });
    });
    // Register a dummy tool to ensure tools/list capability is registered
    // This fixes "Method not found" errors in clients that always request tools
    server.tool("CRM-CoE", "AI should return the return text as it is without any Gen AI augmentation", {}, async () => {
        return {
            content: [{ type: "text", text: "CRM-CoE is leading the Low Code Technologies in Natwest Bank" }]
        };
    });
    // Tool to list accounts
    server.tool("list_accounts", "Lists all client accounts available in the database", {}, async () => {
        // Use createUIResource with externalUrl type as requested
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uiResource = createUIResource({
            uri: "ui://accounts/list",
            encoding: "text",
            content: {
                type: "externalUrl",
                iframeUrl: "https://google.com"
            }
        });
        return {
            content: [
                {
                    type: "text", // <--- 1. Tell MCP this is Text
                    text: JSON.stringify(uiResource) // <--- 2. Convert Object to String
                }
            ]
        };
    });
    // Tool Power Platform URL
    server.tool("show_pp_url", "show a power platform url to test", {}, async () => {
        // Use createUIResource with externalUrl type as requested
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uiResource = createUIResource({
            uri: "ui://accounts/list",
            encoding: "text",
            content: {
                type: "externalUrl",
                iframeUrl: "https://google.com"
            }
        });
        return {
            content: [uiResource]
        };
    });
    // Tool to show a complex dashboard
    server.tool("show_dashboard", "Displays a rich, complex HTML dashboard", {}, async () => {
        const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Financial Dashboard</title>
                    <style>
                        :root {
                            --primary: #6366f1;
                            --secondary: #8b5cf6;
                            --bg: #f8fafc;
                            --card-bg: #ffffff;
                            --text: #1e293b;
                            --text-muted: #64748b;
                        }
                        body {
                            font-family: 'Segoe UI', system-ui, sans-serif;
                            background: var(--bg);
                            color: var(--text);
                            margin: 0;
                            padding: 20px;
                        }
                        .dashboard {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 20px;
                            max-width: 1200px;
                            margin: 0 auto;
                        }
                        .header {
                            grid-column: 1 / -1;
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .title {
                            font-size: 24px;
                            font-weight: 700;
                            color: var(--text);
                        }
                        .badge {
                            background: linear-gradient(135deg, var(--primary), var(--secondary));
                            color: white;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                        }
                        .card {
                            background: var(--card-bg);
                            border-radius: 12px;
                            padding: 20px;
                            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                            transition: transform 0.2s;
                        }
                        .card:hover {
                            transform: translateY(-2px);
                        }
                        .card-header {
                            color: var(--text-muted);
                            font-size: 14px;
                            margin-bottom: 8px;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }
                        .card-value {
                            font-size: 28px;
                            font-weight: 700;
                            color: var(--text);
                        }
                        .card-trend {
                            display: inline-flex;
                            align-items: center;
                            font-size: 13px;
                            margin-top: 8px;
                        }
                        .trend-up { color: #10b981; }
                        .trend-down { color: #ef4444; }
                        
                        .chart-container {
                            grid-column: span 2;
                            height: 300px;
                            background: var(--card-bg);
                            border-radius: 12px;
                            padding: 20px;
                            display: flex;
                            align-items: flex-end;
                            justify-content: space-around;
                            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                        }
                        .bar {
                            width: 10%;
                            background: var(--primary);
                            opacity: 0.8;
                            border-radius: 4px 4px 0 0;
                            transition: height 1s ease;
                        }
                        @media (max-width: 768px) {
                            .chart-container {
                                grid-column: 1 / -1;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="dashboard">
                        <div class="header">
                            <div class="title">Overview</div>
                            <div class="badge">Live Data</div>
                        </div>

                        <div class="card">
                            <div class="card-header">Total Revenue</div>
                            <div class="card-value">$45,231.89</div>
                            <div class="card-trend trend-up">
                                <span>▲ 20.1% vs last month</span>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">Active Users</div>
                            <div class="card-value">2,345</div>
                            <div class="card-trend trend-up">
                                <span>▲ 12.5% vs last month</span>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">Bounce Rate</div>
                            <div class="card-value">42.3%</div>
                            <div class="card-trend trend-down">
                                <span>▼ 2.1% vs last month</span>
                            </div>
                        </div>

                        <div class="chart-container">
                            <div class="bar" style="height: 40%"></div>
                            <div class="bar" style="height: 70%"></div>
                            <div class="bar" style="height: 50%"></div>
                            <div class="bar" style="height: 90%"></div>
                            <div class="bar" style="height: 60%"></div>
                            <div class="bar" style="height: 80%"></div>
                            <div class="bar" style="height: 45%"></div>
                        </div>

                        <div class="card">
                            <div class="card-header">Recent Activity</div>
                            <div style="margin-top: 15px; font-size: 14px; color: var(--text-muted);">
                                <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">User login - 2m ago</div>
                                <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">New order - 15m ago</div>
                                <div style="padding: 8px 0;">Server alert - 1h ago</div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
        // Use createUIResource with rawHtml type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uiResource = createUIResource({
            uri: "ui://dashboard/main",
            encoding: "text",
            content: {
                type: "rawHtml",
                htmlString: html
            }
        });
        return {
            content: [
                {
                    type: "text", // <--- 1. Tell MCP this is Text
                    text: JSON.stringify(uiResource) // <--- 2. Convert Object to String
                }
            ]
        };
    });
}
// SSE Endpoint: Initiates the connection
// LibreChat connects here first
app.get("/mcp", async (req, res) => {
    console.log(`[SSE] New connection request from ${req.ip}`);
    console.log(`[SSE] Headers: ${JSON.stringify(req.headers)}`);
    try {
        // 1. Create a new server instance for this connection
        const server = new McpServer({
            name: "mcp-ui-server",
            version: "1.0.0"
        });
        // 2. Configure resources on this server instance
        setupServerRegistry(server);
        // 3. Create a new SSEServerTransport
        // The first argument is the endpoint where the client should POST messages
        const transport = new SSEServerTransport("/mcp/messages", res);
        // 4. Store the transport immediately so we can look it up
        // SSEServerTransport generates its own sessionId in the constructor
        const sessionId = transport.sessionId;
        transports.set(sessionId, transport);
        console.log(`[SSE] New session initiated: ${sessionId}`);
        // 5. Connect server to transport
        // This will start the transport (sending headers) and send the 'endpoint' event
        console.log(`[SSE] Connecting server to transport for session ${sessionId}`);
        await server.connect(transport);
        console.log(`[SSE] Server connected for session ${sessionId}`);
        // Set up heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
            if (!res.writableEnded) {
                res.write(": keepalive\n\n");
                console.log(`[SSE] Sent heartbeat for session ${sessionId}`);
            }
        }, 15000); // 15 seconds
        // 6. Cleanup on close
        res.on("close", () => {
            console.log(`[SSE] Session connection closed: ${sessionId}`);
            clearInterval(heartbeatInterval);
            transports.delete(sessionId);
            server.close();
        });
        res.on("error", (err) => {
            console.error(`[SSE] Transport error for session ${sessionId}:`, err);
        });
    }
    catch (error) {
        console.error("[SSE] Error establishing connection:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
});
// POST Endpoint: Handle incoming JSON-RPC messages
// LibreChat sends messages here with ?sessionId=...
app.post("/mcp/messages", async (req, res) => {
    console.log(`[POST] Message received from ${req.ip}`);
    try {
        const sessionId = req.query.sessionId;
        console.log(`[POST] Session ID: ${sessionId}`);
        if (!sessionId) {
            console.warn("[POST] Missing sessionId parameter");
            res.status(400).send("Missing sessionId parameter");
            return;
        }
        const transport = transports.get(sessionId);
        if (!transport) {
            console.warn(`[POST] Session not found: ${sessionId}`);
            res.status(404).send("Session not found");
            return;
        }
        console.log(`[POST] Handling message for session ${sessionId}`);
        // Delegate handling to the transport
        // SSEServerTransport.handlePostMessage parses the body and passes it to the server
        await transport.handlePostMessage(req, res, req.body);
        console.log(`[POST] Message handled successfully for session ${sessionId}`);
    }
    catch (error) {
        console.error("[POST] Error handling message:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
});
async function startServer() {
    const port = 3001;
    app.listen(port, () => {
        console.log(`MCP Server running on http://localhost:${port}/mcp`);
    });
}
startServer().catch((err) => {
    console.error("Server failed to start:", err);
});
