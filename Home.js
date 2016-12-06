//Global variables
var sql;
var sitesProcessed;
var percentProcessed;

function analyizeWebsites() {

    if (requiredValueMissing()) {
        return;
    }
    
    document.getElementById("progress").setAttribute("style", "width:5%");
    sql = "";
    sitesProcessed = 0;
    percentProcessed = 0;
    createSQLTable();

    //good websites
    var goodURL1 = document.getElementById('good1').value;
    queryWebsite(goodURL1, '1');

    var goodURL2 = document.getElementById('good2').value;
    queryWebsite(goodURL2, "2");

    var goodURL3 = document.getElementById('good3').value;
    queryWebsite(goodURL3, "3");

    //bad websites
    var badURL1 = document.getElementById('bad1').value;
    queryWebsite(badURL1, "4");

    var badURL2 = document.getElementById('bad2').value;
    queryWebsite(badURL2, "5");

    var badURL3 = document.getElementById('bad3').value;
    queryWebsite(badURL3, "6");
}

function handleSiteData(header, siteURL, siteNumber) {
    buildSQLfromHeader(header, siteURL, siteNumber);
    sitesProcessed ++;
}

function createSQLTable() {
    sql += "CREATE TABLE GoogleWebsites(WebsiteName varchar(255), PageURL varchar(255), SearchRanking(int), SearchTerm varchar(255), WordpressSite(int), PageHasTitle(ing), PageUsesGoogleAnalytics(int), PageSupportsIE9(int), HTTPSUsed(int));\n";
}

//Parse/match header string and build SQL statement
function buildSQLfromHeader(header, siteURL, siteNumber) {

    var websiteName = extractDomain(siteURL);
    var pageURL = siteURL;
    var searchRanking = siteNumber;
    var searchTerm = document.getElementById('keyword').value;

    var wordpresSite = 0;
    var pageHasTitle = 0;
    var pageUsesGoogleAnalytics = 0;
    var pageSupportsIE9 = 0;
    var httpsUsed = 0;

    if (header[0].indexOf("wordpress") != -1) {
        wordpresSite = 1;
    }

    if (header[0].indexOf("<title>") != -1) {
        pageHasTitle = 1;
    }

    if (header[0].indexOf("google-analytics") != -1) {
        pageUsesGoogleAnalytics = 1;
    }

    if (header[0].indexOf("IE-9") != -1) {
        pageSupportsIE9 = 1;
    }

    if (pageURL.toLowerCase().indexOf("https") != -1) {
        httpsUsed = 1;
    }

    sql += "INSERT INTO GoogleWebsites (WebsiteName, PageURL, SearchRanking, SearchTerm, WordpressSite, PageHasTitle, PageUsesGoogleAnalytics, PageSupportsIE9, HTTPSUsed) VALUES ('" + websiteName + "', '" + pageURL + "', '" + searchRanking + "', '" + searchTerm + "', '" + wordpresSite + "', '" + pageHasTitle + "', '" + pageUsesGoogleAnalytics + "', '" + pageSupportsIE9 + "', '" + httpsUsed + "');\n";

}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function outputSQLFile() {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sql));
    pom.setAttribute('download', 'testProject.txt');

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

//http://stackoverflow.com/questions/15005500/loading-cross-domain-html-page-with-ajax
function queryWebsite(siteURL, siteNumber) {
    var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');

    $.get(http + '//cors-anywhere.herokuapp.com/' + siteURL,
        function (response) {
            //http://stackoverflow.com/questions/13471840/how-to-get-head-and-body-tags-as-a-string-from-html-string
            var header = response.match(/<head[^>]*>[\s\S]*<\/head>/gi);

            percentProcessed += 15;    
            document.getElementById("progress").setAttribute("style", "width:" + percentProcessed + "%");
            handleSiteData(header, siteURL, siteNumber);

            if (sitesProcessed === 6){
                outputSQLFile();
                document.getElementById("progress").setAttribute("style", "width:100%");
            }

        });
}

function requiredValueMissing() {

    var websiteNotFound = false;

    if (!document.getElementById('keyword').value) {
        websiteNotFound = true;
    } else if (!document.getElementById('good1').value) {
        websiteNotFound = true;
    } else if (!document.getElementById('good2').value) {
        websiteNotFound = true;
    } else if (!document.getElementById('good3').value) {
        websiteNotFound = true;
    } else if (!document.getElementById('bad1').value) {
        websiteNotFound = true;
    } else if (!document.getElementById('bad2').value) {
        websiteNotFound = true;
    } else if (!document.getElementById('bad3').value) {
        websiteNotFound = true;
    } else {
        websiteNotFound = false;
    }

    if (websiteNotFound) {
        alert("Please enter your search term and the top and bottom 3 websites for analysis.")
        return true;
    } else {
        return false;
    }
}

function showHowTo() {
    alert("Use this keyword in Google to get your top and bottom ranking websites.  \n\nThese top and bottom 3 website will be analysed and an output file with executable SQL will be generated and downloaded to your local machine, ready for execution in a DBMS.");
}
