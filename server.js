const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

const PORT = 5500;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);
// GET request for JSON notes
app.get('/api/notes', (req, res) => {
  // Send a message to the client
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(404);
    } else {
      // Convert string into JSON object

      const parsedNotes = JSON.parse(data);
      res.status(200).json(parsedNotes);
    }
  });


});

/**
 * Route params: id
 * Deleta o projeto associado ao id presente nos parâmetros da rota.
 */
// app.delete('/api/notes:id', (req, res) => {
//  });




//Delete Requst





app.delete('/api/notes/:id', (req, res) => {
  console.log(req.params.id);
  let id = req.params.id;

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(404);
    } else {
      // Convert string into JSON object

      let parsedNotes = JSON.parse(data);
      const deleted = parsedNotes.find((note) => note.id == id);
      console.log("Delited :", JSON.stringify(deleted));
      if (deleted) {
        parsedNotes = parsedNotes.filter(note => note.id !== id);
        fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>  {if(writeErr){
            console.error(writeErr)
          } else{
            console.info('Successfully Delete Note!');
            res.status(200).json({ message: `Note with ID ${id} successfully Deleted !! ` });
          }  }
        );

      } else {
        res.status(404).json({ message: "the note is not found " })
      }

    }
  });


  res.status(200);


});






// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a POST request was note
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new note
        parsedNotes.push(newNote);

        // Write updated note back to the file
        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated Notes!')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting Notes');
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://127.0.0.1:${PORT}`)
);
