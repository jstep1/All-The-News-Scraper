// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
var app = module.exports = express();

app.use("/public", express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

var hbs = exphbs.create({
    defaultLayout: "main"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "newsapp";
var collections = ["news"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


//// Begin express routes

var results = [];
var count = 0;
app.locals.savedText = "Save some articles!";
app.locals.feedText = "Add some articles!";
app.locals.newsNotes = "No notes for this article yet."
app.locals.art_id = [];

// Main feed route


app.get("/", function(req, res) {
    db.news.find({}, function(err, found) {
        if (err) throw err
        if(found.length === 0) {
            console.log("Add some articles!")
        }
        else {
            for(var i=0; i < found.length; i++) {
                if(!results.includes(found[i].link)) {
                    results.push(found[i].link)
                }
            }
            app.locals.total = results.length;
            console.log(app.locals.total + " total");
            console.log(app.locals.newview);
        }
        
        res.render("feed", {"articles" : found})
        app.locals.newview = true;
    })
});

// Scrape website and update feed

app.get("/scrape", function(req, res) {

    request("http://www.clickhole.com/features/news/", function(error, response, html) {
    var $ = cheerio.load(html);

    $("div.summary-content").each(function(i, element) {
        var info = $(element).find(".headline");
        var article;
        if ($(info).text().includes(":")) {
            article = $(info).text().split(":");
        }
        else {
            article = $(info).text().split("!");
        }
        
        app.locals.newarticles = count;
        var title = article[0];
        var headline = article[1];
        var link = "http://clickhole.com" + $(info).find("a").attr("href");
        
        if (!results.includes(link)) {
        db.news.insert({
            title: title,
            headline: headline,
            link: link,
            following: 0,
            notes: []
        }, function(err, inserted) {
            if (err) throw err
            results.push(link)
            count++;
            app.locals.newarticles = count;
            }
        )
        }
        else {
            app.locals.newarticles = 0;
        }
        
    })
    app.locals.newview = false;
    app.locals.feedText = "";
    console.log("----------\nFeed up to date\n----------")
    res.redirect("/");
})
});

// Saved articles get route

app.get("/saved", function(req, res) {
    db.news.find({"following": 1}, function(err, found) {
        if (err) throw err;
        console.log(found);
        res.render("saved", {"savedArts" : found})
    })
})

// Save a note on an article post route

app.post("/saved/:artid", function(req, res) {
    var link = req.body.savelink;
    var notetxt = req.body.notetxt;
    console.log(notetxt);
    db.news.update({"following" : 1, "link" : link}, {$push : {"notes" : notetxt}}, function(err, found) {
        if (err) throw err;
    })
    res.redirect("/saved")
})

// Save an article post route

app.post("/save/:artid", function(req, res) {
    var link = req.body.link;
    app.locals.savedText = "";
    db.news.update({"link" : "" + link + ""}, {$set: {"following" : 1}});
    res.redirect("/");

})

// Delete from saved articles post route

app.post("/unsave/:artid", function(req, res) {
    var link = req.body.link;
    app.locals.savedText = "Save some articles!";
    db.news.update({"link" : "" + link + ""}, {$set: {"following" : 0}});
    res.redirect("/saved");
})

// Add an article note post route

app.post("/saved/:artid", function(req, res) {
    var note = req.body.notetxt;
    var link = req.body.savelink;
    db.news.update({"link" : "" + link + ""}, {$push: {"notes" : note}});
    res.redirect("/saved");
});

// Remove an article note post route

app.post("/saved/remove/:artid/:noteid", function(req, res) {
    var link = req.body.deletelink;
    var note = req.body.textnote;
    if (!app.locals.art_id.includes(req.body.artId)) {
    app.locals.art_id.push(req.body.artId);
    }
    console.log(note)
    db.news.update({"link" : "" + link + ""}, {$pull: {"notes": note}})
    res.redirect("/saved");
});


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
  