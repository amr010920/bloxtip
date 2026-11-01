const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/asset', async (req, res) => {
    const assetId = req.query.id;
    
    if (!assetId) {
        return res.status(400).send("Missing Asset ID");
    }

    try {
        res.setHeader('Content-Type', 'application/octet-stream');
        
        res.send(`<!-- Placeholder for Place ID ${assetId} -->`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/game/join.ashx', (req, res) => {
    const placeId = req.query.placeId;
    
    res.setHeader('Content-Type', 'text/plain');
    
    const joinScript = `
        -- This is the legacy Lua layout a 2013 client runs to bind networking
        local client = game:GetService("NetworkClient")
        client:Connect("YOUR_SERVER_IP_OR_TUNNEL", 53640, 0, 20)
        
        game:GetService("Players").LocalPlayer = game:GetService("Players"):CreateLocalPlayer(0)
        game:SetPlaceID(${placeId})
        
        -- Tells the engine to load the map from your /asset endpoint
        game:Load("${req.protocol}://${req.get('host')}/asset/?id=${placeId}")
    `;
    
    res.send(joinScript);
});

app.listen(PORT, () => {
    console.log(`Revival API Layer listening at http://localhost:${PORT}`);
});
