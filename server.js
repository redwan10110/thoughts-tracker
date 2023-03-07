const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require('uuid'); 

const port = 5000;

// middleware
app.use(express.static("public"));
app.use(express.json());


// Serve the notes.html file when the user requests the /notes route
app.get("/notes", function (req, res) {
  res.sendFile(__dirname + "/public/notes.html");
});

// Serve the index.html file for any other route
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// To GET all the notes
app.get("/api/notes", (req, res) => {

  // Read the contents of the db.json file
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      // Return a 500 Internal Server Error if there was an error reading the file
      res
        .status(500)
        .send({ error: "Could not read notes from the database." });
    } else {
      // Parse the contents of the file as JSON and return it as the response
      const notes = JSON.parse(data);
      res.send(notes);
    }
  });
});

// to add a new notes to the db.json
app.post('/api/notes', (req, res) => {
    // Read the contents of the db.json file
    fs.readFile('db.json', 'utf8', (err, data) => {
      if (err) {
        // Return a 500 Internal Server Error if there was an error reading the file
        res.status(500).send({ error: 'Could not read notes from the database.' });
      } else {
        // Parse the contents of the file as JSON
        const notes = JSON.parse(data);
  
        // Generate a unique ID for the new note
        const id = uuidv4();
  
        // Create a new note object with the request body and the generated ID
        const newNote = { id, ...req.body };
  
        // Add the new note to the notes array
        notes.push(newNote);
  
        // Write the updated notes array to the db.json file
        fs.writeFile('db.json', JSON.stringify(notes), (err) => {
          if (err) {
            // Return a 500 Internal Server Error if there was an error writing to the file
            res.status(500).send({ error: 'Could not save note to the database.' });
          } else {
            // Return the new note as the response
            res.send(newNote);
          }
        });
      }
    });
  });

//   To delete a note from db.json
app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
  
    // Read the current list of notes from the db.json file
    const notes = JSON.parse(fs.readFileSync('db.json'));
  
    // Find the note with the specified id
    const noteIndex = notes.findIndex(note => note.id === id);
  
    if (noteIndex !== -1) {
      // Remove the note from the list of notes
      notes.splice(noteIndex, 1);
  
      // Write the updated list of notes back to the db.json file
      fs.writeFileSync('db.json', JSON.stringify(notes));
  
      // Return a response indicating that the note was successfully deleted
      res.status(200).json({ message: 'Note deleted successfully' });
    } else {
      // Return a 404 error if the note was not found
      res.status(404).json({ error: 'Note not found' });
    }
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
