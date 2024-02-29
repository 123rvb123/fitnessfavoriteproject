const express = require('express')
const app = express()
const mongoose = require("mongoose");  //library to make it easier to work with mongodb schema based
const bodyParser = require('body-parser'); // translates form data into a format understandable by the server.

require('dotenv').config()

////////////////// CONNECTING WITH MONGODB /////////////////////
const uri = process.env.CONNECTIE
console.log(uri)

// Set up schema and model of an exercise
const exerciseSchema = new mongoose.Schema({
  titel: String,              //text
  beschrijving: String,       //text
  favorite: Boolean           //true-false
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Connect to DB
async function connect() {    //async allows tasks like fetching data w/o stopping execution of other code
  try {
    await mongoose.connect(uri);  //wait for connection then continues
    console.log("Connected to MongoDB");

    console.log(await Exercise.find());
  } catch (error) {  
    console.error(error);
  }
}

connect();
////////////////////////////////////////////////////////////////

// Helper Database functions
const getExercises = async () => {
  return await Exercise.find();     //looks for the exercises and returns it
}

const getFavorieten = async () => {
  let exercises = await getExercises();  //retreives exercises from database

  // Filter based on favorite attribute
  return exercises.filter(function (obj) {  //only filters on favorite with true
    return obj.favorite
  })
}

const toggleFavorite = async (exercise) => {
  // Toggle the value
  exercise.favorite = !exercise.favorite;  //toggles boolean between true and false

  // Save
  await exercise.save();
}

// Set up Server
app.set('view engine', 'ejs')
app.use(bodyParser.json());  //for req.body and acces submitted data from forms
app.use(bodyParser.urlencoded({extended: false})); //helps server understanding data like submit forms
app.use(express.urlencoded({extended: true })) //allows acces from information coming from forms
app.use(express.static(__dirname + '/')); //for static files working

const port = 3000

// Main page
app.get('/', async (req, res) => { 
  let oefeningenlijst = await getExercises();
  res.render('index', {oefeningenlijst})
})


// Remove to favorite
app.post('/', async (req, res) => {
  console.log('POST route home')
  let id = req.body.id;                                   // extracts id from request body

  // Find the specific exercise
  let exercise = await Exercise.findById(`${id}`)         // finds exercise by id

  // Toggle favorite
  await toggleFavorite(exercise)                          // toggles favorite 

  res.redirect('/')

})


// Add to favorite
app.post('/jouwoefeningen', async (req, res) => {
  console.log('POST route jouwoefeningen')
  let id = req.body.id;                                   // extracts id from request body

  // Find the specific exercise
  let exercise = await Exercise.findById(`${id}`)         // finds exercise by id

  // Toggle favorite
  await toggleFavorite(exercise)                          // toggles favorite 

  res.redirect('/jouwoefeningen')

})

// Favorite page
app.get('/jouwoefeningen', async (req, res) => {
  let oefeningenlijst = await getFavorieten();
  res.render('jouwoefeningen', {oefeningenlijst})
})

app.use((req,res) => {
  res.status(404).send('Sorry kan deze pagina niet vinden;')
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})