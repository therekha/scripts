// ==UserScript==
// @name     artblogcleaner
// @include https://www.tumblr.com/*
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// ==/UserScript==
console.log('start')
//checks each post
waitForKeyElements ("article", cleandash);

function badblog (nodetext, blogarray) {
  for (blog of blogarray) {
    if(nodetext.indexOf(blog) >= 0){
      return true;
    }
  }
  return false;
}


function cleandash(jnode) {
    let el = jnode;

    // hide all posts from a blog that are not tagged "my art"
  	var blogs = ['blog1', 'blog2'];
  	if(badblog($(el).children('header').text(), blogs)){
      if($(el).children().eq(2).text().indexOf('my art') < 0){
      	$(el).children().eq(1).hide();
      }
    }
  
    // hide all asks to a blogs
	if($(el).children().eq(1).text().indexOf('asked:') >= 0){
      var askblogs = ['blog1', 'blog2'];
      if(badblog($(el).children('header').text(), askblogs)){
        $(el).children().eq(1).hide();
      }
    }
}