const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ruchasoni05_db_user:Ruch%4074_%21@cluster0.z1vtjgg.mongodb.net/college-feedback?appName=Cluster0', { family: 4 })
  .then(()=>console.log('Connected'))
  .catch(e=>console.log(e.message));
