//sample data for testing the recommendation algorithm
//previous books read and rated by user
const user = {
	prevReads: [
	  {
		title: 'Book A',
		author: 'John',
		language: 'English',
		genre: 'Mystery',
		ratings: 1.5
	  },
	  {
		title: 'Book B',
		author: 'Joan',
		language: 'English',
		genre: 'Drama',
		ratings: 5
	  },
	  {
		title: 'Book C',
		author: 'Alice',
		language: 'English',
		genre: 'Thriller',
		ratings: 3
	  }
	],
	language: ['English', 'Italian'],
	genres: ['Drama', 'Horror', 'Crime'],
	authors: ['John', 'Joan', 'Alice']
};

//others books on the platform
const books = [
{
	title: 'Book D',
	author: 'Bob',
	language: 'English',
	genre: 'Mystery',
	wishlist: 0,
},
{
	title: 'Book E',
	author: 'Alice',
	language: 'English',
	genre: 'Thriller',
	wishlist: 1,
},
{
	title: 'Book F',
	author: 'Joan',
	language: 'English',
	genre: 'Drama',
	wishlist: 1,
},
{
	title: 'Book G',
	author: 'John',
	language: 'Spanish',
	genre: 'Science',
	wishlist: 0,
},
{
	title: 'Book H',
	author: 'Alice',
	language: 'English',
	genre: 'Mystery',
	wishlist: 0,
},
{
	title: 'Book I',
	author: 'Eve',
	language: 'English',
	genre: 'Drama',
	wishlist: 0,
}
];
  
//functions that returns recommendatations with a percentage score
function userRecs(user, books) {
	const recommendations = [];	//empty array for recommendations
	
	//iterate over all books and calculate a recommendation score
	for (const book of books) {
		const bookScore = Math.round(calcScore(user, book) * 100);

		//push a object for each book
		recommendations.push({
		book: book.title,
		bookScore
		});
	}
	
	//sort the ascending on the bookScore
	recommendations.sort((a, b) => b.bookScore - a.bookScore);
	
	return recommendations;
}

//function to calcute recommandation scores
function calcScore(user, book) {
	//attribute weights
	const genreWeight = 0.3;
	const authorWeight = 0.2;
	const languageWeight = 0.2;
	const ratingWeight = 0.2;
	const wishlistWeight = 0.15;

	//get similarity score
	const genreScore = isFav(user.genres, book.genre);
	const authorScore = isFav(user.authors, book.author);
	const languageSore = user.language.includes(book.language) ? 1 : 0;
	const ratingSore = calcRating(user.prevReads, book.title);
	const wishlistSore = book.wishlist;

	//calculate average score
	const score =
		genreWeight * genreScore +
		authorWeight * authorScore +
		languageWeight * languageSore +
		ratingWeight * ratingSore +
		wishlistWeight * wishlistSore;

	//normalize score (0,1)
	const nScore = Math.min(Math.max(score, 0), 1);

	return nScore;
}
  
//compare genre and authors to favorites
function isFav (user, attribute) {
	if (user.includes(attribute)) {
	  return 1;
	} else {
	  return 0;
	}
}
  
  //calculate similarity of books user rated and attributes of other books 
function calcRating(books, title) {
	let rating = 0;
	let count = 0;

	for (readBook of books) {
		if (
		readBook.title !== title &&
		readBook.ratings !== undefined
		) {
		rating += readBook.ratings;
		count++;
		}
	}

	if (count == 0) {
		return 0;
	}

	//calculate average ration (based on 0-5 system)
	const avg = (rating / count)/5;

	return avg ; 
}
  
//output recommendations for sample input
const recommendations = userRecs(user, books);
console.log(recommendations);
