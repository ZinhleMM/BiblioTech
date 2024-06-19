const express = require("express");
const router = express.Router();
const notifier = require('node-notifier');


///////////////// SEARCH QUERY FUNCTIONS //////////////////////////////////////////////////////////////
async function searchOpenLibrary(req,res)
{
  results = [];
  searchISBNs = [];
  titleSearchDepth = 20;
  // search by ISBN
  if(req.body.isbn != undefined && req.body.isbn != "" && validateISBN(req.body.isbn))  // user has entered a valid ISBN to search by
  {
      searchISBNs.push(req.body.isbn);
  }

  // retrieve ISBNs by title search
  if(req.body.title != undefined && req.body.title != "") // user has entered a title
  {
    olTitleQuery = "https://openlibrary.org/search.json?title=";
    titleWords = req.body.title.split(' ');
    for(let w = 0; w < titleWords.length; w++)
    {
      olTitleQuery = olTitleQuery + "+" + titleWords[w];
    }
    
    await fetch(olTitleQuery)
    .then(response => response.text())
    .then(text => {
      titleJSON = JSON.parse(text);
      
      for(let t = 0; t < titleJSON.docs.length && t < titleSearchDepth; t++)
      {
        // take the first ISBN for any given set of editions
        if(titleJSON.docs[t].isbn != undefined && (String(titleJSON.docs[t].isbn[0]).length ==13 || String(titleJSON.docs[t].isbn[0]).length ==10))
        {
          searchISBNs.push(titleJSON.docs[t].isbn[0]); // take the first given ISBN for each entry
        }
      }
      console.log(searchISBNs);
    })
  }
  

  // search by Author
  if(req.body.author != undefined && req.body.author != "") // user has entered an author
  {
    console.log(req.body.author);
  }


  // retrieve specified results individually
  for(let i = 0; i < searchISBNs.length; i++)
  {
    olquery = "https://openlibrary.org/isbn/" + String(searchISBNs[i]) + ".json"; // create the query
    let olResult;
    await fetch(olquery)
    .then(response => response.text())
    .then(text => {
      olResult = JSON.parse(text);

      if(olResult != undefined && olResult.authors != undefined &&olResult.error == undefined) // item found
      {
        // Open Library has authors listed not by name but with their ID so this requires another query
        ol_authorQuery = "https://openlibrary.org" + olResult.authors[0].key + ".json";
        fetch(ol_authorQuery)
        .then(response => response.text())
        .then(text => {
          authorJSON = JSON.parse(text);
          authorStr= authorJSON.name;
          results.push(reduceOL_JSON(olResult, authorStr));
          })
        }
      })
  }
  
  return results;
}

// code for searching the Library of Congress by ISBN, Title, and Author
async function searchLoC(req,res)
{
  results = []; // this is the array of results that will be rendered
  locIDs = []; // this array stores the LoC item ID values returned by searches to be individually retrieved
  searchISBN = "";

  titleSearchDepth = 3; // how many results from any given query to consider
  // queries by author and title will return a large list of material that 
  // range very far from the original search term

  authorSearchDepth = 10; // author searches are more likely to be exploratory
  // and should yield a greater number of results than title searches

  if(req.body.isbn != undefined && req.body.isbn != "" && validateISBN(req.body.isbn))  // user has entered a valid ISBN to search by
  {
    searchISBN=req.body.isbn; // retrieve the ISBN
    query="https://www.loc.gov/search/?q=" + String(searchISBN) + "&fo=json";  // create the first search query 

    // SEARCH LIBRARY OF CONGRESS
    await fetch(query)
    .then(response => response.text())
    .then(text => {
        searchData = JSON.parse(text);  // create a JSON object from the search result
        if(searchData.results.length==0) // console log to help fine tune searches during development
        {
          console.log("ISBN not found in Library of Congress");
        }
        else{
          for(let i = 0; i < searchData.results.length; i++)
          { 
            // take the LOC id of each result, which is at the end of a URL to that item's page
            console.log("ID is " + searchData.results[i].id);
            temp = String(searchData.results[i].id.split("/").pop());
            locIDs.push(temp);   // add to the list of results
          }
        } 
      })
  }
  
  if(req.body.title != undefined && req.body.title != "") // user has entered a title
  {
    // search LOC by title string and push to results
    titleQueryLOC = "https://www.loc.gov/search/?q=title:" + String(req.body.title) + "&fo=json";
    console.log("title query is " + titleQueryLOC);
    await fetch(titleQueryLOC) // search by title
        .then(response => response.text())
        .then(text => {
          searchData = JSON.parse(text);  // create a JSON object from the search result
          //console.log(searchData.results);
          
          if(searchData.results.length==0) // console log to help fine tune searches during development
          {
            console.log("Title not found in Library of Congress");
          }
          else{
            for(let i = 0; i < searchData.results.length; i++)
            { 
              // take the LOC id of each result, which is at the end of a URL to that item's page
              urlTokens = searchData.results[i].id.split("/");
              id = urlTokens.pop();
              if(id == "")
              {
                id=urlTokens.pop();
              }
                         
              if(!isNaN(id)) // if the id given by the result is numeric
              {
                locIDs.push(id);   // add to the list of results
              }
 
            }
          } 
        })
  }
  console.log(locIDs);
  if(req.body.author != undefined && req.body.author != "") // user has entered an author
  {
    console.log(req.body.author);
  }

  // retrieve items from LoC by LoCID
  for(let j = 0; j < locIDs.length; j++)
  {
    console.log(j);
    itemQuery = "https://www.loc.gov/item/" + String(locIDs[j]) + "/?fo=json";  // create a new query string
    console.log(itemQuery);
    await fetch(itemQuery) // grab the individual item with a second query
      .then(response => response.text())
      .then(text => {
        locData = JSON.parse(text); // parse that into a JSON object
        results.push(reduceLOC_JSON(locData, searchISBN)); // add the result to the       
      })
  }

  return results;


}

