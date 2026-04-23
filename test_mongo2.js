const mongoose = require('mongoose');
mongoose.connect('mongodb://ruchasoni05_db_user:Ruch%4074_%21@ac-a1c6hyv-shard-00-00.z1vtjgg.mongodb.net:27017,ac-a1c6hyv-shard-00-01.z1vtjgg.mongodb.net:27017,ac-a1c6hyv-shard-00-02.z1vtjgg.mongodb.net:27017/college-feedback?ssl=true&replicaSet=atlas-a1c6hyv-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0')
  .then(()=>console.log('Connected'))
  .catch(e=>console.log(e.message));
