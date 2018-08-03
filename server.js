const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const youtube = require('./routes/youtube');
const auth = require('./routes/auth');
const connection = require('./db/database');

const wordnikApiKey = process.env.wordnikApi;

const port = process.env.PORT || 3000;
const app = express();


app.use(express.static(path.join(`${__dirname}/public`)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(apiRoutes);
app.use(youtube);
app.use(auth);

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Static route to serverHTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

async function getRandomUserName() {
  const randomAdj = await fetch(`https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=adjective&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=${wordnikApiKey}`)
    .then(res => res.json())
    .then(adj => adj.word);
  const randomNoun = await fetch(`https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=${wordnikApiKey}`)
    .then(res => res.json())
    .then(noun => noun.word);
  const userName = randomAdj.charAt(0).toUpperCase() + randomAdj.slice(1) + randomNoun.charAt(0).toUpperCase() + randomNoun.slice(1);
  return userName;
}

io.sockets.on('connection', async (socket) => {
  let LEADING_TIME = 0;
  const randomUserName = await getRandomUserName();
  const user = {
    userName: randomUserName,
    userId: undefined,
  };

  connection.query(`INSERT INTO users (userName, pass, email, isPublic, isInUse) VALUES ('${user.userName}', 'fakepassword', '${user.userName}@fake.com', true, true)`, (error, results) => {
    if (error) {
      console.log(`MYSQL Error on inserting temp user: ${user.userName}`);
      console.log('sending back other random, public userId...');
      connection.query('SELECT * FROM users WHERE isPublic = true AND isInUse = false', (publicErr, publicResult) => {
        if (publicErr) {
          console.error(publicErr);
        } else {
          console.log('Received all available users as ', publicResult);
          console.log('Sending back user: ', publicResult[0]);
          user.userId = publicResult[0].userId;
          user.userName = publicResult[0].userName;
          socket.emit('connected', user);
        }
      });
    } else {
      user.userId = results.insertId;
      socket.emit('connected', user);
      console.log(`Successfully added temp user to the DB: ${user.userName}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${user.userName} disconnected!`);
    if (user.userId) {
      connection.query(`UPDATE users SET isInUse = false WHERE userId = ${user.userId}`, (err) => {
        if (err) console.log(err);
        else console.log(`Successfully added user: ${user.userName} back to the available public IDs`);
      });
    }
  });

  // Listen for queue related events.
  socket.on('queueChange', () => {
    io.emit('queueChanged');
  });

  socket.on('markPlayed', () => {
    LEADING_TIME = 0;
    io.emit('syncWithServer', LEADING_TIME);
    io.emit('queueChanged');
  });

  socket.on('addVideo', () => {
    io.emit('queueChanged');
  });

  // Listen for chat related events
  socket.on('message', (message) => {
    io.emit('messageReceived', message);
  });

  // Handles a voting situation.
  // Still need to determine how we will use this and what our source of truth will be.
  socket.on('vote', (voteInfo) => {
    if (voteInfo.type === 'up') {
      io.emit('upvoteIncremented');
    } io.emit('downvoteIncremented');
  });

  socket.on('timeSync', (time) => {
    if (time > LEADING_TIME) {
      LEADING_TIME = time;
    }
    io.emit('syncWithServer', LEADING_TIME);
  });
});

server.listen(port, (err) => {
  if (err) console.log(err);
  else console.log(`Listening on port ${port}!`);
});

