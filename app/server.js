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

const port = process.env.PORT;

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

    res.send(`key:${req.body.key}, value: ${req.body.string}.`);
    console.log(`key: ${req.body.key}`);
    console.log(`string: ${req.body.string}`);

    const key = req.body.key;
    const string = req.body.string;
    const filePath = __dirname + "/strings/" + key;
    console.log("writing to " + filePath);
    fs.appendFileSync(filePath, string + "\n");
});

app.delete('/strings', (req, res) => {
    const key = req.query.key;
    console.log(`requesting to delete "${key}"`);

    try {
        fs.unlinkSync(__dirname + '/strings/' + key);
    } catch (err) {
        res.status(404).send("error deleting " + key);
    } finally {
        res.send();
    }
});

app.get('/strings', (req, res) => {
    const key = req.query.key;
    console.log(`requesting key ${key}`);

    const path = __dirname + "/strings/" + key;
    try {
        console.log("checking if file exists");
        if (!fs.existsSync(path)) {
            console.log("file doesn't exist");
            return res.status(404).send("string query not found");
        }
    } catch(err) {
        console.error(err)
    }

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
        console.log(fields);
        console.log(files);

        const tag = fields.tag;
        const targetDirectory = imageDirectory + tag + '/';
        const imageId = shortid.generate();
        const ext = path.extname(files.image.name);
        const filePath = `${targetDirectory}/${imageId}${ext}`;

        // Create directory if non-existant
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory);
        }

        try {
            fs.renameSync(files.image.path, filePath);
        } catch (err) {
            console.log(err)
            res.status(500).send();
        } finally {
            res.end();
        }
    });

    // Display success message
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
});

// Send the requested (compressed) category of images, if they exist
app.get('/image', (req, res) => {
    const category = path.parse(req.query.img).name;
    const imageDirectory = __dirname + "/images/";
    const targetDirectory = imageDirectory + category + '/';

    console.log(`requesting category ${category}`);
    console.log('zipping files');

    const tempZip = `/tmp/${category}.zip`;

    // Create compression stream
    let output = fs.createWriteStream(tempZip);
    let archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
    });

    // Compress, send, delete
    output.on('close', () => {
        console.log('finished archiving');
        res.sendFile(tempZip, () => {
            fs.unlinkSync(tempZip);
        });
        console.log('sent file');
    });

    // Set archive target
    archive.pipe(output);

    // Send target files
    output.on('open', () => {
        archive.directory(targetDirectory, false);
        archive.finalize();
    });
});

// Start the server
app.listen(port, (res) => {
    console.log(`Server running on port${port}`);
});

