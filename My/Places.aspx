<%@ Page Language="C#" AutoEventWireup="true" %>
<!DOCTYPE html>
<html>
<head runat="server">
    <title>Bloxtip info</title>
    <style>
        body {
            background-color: #e5e5e5;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #cccccc;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        .header {
            background: #007acc;
            color: white;
            padding: 15px 20px;
            font-size: 20px;
            font-weight: bold;
        }
        .content {
            padding: 20px;
        }
        .stat-box {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 3px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
            background: #f1f1f1;
            border-top: 1px solid #ddd;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            background: #28a745;
            color: white;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
        <div class="container">
            <div class="header">
                Bloxtip 2013 studio
            </div>
            <div class="content">
                <h3>hello and welcome to bloxtip＞︿＜</h3>
                <p>This server interface communicates directly with your 2013 client and Studio environment, supplying configuration data and local session handles.</p>
                
                <div class="stat-box">
                    <strong>Server Status:</strong> <span class="badge">ONLINE</span><br />
                    <strong>Active Engine:</strong> Roblox 2013 Legacy Client (`2013.exe`)<br />
                    <strong>Server Time:</strong> <asp:Label ID="lblTime" runat="server" /><br />
                    <strong>Total Registered Places:</strong> <asp:Label ID="lblPlaces" Text="12" runat="server" />
                </div>

                <h4>Quick Instructions:</h4>
                <ul>
                    <li>just do anything tbh</li>
                    <li>2013 mode boots instantly into local baseplate playability with automatic bugs</li>
                    <li>Make sure your `version.txt` matches the online repository for no reason cuz like why not</li>
                </ul>
            </div>
            <div class="footer">
                Bloxtip Platform powered by github lmao
            </div>
        </div>
    </form>
</body>
</html>

<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        // Display the current server timestamp dynamically
        lblTime.Text = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    }
</script>
