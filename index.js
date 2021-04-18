const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
 const fs = require('fs-extra');
 const fileUpload = require('express-fileupload');
 const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ktoki.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors());
//app.use(express.static('doctors'));
 app.use(fileUpload());

const port = 5000;

client.connect(err => {
    const serviceCollection = client.db("houseCleaning").collection("service");
    const reviewCollection = client.db("houseCleaning").collection("review");
    const bookCollection = client.db("houseCleaning").collection("book");
    const adminCollection = client.db("houseCleaning").collection("admin");

//add service

app.post('/addService',(req, res) => {
    const file = req.files.file;
    const serviceName = req.body.serviceName;
    const details = req.body.details;
    const price = req.body.price;
    console.log(file, serviceName, details,price);
    console.log("database connected")
    const newImg = file.data;
          const encImg = newImg.toString('base64');
  
          var image = {
              contentType: file.mimetype,
              size: file.size,
              img: Buffer.from(encImg, 'base64')
          };
  
          serviceCollection.insertOne({ serviceName, details, image, price })
              .then(result => {
                  res.send(result.insertedCount > 0);
              })
      })
      app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log("database connected")
            })
    });

    //add review
    app.post('/addReview', (req, res) => {
        reviewCollection.insertOne(req.body)
            .then(result => {
                res.send(result)
            })
    })
          app.get('/reviews', (req, res) => {
            reviewCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                    console.log("database connected")
                })
        });
        app.get('/book/:id', (req, res) => {
            const id = ObjectID(req.params.id)
            serviceCollection.find({ _id: id })
                .toArray((err,service) => {
                    console.log(service);
                    res.send(service[0]);
                })
        })
        app.post('/addAllBook',(req, res) => {
            const book = req.body;
            bookCollection.insertOne(book)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
          })
          app.get('/orderList', (req, res) => {
            bookCollection.find()
              .toArray((err, orders) => {
                res.send(orders);
              })
          })
        
        // update status
        app.patch('/updateOrderList/:id', (req, res) => {
            const id = ObjectID(req.params.id)
            bookCollection.updateOne({ _id: id },
                    {
                        $set: { status: req.body.status }
                    })
                    .then(result => {
                        res.send(result.modifiedCount > 0 )
                    })
            })
            
            app.get('/serviceList', (req, res) => {
                serviceCollection.find()
                  .toArray((err, orders) => {
                    res.send(orders);
                  })
              })
              //for delete option

              app.delete('/deleteClasses/:id', (req, res) => {
                const id = ObjectID(req.params.id)
                serviceCollection.deleteOne({ _id: id })
                  .then(result => {
                    res.send(result.deletedCount > 0)
                  })
              })

              //for booking list
              app.get('/bookingList', (req, res) => {
                bookCollection.find({ email: req.query.email })
                    .toArray((err, courses) => {
                        res.send(courses);
                    })
            })

            app.post('/addAdmin', (req, res) => {
                const email = req.body.email;
                adminCollection.insertOne({ email })
                    .then(result => {
                        res.send(result.insertedCount > 0);
                    })
            })
        
        
            app.get('/admin', (req, res) => {
                adminCollection.find({})
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            });
        
        
            app.post('/isAdmin', (req, res) => {
                const email = req.body.email;
                adminCollection.find({ email: email })
                    .toArray((err, admins) => {
                        res.send(admins.length > 0);
                    })
            })

    })
      app.get('/', (req, res) => {
        res.send("hello from db it's working working")
    })
app.listen(process.env.PORT || port)