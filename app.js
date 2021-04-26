const express = require("express");
const bParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();
//const day = date.getDate(); //bounding our module to a day variable

app.set('view engine', 'ejs');

app.use(bParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Insert cluster address with the password HERE!!!
// mongoose.connect("mongodb+srv://<admin-name:password@clusteradress.mongodb.net/todoDB>", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Do first task"
});
const item2 = new Item({
  name: "Do this"
});
const item3 = new Item({
  name: "Do that"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
//Find - looking for {}=all elements in db
  Item.find({}, function(err, results){
    if(err){
      console.log(err);
    } else {
      console.log(results);
    //checking the list for added default items
    if (results.length === 0) {
      //insertMany defaultItems
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Successfully uploaded new items!");
        }
      }); //insertMany
      //get back after inserting default items
      res.redirect("/");
    } //if (foundItems.length === 0)
    else {

      //rendering the values of "today" and "newListItems" to the list.ejs
        res.render("list", {listTitle: "day", newListItems: results});
    }
  }
  });
});

//CUSTOM ROUTING
  //getting custom routes
  app.get("/:newlist", (req, res) =>{
    const routeName = _.capitalize(req.params.newlist);

    List.findOne({name: routeName}, (err, results) => {
      if (!err){
        if(!results) {

          //create a new list
          const list = new List({
            name: routeName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + routeName);
        } else {
          //show an existing list
          res.render("list", {listTitle: results.name, newListItems: results.items})
        }
      }
    });
  });

//POST
//adding items from input of "list.ejs"
  app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({name: itemName});

    if (listName === "day") {
      newItem.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, (err, foundList)=> {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  }); // app.post("/")

  //app.post("/delete")
  app.post("/delete",(req, res)=>{
    const chceckedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "day") {
      Item.deleteOne({_id: chceckedItemId},(err)=>{
          if(err){console.log(err);
          } else {
      console.log("Successfully removed checked item");
    } //else
      });//delete.One
      res.redirect("/");
    } //if
//custom list item delete
    else {
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id: chceckedItemId}}}, function(err, results){
        if(!err){
          res.redirect("/" + listName);
        }
      });
    }

  });//app.post("/delete")

app.get("/about", function(req, res){
  res.render("about");
});

//setting up Heroku port routing
let port = process.env.PORT;
if(port == null || port == ""){
port = 3000;
};
app.listen(port, () =>{
  console.log("Server has started successfully!");
});
