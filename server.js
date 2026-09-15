const express = require("express");
const multer = require("multer");
const fs = require("fs")
const path = require("path");
const app = express();
const nodeHtmlToImage = require("node-html-to-image");
const { errorMonitor } = require("events");
const e = require("express");


if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}
if (!fs.existsSync("data.json")) {
    fs.writeFileSync("data.json", "[]");
}
async function sendMemberCard(entry) {
    let imagePath = "uploads/card-" + Date.now() + ".png"

    let photoTag = "";
    if (entry.media) {
        let photoData = fs.readFileSync("uploads/" + entry.media);
        let base64Photo = photoData.toString("base64");
        photoTag = `<img src="data:image/png;base64,${base64Photo}" style="width:100%;border-radius:8px;margin-bottom:12px;"/>`
    }
    await nodeHtmlToImage({
        output: imagePath,
        html: `
    <html>
    <body style="margin:0; font-family:Georgia, serif>
    <div style="width:400px; padding:24px; background:linear-gradient(180deg,#2d1b4e,#1a1035); color:#fff;">
    <h2 style="text-align:center; margin:0 0 4px;">Savvy Squad<h2>
    <p style="text-align:center; color:#c9bce8; margin:0 0 20px;">When Fun never ENDS!!!</p>
    <p><strong>Name:</strong>${entry.name}</p>
    <p><strong>Age:</strong>${entry.age}</p>
    <p><strong>Hobby:</strong>${entry.hobby}</p>
    <p><strong>Country:</strong>${entry.country}</p>
    <p><strong>About:</strong>${entry.something}</p>
    ${photoTag}
    </div>
    </body>
    </html>`
    });
    let cardData = fs.readFileSync(imagePath);
    let base64Card = cardData.toString("base64");
    let response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: { name: "Savvy Squad", email: process.env.EMAIL_USER },
            to: [{ email: entry.email }],
            subject: "Your Savvy Squad Member Card",
            htmlContent: "<p>Thanks for joining! Here's your member card.<p>",
            attachment: [{
                content: base64Card,
                name: "member-card.png"
            }]
        })

    });

    let result = await response.json();
    console.log("Email sent", result);

}
app.use(express.static(__dirname));
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
const upload = multer({ storage: storage });
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "open.html"));
});
app.get("/responses.html", (req, res) => {
    res.sendFile(path.join(__dirname, "responses.html"));
})
app.get("/responses", (req, res) => {
    let password = req.query.password;

    if (password !== "savvy123") {
        res.status(401).json({ message: "Wrong password" })
        return
    }
    let submissions = JSON.parse(fs.readFileSync("data.json"));
    res.json(submissions);
});
app.post("/submit", upload.single("media"), (req, res) => {
    console.log("Received submission", req.body);
    let submissions = JSON.parse(fs.readFileSync("data.json"));

    let newEntry = {
        name: req.body.name,
        age: req.body.age,
        hobby: req.body.hobby,
        country: req.body.country,
        something: req.body.something,
        email: req.body.email,
        media: req.file ? req.file.filename : null
    };
    submissions.push(newEntry);
    fs.writeFileSync("data.json", JSON.stringify(submissions, null, 2))
    sendMemberCard(newEntry).catch(error => console.log("Email error", error));
    res.json({ message: "Submission successful! Please check your email for the member card." })
})
app.listen(3000, () => {
    console.log("Server running on https://localhost:3000")
});