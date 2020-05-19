const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const archiver = require('archiver');
const shortid = require('shortid');
const readline = require('readline');

app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 8080;

//const mariadb = require('mariadb');
//const pool = mariadb.createPool({
//    host: 'localhost',
//    user: 'pi',
//    password: 'Xc3rt8jklas0!',
//    connectionLimit: 1
//});

// Serve the test index.html
app.get('/', function(req, res){
    console.log("requesting index.html");
    res.sendFile(__dirname + '/index.html');
});

// Text post application
app.post('/strings', (req, res) => {
    console.log("posting string");
    console.log(req.body);

    res.send(`key:${req.body.key}, value: ${req.body.string}.`);
    console.log(`key: ${req.body.key}`);
    console.log(`string: ${req.body.string}`);

    const key = req.body.key;
    const string = req.body.string;
    const filePath = __dirname + "/strings/" + key;
    console.log("writing to " + filePath);
    fs.appendFileSync(filePath, string + "\n");
});

app.get('/strings', (req, res) => {
    const key = req.query.key;
    console.log(`requesting key ${key}`);

    const path = __dirname + "/strings/" + key;

    const readInterface = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            console: false
    });

    var stringArray = [];
    readInterface.on('line', (line) => {
          stringArray.push(line);
    }).on('close', () => {
        let data = { "strings" : stringArray };
        console.log(data);
        res.json(data);
    });
});

// Upload the sent image, creating a new category directory if necessary
app.post('/image', (req, res) => {
    console.log("received upload request");

    const form = formidable();
    const imageDirectory = __dirname + "/images/";

    form.parse(req, (err, fields, files) => {
         res.json({ fields, files });
    });

    // Add the image to local filesystem
    form.on('fileBegin', (name, file) => {
        const categoryDirectory = imageDirectory + path.parse(file.name).name + '/';
        const imageId = shortid.generate();
        const ext = path.extname(file.name);

        // Create directory if non-existant
        if (!fs.existsSync(categoryDirectory)) {
            fs.mkdirSync(categoryDirectory);
        }

        file.path = `${categoryDirectory}/${imageId}.${ext}`;
    });

    // Display success message
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
});

// Send the requested (compressed) category of images, if they exist
app.get('/image', (req, res) => {
    const category = path.parse(req.query.img).name;
    console.log(`requesting category ${category}`);
    const tempZip = `${__dirname}/temp/${category}.zip`;

    // Create compression stream
    let output = fs.createWriteStream(tempZip);
    let archive = archiver('zip', {
          zlib: { level: 4 } // Sets the compression level.
    });

    // Compress, send, delete
    archive.pipe(output);
    res.sendFile(tempZip);
    fs.unlink(tempZip);
});

// Start the server
app.listen(port, (res) => {
    console.log(`Server running on port${port}`);
});