// this function is called by main.js and then calls individual search methods, 
//compiling them together into an array of results that can be sent to search_results.ejs
async function searchBook(req, res)
{
  results = []; // this is the array of results that will be rendered
  results.concat(await searchOpenLibrary(req,res));  // search Open Library
  //results.concat(await searchLoC(req,res));  // search Library of Congress

  return results;
}


//////////////// LOC and Book Information Validation Functions ///////////////////////////////////////////
// checks that given number is either 10 or 13 digits
function validateISBN(test)
{
  numDigits = test.toString().length;
  if(numDigits == 10 || numDigits ==13)
  {
    return true;
  }
  else
  { 
    //notifier.notify({title:"Alert!",message:"ISBN must be 10 or 13 digits.",
      //sound: true, wait: true});
    return false;
  }
}

// checks that book to be entered into the database is valid
function validateBook(book)
{
  if(!validateISBN(book.isbn)){
    //return false;
  }
  else
  {
    // other conditions for data validation
  }
  return true;
}


// reduces a Library of Congress JSON to a smaller object with the specific values we want
function reduceLOC_JSON(obj, arg_isbn = "")
{
  titleString = "";
  if( obj.item.title != undefined) // make sure the data exists
  {
    titleString = obj.item.title;
  }

  dateString = "";
  if(obj.item.date != undefined)
  {
    dateString = obj.item.date;
  }

  // generate a single string from the contributor list JSON object
  authorString ="";
  if(obj.item.contributor_names != undefined)
  {
    for(var i = 0; i<obj.item.contributor_names.length; i++){
      
      temp = obj.item.contributor_names[i].split(', '); // break the name appart and then put back together
      authorString += temp[1] + " " + temp[0]; // ignore later fields
      if(i < obj.item.contributor_names.length-1) // add a separator if more names follow
      {
        authorString += "; ";
      }
    }
  }

  if(obj.item.created_published != undefined)
  {
    // multiple publications can be stored, our app is only pulling the first
    publication = obj.item.created_published[0].split(':');
    if(publication.length >= 2) // if the publication data was broken by a colon
    {
      publication[0] = publication[0].trim();
      publication[1] = publication[1].split(',')[0].trim();  // remove spaces around the edges
    }
    else // add a blank string to represent missing data on publication location
    {
      publication.push("");
    }
    
  }
  else
  {
    publication = [];
    publication.push("");
    publication.push("");
  }

  
  descString = "";
  if(obj.item.description != undefined) // check that the data field exists
  {
    console.log(obj.item.description);
    // pulls first description string
    for(let d = 0; d < obj.item.description.length; d++)
    {
      tString = obj.item.description[d];
      if(tString[0]=='"')  // remove quotes 
      {
        tString = tString.substring(1,tString.length-1);
      }
      descString = descString.concat(" ");
      descString = descString.concat(tString);
    }
  }
  
  
  
  // return a smaller JSON object to update data fields and the application database
  bookData = {title:titleString,author:authorString,year:dateString,isbn:arg_isbn,publisher:publication[1],publisher_loc:publication[0],description:descString}
  return bookData;
}

//////////////// OPEN LIBRARY FUNCTION 
function reduceOL_JSON(obj, authorString)
{
  titleString = ""; 
  if(obj.title != undefined) // check that data exists
  {
    titleString = obj.title;
  }

  
  dateString ="";
  if(obj.publish_date != undefined) // check that the data exists
  {
    dateString = obj.publish_date;
    dateString = dateString.substring(dateString.length-5, dateString.length); // get the last four characters for the year
  }
    
  // ADD CODE FOR ISBN10
  // make sure the input has a valid ISBN13 due to some erratically entered results in OL
  isbnInput = "";  // 
  if(obj.isbn_13 != undefined && obj.isbn_13.length > 0)
  {
    isbnInput = obj.isbn_13[0];
  }

  pubString = "";
  if(obj.publishers != undefined && obj.publishers[0] != undefined)
  {
    pubString = obj.publishers[0];
  }

  bookData = {title:titleString, author:authorString, year:parseInt(dateString), isbn:isbnInput, publisher:pubString, publisher_loc:"", description:""}
  return bookData;
}

module.exports = {searchBook, validateISBN, validateBook, reduceLOC_JSON};

